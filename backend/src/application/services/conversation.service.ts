import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { ClientEntity } from '../../domain/entities/client.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(ClientEntity)
    private readonly clientRepo: Repository<ClientEntity>,
  ) {}

  async findOrCreate(
    clientId: string,
    recipientPhone: string,
    recipientName?: string,        // 3º Parâmetro: Nome do destinatário (string)
    entityManager?: EntityManager, // 4º Parâmetro: Manager da transação (opcional)
  ): Promise<ConversationEntity> {
    const manager = entityManager || this.conversationRepo.manager;

    let conversation = await manager.findOne(ConversationEntity, {
      where: { clientId, recipientPhone },
    });

    if (!conversation) {
      const client = await manager.findOne(ClientEntity, { where: { id: clientId } });
      if (!client) throw new NotFoundException('Client not found');

      conversation = manager.create(ConversationEntity, {
        clientId,
        recipientPhone,
        recipientName,
        unreadCount: 0,
      });
      await manager.save(conversation);
    } else if (recipientName && conversation.recipientName !== recipientName) {
      conversation.recipientName = recipientName;
      await manager.save(conversation);
    }

    return conversation;
  }

  async findByClient(clientId: string): Promise<ConversationEntity[]> {
    return this.conversationRepo.find({
      where: { clientId },
      order: { lastMessageTime: 'DESC' },
    });
  }

  async findById(id: string): Promise<ConversationEntity> {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: ['messages'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }
}