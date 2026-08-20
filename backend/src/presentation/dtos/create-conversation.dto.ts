import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'O clientId é obrigatório' })
  @IsString({ message: 'O clientId deve ser uma string' })
  clientId!: string;

  @ApiProperty({
    description: 'Telefone do destinatário',
    example: '5511999999999',
  })
  @IsNotEmpty({ message: 'O recipientPhone é obrigatório' })
  @IsString({ message: 'O recipientPhone deve ser uma string' })
  recipientPhone!: string;

  @ApiProperty({
    description: 'Nome do destinatário (opcional)',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O recipientName deve ser uma string' })
  recipientName?: string;
}
