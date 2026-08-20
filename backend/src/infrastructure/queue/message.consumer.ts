import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';

interface MessagePayload {
  messageId: string;
  priority: string;
  createdAt: Date;
}

@Controller()
export class MessageConsumer {
  private readonly logger = new Logger(MessageConsumer.name);
  private readonly ANTI_STARVATION_THRESHOLD_MS = 30000; // 30 segundos

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(MessageStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<MessageStatusHistoryEntity>,
    private readonly dataSource: DataSource,
  ) {}

  @EventPattern('bcb.messages.urgent')
  async handleUrgentMessage(
    @Payload() data: MessagePayload,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`[URGENT] Processing message: ${data.messageId}`);
    await this.processMessageWithAck(data, context);
  }

  @EventPattern('bcb.messages.normal')
  async handleNormalMessage(
    @Payload() data: MessagePayload,
    @Ctx() context: RmqContext,
  ) {
    this.logger.log(`[NORMAL] Processing message: ${data.messageId}`);

    // Lógica Anti-Starvation
    const waitTime = Date.now() - new Date(data.createdAt).getTime();
    if (waitTime > this.ANTI_STARVATION_THRESHOLD_MS) {
      this.logger.warn(
        `[ANTI-STARVATION] Message ${data.messageId} waited ${waitTime}ms. Boosting priority.`,
      );
    }

    await this.processMessageWithAck(data, context);
  }

  private async processMessageWithAck(data: MessagePayload, context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.processLifecycle(data.messageId);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(
        `Failed to process message ${data.messageId}: ${err.message}`,
      );

      // Verificação de retries (simplificada para o exemplo)
      // Em produção, usaríamos headers do RMQ (x-death) para contar retries
      const properties = originalMsg.properties;
      const deathCount = properties.headers?.['x-death']?.[0]?.count || 0;

      if (deathCount < 3) {
        this.logger.warn(`Re-enqueuing message ${data.messageId} (Retry ${deathCount + 1})`);
        channel.nack(originalMsg, false, true); // Requeue = true
      } else {
        this.logger.error(`Max retries reached for ${data.messageId}. Moving to DLQ.`);
        await this.updateStatus(
          data.messageId,
          'failed',
          `Max retries reached. Last error: ${err.message}`,
        );
        channel.nack(originalMsg, false, false); // Requeue = false (vai para DLQ se configurada)
      }
    }
  }

  private async processLifecycle(messageId: string) {
    // 1. Busca e valida se está elegível
    const message = await this.messageRepo.findOne({ where: { id: messageId } });

    if (!message) {
      throw new Error('Message not found in database');
    }

    if (message.status !== 'queued') {
      this.logger.warn(`Message ${messageId} is not in queued status (current: ${message.status}). Skipping.`);
      return;
    }

    // 2. queued -> processing
    await this.updateStatus(
      messageId,
      'processing',
      'Worker picked up the message',
    );

    // 3. Simular chamada ao provedor do WhatsApp
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const providerMessageId = `wa_msg_${Math.random().toString(36).substr(2, 9)}`;

    // 4. processing -> sent
    await this.updateStatus(
      messageId,
      'sent',
      `Sent to provider. Provider ID: ${providerMessageId}`,
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
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
