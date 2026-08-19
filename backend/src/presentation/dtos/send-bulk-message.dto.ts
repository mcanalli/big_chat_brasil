import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageChannel {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
}

export enum MessagePriority {
  NORMAL = 'normal',
  URGENTE = 'urgente',
}

export class SendBulkMessageDto {
  @ApiProperty({ example: 'b0a8d6e0-1234-4321-8765-a0b1c2d3e4f5' })
  @IsUUID()
  @IsNotEmpty()
  senderId!: string;

  @ApiProperty({ example: ['5511999999999', '5511988888888'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsNotEmpty()
  recipientPhones!: string[];

  @ApiProperty({ example: ['John Doe', 'Jane Doe'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipientNames?: string[];

  @ApiProperty({ example: 'Hello, this is a bulk message!' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: MessageChannel, example: 'WHATSAPP' })
  @IsEnum(MessageChannel)
  @IsNotEmpty()
  channel!: MessageChannel;

  @ApiProperty({
    enum: MessagePriority,
    example: 'normal',
    required: false,
    default: 'normal',
  })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority: MessagePriority = MessagePriority.NORMAL;
}

export class BulkSendResponseDto {
  @ApiProperty()
  bulkId!: string;

  @ApiProperty()
  totalRecipients!: number;

  @ApiProperty()
  totalCost!: number;

  @ApiProperty()
  status!: 'accepted';

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        messageId: { type: 'string' },
        recipientPhone: { type: 'string' },
      },
    },
  })
  queuedMessages!: Array<{ messageId: string; recipientPhone: string }>;
}
