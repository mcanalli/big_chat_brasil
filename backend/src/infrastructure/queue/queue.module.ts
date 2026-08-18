import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueueService } from './queue.service';
import { QueueController } from '../../presentation/controllers/queue.controller';

import { MessageConsumer } from './message.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity, MessageStatusHistoryEntity]),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://bcb_mq_user:bcb_mq_password@localhost:5672'],
          queue: 'bcb.messages.normal', // Fila padrão (será sobrescrita no emit se necessário ou usado roteamento)
          queueOptions: {
            durable: true,
            arguments: {
              'x-max-priority': 5,
            },
          },
        },
      },
    ]),
  ],
  providers: [QueueService, MessageConsumer],
  controllers: [QueueController],
  exports: [QueueService],
})
export class QueueModule {}

