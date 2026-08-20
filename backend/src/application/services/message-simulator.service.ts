import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import { QueueService } from '../../infrastructure/queue/queue.service';

@Injectable()
export class MessageSimulatorService implements OnModuleInit {
  private readonly logger = new Logger(MessageSimulatorService.name);
  private isWorker = false;

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(MessageStatusHistoryEntity)
    private readonly statusHistoryRepo: Repository<MessageStatusHistoryEntity>,
    private readonly queueService: QueueService,
    private readonly dataSource: DataSource,
  ) {
    // Verifica se está rodando no processo do Worker
    this.isWorker = process.argv.some(arg => arg.includes('worker.js'));
  }

  onModuleInit() {
    if (this.isWorker) {
      this.logger.log('Iniciando Simulador de Ciclo de Vida de Mensagens...');
      // Executa a cada 5 segundos
      setInterval(() => this.processMessageStatuses(), 5000);
    }
  }

  async processMessageStatuses() {
    const now = new Date();

    try {
      // 1. queued -> processing (delay: 1-2s)
      // Como o processamento é rápido, pegamos mensagens com status queued
      await this.transitionStatus(
        'queued',
        'processing',
        0, // Praticamente imediato no próximo ciclo
        'Simulação: Worker iniciou o processamento'
      );

      // 2. processing -> sent (delay: > 2s)
      await this.transitionStatus(
        'processing',
        'sent',
        2000,
        'Simulação: Mensagem enviada ao provedor'
      );

      // 3. sent -> delivered (delay: 3-5s)
      await this.transitionStatus(
        'sent',
        'delivered',
        4000,
        'Simulação: Mensagem entregue ao dispositivo'
      );

      // 4. delivered -> read (delay: 5-10s)
      await this.transitionStatus(
        'delivered',
        'read',
        8000,
        'Simulação: Mensagem lida pelo destinatário',
        true // Habilita chance de falha
      );
    } catch (error) {
      this.logger.error(`Erro no simulador: ${error.message}`);
    }
  }

  private async transitionStatus(
    fromStatus: MessageEntity['status'],
    toStatus: MessageEntity['status'],
    delayMs: number,
    detailMessage: string,
    allowFailure = false
  ) {
    const thresholdDate = new Date(Date.now() - delayMs);

    const messages = await this.messageRepo.find({
      where: {
        status: fromStatus,
        updatedAt: LessThanOrEqual(thresholdDate),
      },
      take: 50, // Processa em lotes
    });

    for (const message of messages) {
      let targetStatus = toStatus;

      // Simulação de falha (5% de probabilidade)
      if (allowFailure && Math.random() < 0.05) {
        targetStatus = 'failed';
        detailMessage = 'Simulação de erro: Falha na entrega/leitura';
      }

      await this.updateStatus(message.id, targetStatus, detailMessage);
    }
  }

  private async updateStatus(
    messageId: string,
    status: MessageEntity['status'],
    details: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(MessageEntity, messageId, { 
        status,
        updatedAt: new Date() // Força atualização do updatedAt
      });

      const history = this.statusHistoryRepo.create({
        messageId,
        status,
        details,
      });
      await queryRunner.manager.save(history);

      await queryRunner.commitTransaction();
      
      // Notifica via RabbitMQ para que a API (SSE) receba
      this.queueService.publishStatusUpdate(messageId, status);
      
      this.logger.debug(`[Simulador] Mensagem ${messageId} movida para ${status}`);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erro ao atualizar status da mensagem ${messageId}: ${err.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
