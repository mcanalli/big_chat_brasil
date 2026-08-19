import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from './domain/entities/client.entity';
import { RecipientEntity } from './domain/entities/recipient.entity';
import { ClientService } from './application/services/client.service';
import { ClientController } from './presentation/controllers/client.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity, RecipientEntity])],
  controllers: [ClientController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientModule {}

