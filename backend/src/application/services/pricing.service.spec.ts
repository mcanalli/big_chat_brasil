import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessagePricingEntity } from '../../domain/entities/message-pricing.entity';
import { PricingCacheService } from '../../infrastructure/cache/pricing-cache.service';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('PricingService', () => {
  let service: PricingService;
  let cacheService: jest.Mocked<PricingCacheService>;
  let repo: jest.Mocked<Repository<MessagePricingEntity>>;

  const makePricing = (cost: number) =>
    ({
      id: 'uuid',
      channel: 'WHATSAPP',
      priority: 'normal',
      cost,
      createdAt: new Date(),
      updatedAt: new Date(),
    }) as MessagePricingEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(MessagePricingEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PricingCacheService,
          useValue: {
            getCost: jest.fn(),
            setCost: jest.fn(),
            invalidate: jest.fn(),
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
    cacheService.getCost.mockResolvedValue(0.25);

    const cost = await service.getCost('WHATSAPP', 'normal');

    expect(cost).toBe(0.25);
    expect(repo.findOne).not.toHaveBeenCalled();
  });

  it('deve buscar do banco e salvar no cache em caso de cache miss', async () => {
    cacheService.getCost.mockResolvedValue(null);
    repo.findOne.mockResolvedValue(makePricing(0.25));

    const cost = await service.getCost('WHATSAPP', 'normal');

    expect(cost).toBe(0.25);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { channel: 'WHATSAPP', priority: 'normal' },
    });
    expect(cacheService.setCost).toHaveBeenCalledWith(
      'WHATSAPP',
      'normal',
      0.25,
    );
  });

  it('deve lançar NotFoundException se não encontrar no banco', async () => {
    cacheService.getCost.mockResolvedValue(null);
    repo.findOne.mockResolvedValue(null);

    await expect(service.getCost('WHATSAPP', 'unknown')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve invalidar cache ao atualizar custo', async () => {
    const currentPricing = makePricing(0.25);
    repo.findOne.mockResolvedValue(currentPricing);
    repo.save.mockResolvedValue({
      ...currentPricing,
      cost: 0.3,
    });

    await service.updateCost('WHATSAPP', 'normal', 0.3);

    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'WHATSAPP',
        priority: 'normal',
        cost: 0.3,
      }),
    );
    expect(cacheService.invalidate).toHaveBeenCalledWith('WHATSAPP', 'normal');
  });
});
