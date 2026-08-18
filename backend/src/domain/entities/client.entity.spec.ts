import { ClientEntity } from './client.entity';

describe('ClientEntity', () => {
  it('should create a client entity instance', () => {
    const client = new ClientEntity();
    client.name = 'Test Client';
    client.documentId = '12345678901';
    client.documentType = 'CPF';
    client.planType = 'prepaid';
    client.balance = 100.0;
    client.limit = 0;
    client.consumed = 0;
    client.active = true;

    expect(client).toBeDefined();
    expect(client.name).toBe('Test Client');
    expect(client.documentId).toBe('12345678901');
    expect(client.documentType).toBe('CPF');
    expect(client.planType).toBe('prepaid');
    expect(client.balance).toBe(100.0);
    expect(client.limit).toBe(0);
    expect(client.consumed).toBe(0);
    expect(client.active).toBe(true);
  });

  it('should have associations defined', () => {
    const client = new ClientEntity();
    client.conversations = [];
    client.transactions = [];

    expect(client.conversations).toEqual([]);
    expect(client.transactions).toEqual([]);
  });
});
