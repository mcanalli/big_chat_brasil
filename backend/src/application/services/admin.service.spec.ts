import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from '../../domain/entities/client.entity';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity';
import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import {
  AddCreditsDto,
  AdjustLimitDto,
} from '../../presentation/dtos/admin.dto';

describe('AdminService', () => {
  let service: AdminService;
  let clientRepo: jest.Mocked<Repository<ClientEntity>>;

  const mockClientPrepaid = {
    id: 'uuid-pre',
    planType: 'prepaid',
    balance: 50,
  } as ClientEntity;

  const mockClientPostpaid = {
    id: 'uuid-post',
    planType: 'postpaid',
    limit: 500,
    consumed: 0,
  } as ClientEntity;

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
      clientRepo.findOne.mockResolvedValue({
        ...mockClientPrepaid,
      });
      const dto: AddCreditsDto = { amount: 50 };
      const result = await service.addCredits('uuid-pre', dto);
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(100);
    });

    it('should throw BadRequestException if client is postpaid', async () => {
      clientRepo.findOne.mockResolvedValue({
        ...mockClientPostpaid,
      });
      const dto: AddCreditsDto = { amount: 50 };
      await expect(service.addCredits('uuid-post', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('adjustLimit', () => {
    it('should adjust limit of postpaid client', async () => {
      clientRepo.findOne.mockResolvedValue({
        ...mockClientPostpaid,
      });
      const dto: AdjustLimitDto = { newLimit: 1000 };
      const result = await service.adjustLimit('uuid-post', dto);
      expect(result.newLimit).toBe(1000);
    });
  });
});
