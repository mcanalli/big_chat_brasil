import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class PricingCacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly ttl: number;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = createClient({
      url: `redis://${host}:${port}`,
    });

    this.ttl = this.configService.get<number>(
      'PRICING_CACHE_TTL_SECONDS',
      3600,
    );

    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  private getCacheKey(channel: string, priority: string): string {
    return `pricing:channel:${channel}:priority:${priority}`;
  }

  async getCost(channel: string, priority: string): Promise<number | null> {
    const value = await this.client.get(this.getCacheKey(channel, priority));
    return value ? parseFloat(value) : null;
  }

  async setCost(channel: string, priority: string, cost: number): Promise<void> {
    await this.client.set(this.getCacheKey(channel, priority), cost.toString(), {
      EX: this.ttl,
    });
  }

  async invalidate(channel: string, priority: string): Promise<void> {
    await this.client.del(this.getCacheKey(channel, priority));
  }
}
