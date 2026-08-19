import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessagePricingEntity } from '../../domain/entities/message-pricing.entity';
import { PricingCacheService } from '../../infrastructure/cache/pricing-cache.service';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('PricingService', () => {
  let service: PricingService;
  let cacheService: jest.Mocked<PricingCacheService>;
  let repo: jest.Mocked<Repository<MessagePricingEntity>>;
  let findOneMock: jest.Mock;
  let setCostMock: jest.Mock;
  let invalidateMock: jest.Mock;

  beforeEach(async () => {
    findOneMock = jest.fn();
    setCostMock = jest.fn();
    invalidateMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(MessagePricingEntity),
          useValue: {
            find: jest.fn(),
            findOne: findOneMock,
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PricingCacheService,
          useValue: {
            getCost: jest.fn(),
            setCost: setCostMock,
            invalidate: invalidateMock,
          },
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    cacheService = module.get(PricingCacheService);
    repo = module.get<Repository<MessagePricingEntity>>(
      getRepositoryToken(MessagePricingEntity),
    ) as jest.Mocked<Repository<MessagePricingEntity>>;
  });

  it('deve retornar custo do cache se disponível', async () => {
    (cacheService.getCost as jest.Mock).mockResolvedValue(0.25);
    const cost = await service.getCost('normal');
    expect(cost).toBe(0.25);
    expect(findOneMock).not.toHaveBeenCalled();
  });

  it('deve buscar do banco e salvar no cache em caso de cache miss', async () => {
    (cacheService.getCost as jest.Mock).mockResolvedValue(null);
    findOneMock.mockResolvedValue({
      id: 'uuid',
      priority: 'normal',
      cost: 0.25,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const cost = await service.getCost('normal');

    expect(cost).toBe(0.25);
    expect(findOneMock).toHaveBeenCalledWith({
      where: { priority: 'normal' },
    });
    expect(setCostMock).toHaveBeenCalledWith('normal', 0.25);
  });

  it('deve lançar NotFoundException se não encontrar no banco', async () => {
    (cacheService.getCost as jest.Mock).mockResolvedValue(null);
    findOneMock.mockResolvedValue(null);

    await expect(() => service.getCost('unknown')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve invalidar cache ao atualizar custo', async () => {
    findOneMock.mockResolvedValue({
      id: 'uuid',
      priority: 'normal',
      cost: 0.25,
    });
    (repo.save as jest.Mock).mockResolvedValue({
      id: 'uuid',
      priority: 'normal',
      cost: 0.3,
    });

    await service.updateCost('normal', 0.3);

    expect(invalidateMock).toHaveBeenCalledWith('normal');
  });
});
