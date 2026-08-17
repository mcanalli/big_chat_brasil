import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity, MessageStatus } from '../database/entities/message.entity';

@Controller()
export class MessageConsumer {
  constructor(
    @InjectRepository(MessageEntity)
    private messageRepo: Repository<MessageEntity>,
  ) {}

  @EventPattern({ cmd: 'process_message' })
  async handleMessageProcess(@Payload() data: any) {
    console.log('Processing message:', data.id);
    
    // Simular processamento/envio
    await this.messageRepo.update(data.id, { status: MessageStatus.PROCESSING });
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula delay de rede

    await this.messageRepo.update(data.id, { status: MessageStatus.SENT });
    console.log('Message sent:', data.id);
  }
}
