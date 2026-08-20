import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePricingDto {
  @ApiProperty({ example: 'WHATSAPP' })
  @IsString()
  @IsNotEmpty()
  channel!: string;

  @ApiProperty({ example: 'normal' })
  @IsString()
  @IsNotEmpty()
  priority!: string;

  @ApiProperty({ example: 0.25 })
  @IsNumber()
  @IsPositive()
  cost!: number;
}
