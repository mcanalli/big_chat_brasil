import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { ClientEntity } from './client.entity';
import { MessageStatusHistoryEntity } from './message-status-history.entity';

/**
 * Registro individual do envio de mensagem.
 */
@Entity('messages')
export class MessageEntity {
  /**
   * PK da mensagem (UUID).
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * FK para a conversa (Thread).
   */
  @Column({ name: 'conversationId' })
  conversationId!: string;

  /**
   * Entidade da conversa associada.
   */
  @ManyToOne(() => ConversationEntity, (conv) => conv.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversationId' })
  conversation!: ConversationEntity;

  /**
   * FK para o cliente remetente.
   */
  @Column({ name: 'senderId' })
  senderId!: string;

  /**
   * Entidade do cliente remetente.
   */
  @ManyToOne(() => ClientEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'senderId' })
  sender!: ClientEntity;

  /**
   * Telefone de destino da mensagem.
   */
  @Column({ type: 'varchar', length: 20 })
  recipientPhone!: string;

  /**
   * Canal de envio: SMS ou WHATSAPP.
   */
  @Column({ type: 'enum', enum: ['SMS', 'WHATSAPP'] })
  channel!: 'SMS' | 'WHATSAPP';

  /**
   * Direção da mensagem: inbound (recebida) ou outbound (enviada).
   */
  @Column({
    type: 'enum',
    enum: ['inbound', 'outbound'],
    default: 'outbound',
  })
  direction!: 'inbound' | 'outbound';

  /**
   * Tipo da mensagem: text ou media.
   */
  @Column({
    type: 'enum',
    enum: ['text', 'media'],
    default: 'text',
  })
  type!: 'text' | 'media';

  /**
   * Conteúdo/Texto da mensagem.
   */
  @Column({ type: 'text' })
  content!: string;

  /**
   * Data/hora da solicitação de envio.
   */
  @CreateDateColumn({ type: 'timestamp' })
  timestamp!: Date;

  /**
   * Data/hora da última atualização de status.
   */
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  /**
   * Prioridade na fila de envio: normal ou urgent.
   */
  @Column({ type: 'enum', enum: ['normal', 'urgente'], default: 'normal' })
  priority!: 'normal' | 'urgente';

  /**
   * Estado atual no ciclo de vida da mensagem.
   */
  @Column({
    type: 'enum',
    enum: ['queued', 'processing', 'sent', 'delivered', 'read', 'failed'],
    default: 'queued',
  })
  status!: 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';

  /**
   * Custo cobrado pelo disparo (R$).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost!: number;

  /**
   * Histórico de transições de status da mensagem.
   */
  @OneToMany(() => MessageStatusHistoryEntity, (history) => history.message)
  statusHistory!: MessageStatusHistoryEntity[];
}
