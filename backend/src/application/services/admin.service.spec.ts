import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from '../../domain/entities/client.entity';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity';
import { DataSource } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let clientRepo: any;

  const mockClientPrepaid = {
    id: 'uuid-pre',
    planType: 'prepaid',
    balance: 50,
  };

  const mockClientPostpaid = {
    id: 'uuid-post',
    planType: 'postpaid',
    limit: 500,
    consumed: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FinancialTransactionEntity),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                save: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    clientRepo = module.get(getRepositoryToken(ClientEntity));
  });

  describe('addCredits', () => {
    it('should add credits to prepaid client', async () => {
      clientRepo.findOne.mockResolvedValue({ ...mockClientPrepaid });
      const result = await service.addCredits('uuid-pre', { amount: 50 });
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(100);
    });

    it('should throw BadRequestException if client is postpaid', async () => {
      clientRepo.findOne.mockResolvedValue({ ...mockClientPostpaid });
      await expect(service.addCredits('uuid-post', { amount: 50 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('adjustLimit', () => {
    it('should adjust limit of postpaid client', async () => {
      clientRepo.findOne.mockResolvedValue({ ...mockClientPostpaid });
      const result = await service.adjustLimit('uuid-post', { newLimit: 1000 });
      expect(result.newLimit).toBe(1000);
    });
  });
});
