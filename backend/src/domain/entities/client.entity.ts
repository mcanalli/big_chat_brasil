import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ConversationEntity } from './conversation.entity';
import { FinancialTransactionEntity } from './financial-transaction.entity';

/**
 * Representa a empresa ou pessoa física cliente da plataforma BCB.
 */
@Entity('clients')
export class ClientEntity {
  /**
   * Identificador único (UUID) do cliente.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Razão social ou nome completo do cliente.
   */
  @Column({ type: 'varchar', length: 255 })
  name: string;

  /**
   * CPF ou CNPJ sem formatação (Unique).
   */
  @Column({ type: 'varchar', length: 14, unique: true })
  documentId: string;

  /**
   * Tipo de documento do cliente (CPF ou CNPJ).
   */
  @Column({ type: 'enum', enum: ['CPF', 'CNPJ'] })
  documentType: 'CPF' | 'CNPJ';

  /**
   * Modalidade do plano contratado: prepaid (pré-pago) ou postpaid (pós-pago).
   */
  @Column({ type: 'enum', enum: ['prepaid', 'postpaid'] })
  planType: 'prepaid' | 'postpaid';

  /**
   * Saldo disponível para uso (plano pré-pago).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  /**
   * Limite de crédito mensal (plano pós-pago).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  limit: number;

  /**
   * Consumo acumulado no mês corrente (plano pós-pago).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  consumed: number;

  /**
   * Indica se o cliente está ativo no sistema.
   */
  @Column({ type: 'boolean', default: true })
  active: boolean;

  /**
   * Lista de conversas associadas a este cliente.
   */
  @OneToMany(() => ConversationEntity, (conversation) => conversation.client)
  conversations: ConversationEntity[];

  /**
   * Lista de transações financeiras associadas a este cliente.
   */
  @OneToMany(() => FinancialTransactionEntity, (transaction) => transaction.client)
  transactions: FinancialTransactionEntity[];

  @CreateDateColumn()
  createdAt: Date;
}
