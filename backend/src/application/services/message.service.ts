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
    private readonly dataSource: DataSource,
  ) {}

  async sendMessage(dto: SendMessageDto): Promise<MessageEntity> {
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

      const cost = dto.channel === 'WHATSAPP' ? 0.05 : 0.1;

      if (client.planType === 'prepaid') {
        if (Number(client.balance) < cost) {
          throw new HttpException('Insufficient balance', HttpStatus.PAYMENT_REQUIRED);
        }
        client.balance = Number(client.balance) - cost;
      } else {
        if (Number(client.consumed) + cost > Number(client.limit)) {
          throw new HttpException('Monthly limit exceeded', HttpStatus.PAYMENT_REQUIRED);
        }
        client.consumed = Number(client.consumed) + cost;
      }

      await queryRunner.manager.save(client);

      const conversation = await this.conversationService.findOrCreate(
        client.id,
        dto.recipientPhone,
        dto.recipientName,
      );

      const message = this.messageRepo.create({
        ...dto,
        conversationId: conversation.id,
        cost,
        status: 'queued',
      });

      const savedMessage = await queryRunner.manager.save(message);

      const history = this.statusHistoryRepo.create({
        messageId: savedMessage.id,
        status: 'queued',
        details: 'Message queued for sending',
      });
      await queryRunner.manager.save(history);

      conversation.lastMessageContent = dto.content;
      conversation.lastMessageTime = new Date();
      await queryRunner.manager.save(conversation);

      await queryRunner.commitTransaction();

      // Publicar no RabbitMQ após a transação ser concluída com sucesso
      await this.queueService.publishMessage(savedMessage);

      return savedMessage;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getReport(filter: ReportFilterDto) {
    const { startDate, endDate, status, senderId, page = 1, limit = 10 } = filter;
    const where: any = {};

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
}