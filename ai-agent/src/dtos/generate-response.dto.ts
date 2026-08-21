import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GenerateResponseDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  senderId!: string;

  @IsString()
  @IsNotEmpty()
  recipientPhone!: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  channel!: string;
}
