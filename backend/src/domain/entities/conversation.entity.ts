import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity';
import { MessageEntity } from './message.entity';
import { RecipientEntity } from './recipient.entity';

/**
 * Thread de conversa agrupando interações entre o cliente e um usuário final.
 */
@Entity('conversations')
export class ConversationEntity {
  /**
   * PK da conversa (UUID).
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * FK para o cliente dono da conversa.
   */
  @Column({ name: 'clientId' })
  clientId: string;

  /**
   * Entidade do cliente associada.
   */
  @ManyToOne(() => ClientEntity, (client) => client.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity;

  /**
   * FK para o destinatário (Recipient).
   */
  @Column({ name: 'recipientId', nullable: true })
  recipientId: string;

  /**
   * Entidade do destinatário associada.
   */
  @ManyToOne(() => RecipientEntity, (recipient) => recipient.conversations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'recipientId' })
  recipient: RecipientEntity;

  /**
   * Número de telefone do destinatário (com DDD).
   */
  @Column({ type: 'varchar', length: 20 })
  recipientPhone: string;

  /**
   * Nome ou identificação do destinatário final.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  recipientName: string;

  /**
   * Conteúdo da última mensagem trafegada.
   */
  @Column({ type: 'text', nullable: true })
  lastMessageContent: string;

  /**
   * Timestamp da última mensagem.
   */
  @Column({ type: 'timestamp', nullable: true })
  lastMessageTime: Date;

  /**
   * Quantidade de mensagens não lidas.
   */
  @Column({ type: 'integer', default: 0 })
  unreadCount: number;

  /**
   * Lista de mensagens pertencentes a esta conversa.
   */
  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages: MessageEntity[];

  @UpdateDateColumn()
  updatedAt: Date;
}

