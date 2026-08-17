import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity, ClientType } from '../../infrastructure/database/entities/client.entity';
import { MessageEntity, MessageStatus, MessageUrgency } from '../../infrastructure/database/entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(ClientEntity)
    private clientRepo: Repository<ClientEntity>,
    @InjectRepository(MessageEntity)
    private messageRepo: Repository<MessageEntity>,
  ) {}

  async sendMessage(clientId: string, data: { content: string, urgency: MessageUrgency, conversationId: string }) {
    const client = await this.clientRepo.findOne({ where: { id: clientId } });
    if (!client) throw new BadRequestException('Client not found');

    const cost = data.urgency === MessageUrgency.URGENT ? 0.50 : 0.25;

    // Validação Financeira
    if (client.type === ClientType.PRE_PAID) {
      if (Number(client.balance) < cost) {
        throw new BadRequestException('Insufficient balance');
      }
      client.balance = Number(client.balance) - cost;
    } else {
      if (Number(client.consumed) + cost > Number(client.limit)) {
        throw new BadRequestException('Monthly limit exceeded');
      }
      client.consumed = Number(client.consumed) + cost;
    }

    // Persistência Inicial
    const message = this.messageRepo.create({
      ...data,
      clientId,
      cost,
      status: MessageStatus.QUEUED,
    });

    await this.clientRepo.save(client);
    const savedMessage = await this.messageRepo.save(message);

    // TODO: Publicar no RabbitMQ (Faremos no QueueModule)
    
    return savedMessage;
  }
}
