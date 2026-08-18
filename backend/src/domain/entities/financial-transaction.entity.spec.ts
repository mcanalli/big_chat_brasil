import { FinancialTransactionEntity } from './financial-transaction.entity';
import { ClientEntity } from './client.entity';

describe('FinancialTransactionEntity', () => {
  it('should create a financial transaction entity instance', () => {
    const transaction = new FinancialTransactionEntity();
    transaction.clientId = 'client-uuid';
    transaction.type = 'CREDIT_PURCHASE';
    transaction.amount = 50.0;
    transaction.previousBalance = 10.0;
    transaction.newBalance = 60.0;
    transaction.description = 'Top up';

    expect(transaction).toBeDefined();
    expect(transaction.clientId).toBe('client-uuid');
    expect(transaction.type).toBe('CREDIT_PURCHASE');
    expect(transaction.amount).toBe(50.0);
    expect(transaction.previousBalance).toBe(10.0);
    expect(transaction.newBalance).toBe(60.0);
    expect(transaction.description).toBe('Top up');
  });

  it('should have associations defined', () => {
    const transaction = new FinancialTransactionEntity();
    const client = new ClientEntity();
    
    transaction.client = client;

    expect(transaction.client).toBeInstanceOf(ClientEntity);
  });
});
