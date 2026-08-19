import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagePricingEntity } from './domain/entities/message-pricing.entity';
import { PricingService } from './application/services/pricing.service';
import { PricingCacheService } from './infrastructure/cache/pricing-cache.service';
import { PricingController } from './presentation/controllers/pricing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MessagePricingEntity])],
  providers: [PricingService, PricingCacheService],
  controllers: [PricingController],
  exports: [PricingService], // Exportar para tornar visível a outros módulos
})
export class PricingModule {}
