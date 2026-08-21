import {
  Injectable,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ConversationService } from './conversation.service';
import { QueueService } from '../../infrastructure/queue/queue.service';

import { SendMessageDto } from '../../presentation/dtos/send-message.dto';
import { ReportFilterDto } from '../../presentation/dtos/report-filter.dto';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import {
  BulkSendResponseDto,
  SendBulkMessageDto,
} from '../../presentation/dtos/send-bulk-message.dto';
import { InboundMessageDto } from '../../presentation/dtos/inbound-message.dto';

import { v4 as uuidv4 } from 'uuid';
import { PricingService } from './pricing.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepo: Repository<ClientEntity>,
    @InjectRepository(MessageStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<MessageStatusHistoryEntity>,
    private readonly conversationService: ConversationService,
    private readonly queueService: QueueService,
    private readonly pricingService: PricingService,

    private readonly dataSource: DataSource,
  ) {}

  async sendMessage(dto: SendMessageDto): Promise<MessageEntity> {
    console.log('[STEP 1] Início do processamento de sendMessage', { dto });
    const queryRunner = this.dataSource.createQueryRunner();

    console.log('[STEP 2] Conectando QueryRunner ao Pool do Postgres');
    await queryRunner.connect();

    console.log('[STEP 3] Iniciando Transação SQL');
    await queryRunner.startTransaction();

    try {
      console.log(
        '[STEP 4] Buscando cliente com Lock Pessimista (pessimistic_write)',
        { senderId: dto.senderId },
      );
      const client = await queryRunner.manager.findOne(ClientEntity, {
        where: { id: dto.senderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!client) {
        console.log('[STEP 4.1] Erro: Cliente não encontrado');
        throw new NotFoundException('Client not found');
      }

      const unitCost = await this.pricingService.getCost(
        dto.channel || 'WHATSAPP',
        dto.priority || 'normal',
      );
      const cost = unitCost;
      console.log('[STEP 5] Validando saldo/limite do cliente', {
        planType: client.planType,
        balance: client.balance,
        cost,
      });

      if (client.planType === 'prepaid') {
        if (Number(client.balance) < cost) {
          console.log('[STEP 5.1] Erro: Saldo insuficiente');
          throw new HttpException(
            'Insufficient balance',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }
        client.balance = Number(client.balance) - cost;
      } else {
        if (Number(client.consumed) + cost > Number(client.limit)) {
          console.log('[STEP 5.1] Erro: Limite mensal excedido');
          throw new HttpException(
            'Monthly limit exceeded',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }
        client.consumed = Number(client.consumed) + cost;
      }

      console.log(
        '[STEP 6] Buscando ou criando conversa via ConversationService',
      );
      const conversation = await this.conversationService.findOrCreate(
        client.id,
        dto.recipientPhone,
        dto.recipientName,
        queryRunner.manager,
      );

      console.log('[STEP 7] Persistindo entidade da Mensagem');
      const message = queryRunner.manager.create(MessageEntity, {
        senderId: dto.senderId,
        recipientPhone: dto.recipientPhone,
        content: dto.content,
        channel: dto.channel,
        priority: dto.priority,
        conversationId: conversation.id,
        cost,
        status: 'queued',
      });
      const savedMessage = await queryRunner.manager.save(message);

      console.log('[STEP 8] Atualizando histórico e dados da conversa');
      const history = queryRunner.manager.create(MessageStatusHistoryEntity, {
        messageId: savedMessage.id,
        status: 'queued',
        details: 'Message queued for sending',
      });
      await queryRunner.manager.save(history);

      conversation.lastMessageContent = dto.content;
      conversation.lastMessageTime = new Date();
      await queryRunner.manager.save(conversation);

      console.log('[STEP 8.1] Atualizando saldo/consumo do cliente');
      await queryRunner.manager.save(client);

      console.log('[STEP 9] Executando Commit da Transação');
      await queryRunner.commitTransaction();
      console.log('[STEP 10] Commit executado com sucesso');

      console.log('[STEP 11] Disparando evento assíncrono para o RabbitMQ');
      this.queueService.publishMessage(savedMessage);

      console.log('[STEP 12] Retornando resposta ao Controller');
      return savedMessage;
    } catch (err) {
      console.error(
        '[STEP ERROR] Ocorreu um erro na transação:',
        err instanceof Error ? err.message : String(err),
      );
      if (queryRunner.isTransactionActive) {
        console.log('[STEP ROLLBACK] Efetuando rollback da transação');
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      console.log('[STEP FINALLY] Liberando QueryRunner de volta para o Pool');
      await queryRunner.release();
    }
  }

  async sendBulkMessage(dto: SendBulkMessageDto): Promise<BulkSendResponseDto> {
    console.log('[BULK] Início do processamento de sendBulkMessage', {
      senderId: dto.senderId,
      recipientCount: dto.recipientPhones.length,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const client = await queryRunner.manager.findOne(ClientEntity, {
        where: { id: dto.senderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      const unitCost = await this.pricingService.getCost(
        dto.channel,
        dto.priority || 'normal',
      );
      const totalCost = unitCost * dto.recipientPhones.length;

      console.log('[BULK] Validando saldo/limite total', {
        planType: client.planType,
        totalCost,
      });

      if (client.planType === 'prepaid') {
        if (Number(client.balance) < totalCost) {
          throw new HttpException(
            'Insufficient balance for bulk operation',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }
        client.balance = Number(client.balance) - totalCost;
      } else {
        if (Number(client.consumed) + totalCost > Number(client.limit)) {
          throw new HttpException(
            'Monthly limit exceeded for bulk operation',
            HttpStatus.PAYMENT_REQUIRED,
          );
        }
        client.consumed = Number(client.consumed) + totalCost;
      }

      const savedMessages: MessageEntity[] = [];
      const bulkId = uuidv4();

      for (let i = 0; i < dto.recipientPhones.length; i++) {
        const phone = dto.recipientPhones[i];
        const name = dto.recipientNames ? dto.recipientNames[i] : undefined;

        const conversation = await this.conversationService.findOrCreate(
          client.id,
          phone,
          name,
          queryRunner.manager,
        );

        const message = queryRunner.manager.create(MessageEntity, {
          senderId: dto.senderId,
          content: dto.content,
          channel: dto.channel,
          recipientPhone: phone,
          conversationId: conversation.id,
          cost: unitCost,
          status: 'queued',
          priority: dto.priority || 'normal',
        });
        const savedMessage = await queryRunner.manager.save(message);
        savedMessages.push(savedMessage);

        const history = queryRunner.manager.create(MessageStatusHistoryEntity, {
          messageId: savedMessage.id,
          status: 'queued',
          details: 'Bulk message queued',
        });
        await queryRunner.manager.save(history);

        conversation.lastMessageContent = dto.content;
        conversation.lastMessageTime = new Date();
        await queryRunner.manager.save(conversation);
      }

      await queryRunner.manager.save(client);
      await queryRunner.commitTransaction();

      for (const msg of savedMessages) {
        await this.queueService.publishMessage(msg);
      }

      return {
        bulkId,
        totalRecipients: dto.recipientPhones.length,
        totalCost,
        status: 'accepted',
        queuedMessages: savedMessages.map((m) => ({
          messageId: m.id,
          recipientPhone: m.recipientPhone,
        })),
      };
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getReport(filter: ReportFilterDto) {
    const {
      startDate,
      endDate,
      status,
      senderId,
      page = 1,
      limit = 10,
    } = filter;
    const where: Record<string, any> = {};

    if (startDate && endDate) {
      where.timestamp = Between(new Date(startDate), new Date(endDate));
    }
    if (status) {
      where.status = status;
    }
    if (senderId) {
      where.senderId = senderId;
    }

    const [items, total] = await this.messageRepo.findAndCount({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      order: { timestamp: 'DESC' },
    });

    return {
      items,
      total,
      page: Number(page),
      lastPage: Math.ceil(total / Number(limit)),
    };
  }

  async getHistory(messageId: string): Promise<MessageStatusHistoryEntity[]> {
    return this.statusHistoryRepo.find({
      where: { messageId },
      order: { timestamp: 'ASC' },
    });
  }

  async receiveInboundMessage(dto: InboundMessageDto): Promise<MessageEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const client = await queryRunner.manager.findOne(ClientEntity, {
        where: { id: dto.clientId },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      const conversation = await this.conversationService.findOrCreate(
        client.id,
        dto.from,
        dto.senderName,
        queryRunner.manager,
      );

      const message = queryRunner.manager.create(MessageEntity, {
        senderId: client.id, // O cliente da plataforma é o destinatário lógico, mas o senderId na mensagem costuma referenciar o dono da conta
        content: dto.content,
        channel: dto.channel,
        recipientPhone: dto.from,
        conversationId: conversation.id,
        cost: 0,
        status: 'delivered',
        direction: 'inbound',
        type: 'text',
        priority: 'normal',
      });

      const savedMessage = await queryRunner.manager.save(message);

      const history = queryRunner.manager.create(MessageStatusHistoryEntity, {
        messageId: savedMessage.id,
        status: 'delivered',
        details: 'Inbound message received',
      });
      await queryRunner.manager.save(history);

      conversation.lastMessageContent = dto.content;
      conversation.lastMessageTime = new Date();
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await queryRunner.manager.save(conversation);

      await queryRunner.commitTransaction();

      // Opcional: Emitir para fila se houver processamento posterior ou Webhook de saída para o cliente
      // this.queueService.publishMessage(savedMessage);

      return savedMessage;
    } catch (err) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

