import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty({
    example: 'Empresa Exemplo LTDA',
    description: 'Nome ou Razão Social',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '12345678000199',
    description: 'CPF ou CNPJ (apenas números)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 14)
  documentId: string;

  @ApiProperty({ enum: ['CPF', 'CNPJ'], example: 'CNPJ' })
  @IsEnum(['CPF', 'CNPJ'])
  @IsNotEmpty()
  documentType: 'CPF' | 'CNPJ';

  @ApiProperty({ enum: ['prepaid', 'postpaid'], example: 'prepaid' })
  @IsEnum(['prepaid', 'postpaid'])
  @IsNotEmpty()
  planType: 'prepaid' | 'postpaid';

  @ApiProperty({
    example: 100.0,
    description: 'Saldo inicial (apenas para pré-pago)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  balance?: number;

  @ApiProperty({
    example: 500.0,
    description: 'Limite inicial (apenas para pós-pago)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  limit?: number;
}
