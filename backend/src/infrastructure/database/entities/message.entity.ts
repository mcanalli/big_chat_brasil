import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { ClientEntity } from './client.entity';

export enum MessageUrgency {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
}

export enum MessageStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({
    type: 'enum',
    enum: MessageUrgency,
    default: MessageUrgency.NORMAL,
  })
  urgency: MessageUrgency;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.QUEUED,
  })
  status: MessageStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ClientEntity, (client) => client.messages)
  client: ClientEntity;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  conversationId: string;
}
