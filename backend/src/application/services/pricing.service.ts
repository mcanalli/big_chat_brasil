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

  async getCost(channel: string, priority: string): Promise<number> {
    const cachedCost = await this.cacheService.getCost(channel, priority);
    if (cachedCost !== null) {
      return cachedCost;
    }

    const pricing = await this.pricingRepo.findOne({ where: { channel, priority } });
    if (!pricing) {
      throw new NotFoundException(
        `Pricing for channel '${channel}' and priority '${priority}' not found`,
      );
    }

    const cost = Number(pricing.cost);
    await this.cacheService.setCost(channel, priority, cost);
    return cost;
  }

  async updateCost(
    channel: string,
    priority: string,
    cost: number,
  ): Promise<MessagePricingEntity> {
    let pricing = await this.pricingRepo.findOne({ where: { channel, priority } });

    if (pricing) {
      pricing.cost = cost;
    } else {
      pricing = this.pricingRepo.create({ channel, priority, cost });
    }

    const saved = await this.pricingRepo.save(pricing);
    await this.cacheService.invalidate(channel, priority);
    return saved;
  }
}
