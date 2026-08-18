import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ClientEntity } from './client.entity';

/**
 * Registro de movimentação financeira (crédito, débito, ajustes).
 */
@Entity('financial_transactions')
export class FinancialTransactionEntity {
  /**
   * PK da transação (UUID).
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * FK para o cliente impactado.
   */
  @Column({ name: 'clientId' })
  clientId: string;

  /**
   * Entidade do cliente impactado.
   */
  @ManyToOne(() => ClientEntity, (client) => client.transactions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'clientId' })
  client: ClientEntity;

  /**
   * Tipo da transação: Compra de crédito, pagamento de fatura, débito de envio, etc.
   */
  @Column({
    type: 'enum',
    enum: [
      'CREDIT_PURCHASE',
      'INVOICE_PAYMENT',
      'MESSAGE_DEBIT',
      'PLAN_CONVERSION',
      'ADJUSTMENT',
    ],
  })
  type:
    | 'CREDIT_PURCHASE'
    | 'INVOICE_PAYMENT'
    | 'MESSAGE_DEBIT'
    | 'PLAN_CONVERSION'
    | 'ADJUSTMENT';

  /**
   * Valor da transação (R$).
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  /**
   * Saldo ou consumo anterior à transação.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  previousBalance: number;

  /**
   * Novo saldo ou consumo após a transação.
   */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  newBalance: number;

  /**
   * Descrição ou motivo da transação.
   */
  @Column({ type: 'text', nullable: true })
  description: string;

  /**
   * Timestamp da ocorrência financeira.
   */
  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;
}
