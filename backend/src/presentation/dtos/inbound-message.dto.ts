import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InboundMessageDto {
  @ApiProperty({ description: 'ID do cliente destinatário' })
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({
    description: 'Número do remetente (cliente final)',
    example: '5511999999999',
  })
  @IsString()
  @IsNotEmpty()
  from!: string;

  @ApiProperty({ description: 'Nome do remetente (opcional)' })
  @IsString()
  @IsOptional()
  senderName?: string;

  @ApiProperty({ description: 'Conteúdo da mensagem' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: ['SMS', 'WHATSAPP'], example: 'WHATSAPP' })
  @IsEnum(['SMS', 'WHATSAPP'])
  @IsNotEmpty()
  channel!: 'SMS' | 'WHATSAPP';
}
