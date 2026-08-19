import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SendMessageDto {
  @ApiProperty({ description: 'ID do cliente remetente' })
  @IsUUID()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    description: 'Número do destinatário (com DDD)',
    example: '5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @ApiPropertyOptional({ description: 'Nome do destinatário' })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @ApiProperty({ description: 'Conteúdo da mensagem' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ enum: ['SMS', 'WHATSAPP'], example: 'WHATSAPP' })
  @IsEnum(['SMS', 'WHATSAPP'])
  @IsNotEmpty()
  channel: 'SMS' | 'WHATSAPP';

  @ApiPropertyOptional({ enum: ['normal', 'urgente'], default: 'normal' })
  @IsEnum(['normal', 'urgente'])
  @IsOptional()
  priority?: 'normal' | 'urgente';
}
