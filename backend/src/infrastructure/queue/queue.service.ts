import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class QueueService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
  ) {}

  async publishMessage(message: any) {
    // Usamos o nome da fila como o padrão do evento para o NestJS RMQ
    const pattern = message.priority === 'urgent' ? 'bcb.messages.urgent' : 'bcb.messages.normal';
    return this.client.emit(pattern, message);
  }
}

