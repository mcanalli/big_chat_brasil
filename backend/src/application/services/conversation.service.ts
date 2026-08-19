import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { RecipientEntity } from '../../domain/entities/recipient.entity';

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
    recipientName?: string,
    entityManager?: EntityManager,
  ): Promise<ConversationEntity> {
    const manager = entityManager || this.conversationRepo.manager;

    const recipient = await this.findRecipientOrCreate(
      clientId,
      recipientPhone,
      recipientName,
      manager,
    );

    let conversation = await manager.findOne(ConversationEntity, {
      where: { clientId, recipientPhone },
    });

    if (!conversation) {
      const client = await manager.findOne(ClientEntity, {
        where: { id: clientId },
      });
      if (!client) throw new NotFoundException('Client not found');

      conversation = manager.create(ConversationEntity, {
        clientId,
        recipientPhone,
        recipientId: recipient.id,
        recipientName: recipient.name || recipientPhone,
        unreadCount: 0,
      });
      await manager.save(conversation);
    } else {
      let updated = false;
      if (recipientName && conversation.recipientName !== recipientName) {
        conversation.recipientName = recipientName;
        updated = true;
      }
      if (!conversation.recipientId) {
        conversation.recipientId = recipient.id;
        updated = true;
      }
      if (updated) {
        await manager.save(conversation);
      }
    }

    return conversation;
  }

  async findRecipientOrCreate(
    clientId: string,
    phone: string,
    name?: string,
    entityManager?: EntityManager,
  ): Promise<RecipientEntity> {
    const manager = entityManager || this.conversationRepo.manager;
    let recipient = await manager.findOne(RecipientEntity, {
      where: { clientId, phone },
    });

    if (!recipient) {
      recipient = manager.create(RecipientEntity, {
        clientId,
        phone,
        name,
      });
      await manager.save(recipient);
    } else if (name && recipient.name !== name) {
      recipient.name = name;
      await manager.save(recipient);
    }

    return recipient;
  }

  async findByClient(clientId: string): Promise<ConversationEntity[]> {
    return this.conversationRepo.find({
      where: { clientId },
      relations: ['recipient'],
      order: { lastMessageTime: 'DESC' },
    });
  }

  async findById(id: string): Promise<ConversationEntity> {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: ['messages', 'recipient'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }
}
