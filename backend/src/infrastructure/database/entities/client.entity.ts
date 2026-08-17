import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MessageEntity } from './message.entity';

export enum ClientType {
  PRE_PAID = 'PRE_PAID',
  POST_PAID = 'POST_PAID',
}

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  identifier: string; // CPF ou CNPJ

  @Column({
    type: 'enum',
    enum: ClientType,
  })
  type: ClientType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  limit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  consumed: number;

  @OneToMany(() => MessageEntity, (message) => message.client)
  messages: MessageEntity[];
}
