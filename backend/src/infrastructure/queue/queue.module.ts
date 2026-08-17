import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { QueueService } from './queue.service';
import { MessageConsumer } from './message.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from '../database/entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
    ClientsModule.register([
      {
        name: 'MESSAGE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URI || 'amqp://bcb_mq_user:bcb_mq_password@localhost:5672'],
          queue: 'bcb.messages.normal',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [QueueService, MessageConsumer],
  exports: [QueueService],
})
export class QueueModule {}
