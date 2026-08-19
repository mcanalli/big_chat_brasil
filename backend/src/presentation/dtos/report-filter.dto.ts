import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ReportFilterDto {
  @ApiPropertyOptional({ description: 'Data inicial para o filtro' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data final para o filtro' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ['queued', 'processing', 'sent', 'delivered', 'read', 'failed'],
  })
  @IsEnum(['queued', 'processing', 'sent', 'delivered', 'read', 'failed'])
  @IsOptional()
  status?: 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';

  @ApiPropertyOptional({ description: 'ID do cliente remetente' })
  @IsUUID()
  @IsOptional()
  senderId?: string;

  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  limit?: number = 10;
}
