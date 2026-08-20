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

  @Get(':channel/:priority')
  @ApiOperation({ summary: 'Get cost for a specific channel and priority' })
  async getCost(
    @Param('channel') channel: string,
    @Param('priority') priority: string,
  ) {
    const cost = await this.pricingService.getCost(channel, priority);
    return { channel, priority, cost };
  }

  @Patch()
  @ApiOperation({ summary: 'Update or create a pricing' })
  async update(@Body() dto: UpdatePricingDto) {
    return this.pricingService.updateCost(dto.channel, dto.priority, dto.cost);
  }
}
