import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MessageEntity } from './message.entity';

/**
 * Registro de auditoria das transições de status da mensagem.
 */
@Entity('message_status_history')
export class MessageStatusHistoryEntity {
  /**
   * PK do histórico (UUID).
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * FK para a mensagem associada.
   */
  @Column({ name: 'messageId' })
  messageId: string;

  /**
   * Entidade da mensagem associada.
   */
  @ManyToOne(() => MessageEntity, (msg) => msg.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: MessageEntity;

  /**
   * Status registrado no momento da transição.
   */
  @Column({
    type: 'enum',
    enum: ['queued', 'processing', 'sent', 'delivered', 'read', 'failed'],
  })
  status: 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';

  /**
   * Timestamp da alteração de status.
   */
  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  /**
   * Detalhes adicionais sobre a transição (ex: erro do provider).
   */
  @Column({ type: 'text', nullable: true })
  details: string;
}
