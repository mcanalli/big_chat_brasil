import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';

export class AuthRequestDto {
  @ApiProperty({
    example: '12345678900',
    description: 'CPF ou CNPJ do cliente (apenas números)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11,14}$/, {
    message: 'documentId deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) contendo apenas números',
  })
  documentId: string;

  @ApiProperty({
    example: 'CPF',
    description: 'Tipo de documento',
    enum: ['CPF', 'CNPJ'],
  })
  @IsEnum(['CPF', 'CNPJ'])
  @IsNotEmpty()
  documentType: 'CPF' | 'CNPJ';
}
