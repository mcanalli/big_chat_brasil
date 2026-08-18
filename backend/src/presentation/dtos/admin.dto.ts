import { 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  Min, 
  IsOptional, 
  IsEnum 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCreditsDto {
  @ApiProperty({ example: 100.0, description: 'Valor dos créditos a adicionar' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ example: 'Compra via PIX', description: 'Descrição da transação' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class AdjustLimitDto {
  @ApiProperty({ example: 1000.0, description: 'Novo limite de crédito' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  newLimit!: number;
}

export class ConvertPlanDto {
  @ApiProperty({ enum: ['prepaid', 'postpaid'], example: 'postpaid' })
  @IsEnum(['prepaid', 'postpaid'])
  @IsNotEmpty()
  newPlanType!: 'prepaid' | 'postpaid';

  @ApiPropertyOptional({ example: 500.0, description: 'Limite inicial se for pós-pago' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  initialLimit?: number;
}