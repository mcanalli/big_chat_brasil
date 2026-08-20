import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('message_pricings')
@Index(['channel', 'priority'], { unique: true })
export class MessagePricingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20 })
  channel!: string;

  @Column({ type: 'varchar', length: 20 })
  priority!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
