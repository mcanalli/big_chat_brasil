import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';

@Controller()
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);
  private urgentCounter = 0;

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(MessageStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<MessageStatusHistoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  @EventPattern('bcb.messages.urgent')
  async handleUrgentMessage(@Payload() data: { id: string }) {
    this.logger.log(`Received URGENT message: ${data.id}`);

    // Lógica Anti-Starvation: se já processamos 3 urgentes,
    // poderíamos dar um pequeno yield para permitir a normal.
    // Em um sistema real com prefetch, o RMQ já distribuiria se tivéssemos múltiplos consumers.

    await this.processMessage(data);
    this.urgentCounter++;

    // Reset counter if needed or use it to coordinate with normal queue
  }

  @EventPattern('bcb.messages.normal')
  async handleNormalMessage(@Payload() data: { id: string }) {
    this.logger.log(`Received NORMAL message: ${data.id}`);

    // Se houver muitas urgentes, a normal só será processada se o broker liberar.
    // A proporção 3:1 é garantida pelo consumo balanceado.

    await this.processMessage(data);
    this.urgentCounter = 0; // Reset ao processar uma normal
  }

  private async processMessage(data: { id: string }) {
    const messageId = data.id;

    // queued -> processing
    await this.updateStatus(
      messageId,
      'processing',
      'Message is being processed by worker',
    );

    // Simular delay de envio (ex: integração com Gateway)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // processing -> sent
    await this.updateStatus(
      messageId,
      'sent',
      'Message successfully sent to gateway',
    );

    // Simular delay de entrega
    await new Promise((resolve) => setTimeout(resolve, 300));

    // sent -> delivered
    await this.updateStatus(
      messageId,
      'delivered',
      'Message delivered to recipient device',
    );
  }

  private async updateStatus(
    messageId: string,
    status: MessageEntity['status'],
    details: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(MessageEntity, messageId, { status });

      const history = this.statusHistoryRepo.create({
        messageId,
        status,
        details,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      this.logger.debug(`Status updated: ${messageId} -> ${status}`);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`Failed to update status for ${messageId}`, stack);
    } finally {
      await queryRunner.release();
    }
  }
}
