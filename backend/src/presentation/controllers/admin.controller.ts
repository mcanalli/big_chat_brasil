import { Controller, Post, Patch, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from '../../application/services/admin.service';
import { AddCreditsDto, AdjustLimitDto, ConvertPlanDto } from '../dtos/admin.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('clients/:id/credits')
  @ApiOperation({ summary: 'Adicionar créditos a um cliente pré-pago' })
  async addCredits(@Param('id') id: string, @Body() addCreditsDto: AddCreditsDto) {
    return this.adminService.addCredits(id, addCreditsDto);
  }

  @Patch('clients/:id/limit')
  @ApiOperation({ summary: 'Ajustar limite de um cliente pós-pago' })
  async adjustLimit(@Param('id') id: string, @Body() adjustLimitDto: AdjustLimitDto) {
    return this.adminService.adjustLimit(id, adjustLimitDto);
  }

  @Post('clients/:id/convert-plan')
  @ApiOperation({ summary: 'Converter tipo de plano do cliente' })
  async convertPlan(@Param('id') id: string, @Body() convertPlanDto: ConvertPlanDto) {
    return this.adminService.convertPlan(id, convertPlanDto);
  }

  @Get('clients/:id/transactions')
  @ApiOperation({ summary: 'Listar transações financeiras do cliente' })
  async getTransactions(@Param('id') id: string) {
    return this.adminService.getTransactions(id);
  }
}
