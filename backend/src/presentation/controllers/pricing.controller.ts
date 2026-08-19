import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { PricingService } from '../../application/services/pricing.service';
import { UpdatePricingDto } from '../dtos/update-pricing.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Pricings')
@Controller('pricings')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  @ApiOperation({ summary: 'List all message pricings' })
  async findAll() {
    return this.pricingService.findAll();
  }

  @Get(':priority')
  @ApiOperation({ summary: 'Get cost for a specific priority' })
  async getCost(@Param('priority') priority: string) {
    const cost = await this.pricingService.getCost(priority);
    return { priority, cost };
  }

  @Patch()
  @ApiOperation({ summary: 'Update or create a pricing' })
  async update(@Body() dto: UpdatePricingDto) {
    return this.pricingService.updateCost(dto.priority, dto.cost);
  }
}
