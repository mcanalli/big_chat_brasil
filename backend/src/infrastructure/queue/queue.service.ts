import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MessageUrgency } from '../database/entities/message.entity';

@Injectable()
export class QueueService {
  constructor(
    @Inject('MESSAGE_SERVICE') private client: ClientProxy,
  ) {}

  async publishMessage(message: any) {
    const pattern = { cmd: 'process_message' };
    // Em uma implementação real com prioridade física, usaríamos routing keys diferentes
    // Aqui usamos o padrão do NestJS Microservices para simplicidade
    return this.client.emit(pattern, message);
  }
}
