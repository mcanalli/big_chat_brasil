import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './domain/entities/message.entity';
import { ClientEntity } from './domain/entities/client.entity';
import { ConversationEntity } from './domain/entities/conversation.entity';
import { RecipientEntity } from './domain/entities/recipient.entity';
import { MessageStatusHistoryEntity } from './domain/entities/message-status-history.entity';
import { MessageService } from './application/services/message.service';
import { ConversationService } from './application/services/conversation.service';
import { MessageSimulatorService } from './application/services/message-simulator.service';
import { MessageController } from './presentation/controllers/message.controller';
import { ConversationController } from './presentation/controllers/conversation.controller';
import { QueueModule } from './infrastructure/queue/queue.module';
import { PricingModule } from './pricing.module';
import { RealTimeModule } from './infrastructure/realtime/real-time.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      ClientEntity,
      ConversationEntity,
      RecipientEntity,
      MessageStatusHistoryEntity,
    ]),
    QueueModule,
    PricingModule,
    RealTimeModule,
  ],
  controllers: [MessageController, ConversationController],
  providers: [MessageService, ConversationService, MessageSimulatorService],
  exports: [MessageService, ConversationService],
})
export class MessageModule {}

