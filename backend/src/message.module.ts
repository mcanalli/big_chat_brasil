import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './domain/entities/message.entity';
import { ClientEntity } from './domain/entities/client.entity';
import { ConversationEntity } from './domain/entities/conversation.entity';
import { MessageStatusHistoryEntity } from './domain/entities/message-status-history.entity';
import { MessageService } from './application/services/message.service';
import { ConversationService } from './application/services/conversation.service';
import { MessageController } from './presentation/controllers/message.controller';
import { ConversationController } from './presentation/controllers/conversation.controller';
import { QueueModule } from './infrastructure/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      ClientEntity,
      ConversationEntity,
      MessageStatusHistoryEntity,
    ]),
    QueueModule,
  ],
  controllers: [MessageController, ConversationController],
  providers: [MessageService, ConversationService],
  exports: [MessageService, ConversationService],
})
export class MessageModule {}
