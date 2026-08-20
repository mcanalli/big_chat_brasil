import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class QueueService {
  constructor(@Inject('RABBITMQ_SERVICE') private client: ClientProxy) {}

  publishMessage(message: { id: string; priority?: string; timestamp: Date }) {
    const pattern =
      message.priority === 'urgente'
        ? 'bcb.messages.urgent'
        : 'bcb.messages.normal';

    const payload = {
      messageId: message.id,
      priority: message.priority || 'normal',
      createdAt: message.timestamp,
    };

    return this.client.emit(pattern, payload);
  }

  publishStatusUpdate(messageId: string, status: string) {
    return this.client.emit('message.status.updated', {
      messageId,
      status,
      timestamp: new Date(),
    });
  }
}
