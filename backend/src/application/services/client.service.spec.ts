import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from '../../domain/entities/client.entity';
import { NotFoundException } from '@nestjs/common';

describe('ClientService', () => {
  let service: ClientService;
  let repo: any;

  const mockClient = {
    id: 'uuid-1',
    name: 'Test Client',
    documentId: '12345678901',
    documentType: 'CPF',
    planType: 'prepaid',
    balance: 100,
    limit: 0,
    consumed: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([mockClient]),
            findOne: jest.fn().mockResolvedValue(mockClient),
            create: jest.fn().mockReturnValue(mockClient),
            save: jest.fn().mockResolvedValue(mockClient),
          },
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    repo = module.get(getRepositoryToken(ClientEntity));
  });

  it('should find all clients', async () => {
    const clients = await service.findAll();
    expect(clients).toEqual([mockClient]);
  });

  it('should find one client', async () => {
    const client = await service.findOne('uuid-1');
    expect(client).toEqual(mockClient);
  });

  it('should throw NotFoundException if client not found', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('wrong-id')).rejects.toThrow(NotFoundException);
  });

  it('should return balance information', async () => {
    const balance = await service.getBalance('uuid-1');
    expect(balance).toHaveProperty('available');
    expect(balance.available).toBe(100);
  });
});
