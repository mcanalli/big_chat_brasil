import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagePricingEntity } from '../../domain/entities/message-pricing.entity';
import { PricingCacheService } from '../../infrastructure/cache/pricing-cache.service';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(MessagePricingEntity)
    private readonly pricingRepo: Repository<MessagePricingEntity>,
    private readonly cacheService: PricingCacheService,
  ) {}

  async findAll(): Promise<MessagePricingEntity[]> {
    return this.pricingRepo.find();
  }

  async getCost(priority: string): Promise<number> {
    const cachedCost = await this.cacheService.getCost(priority);
    if (cachedCost !== null) {
      return cachedCost;
    }

    const pricing = await this.pricingRepo.findOne({ where: { priority } });
    if (!pricing) {
      throw new NotFoundException(
        `Pricing for priority '${priority}' not found`,
      );
    }

    const cost = Number(pricing.cost);
    await this.cacheService.setCost(priority, cost);
    return cost;
  }

  async updateCost(
    priority: string,
    cost: number,
  ): Promise<MessagePricingEntity> {
    let pricing = await this.pricingRepo.findOne({ where: { priority } });

    if (pricing) {
      pricing.cost = cost;
    } else {
      pricing = this.pricingRepo.create({ priority, cost });
    }

    const saved = await this.pricingRepo.save(pricing);
    await this.cacheService.invalidate(priority);
    return saved;
  }
}
