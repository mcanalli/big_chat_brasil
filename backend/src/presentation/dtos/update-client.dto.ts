import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateClientDto } from './create-client.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateClientDto extends PartialType(CreateClientDto) {
  @ApiProperty({ example: true, description: 'Status do cliente', required: false })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
