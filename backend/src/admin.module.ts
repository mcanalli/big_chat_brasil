import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './application/services/admin.service';
import { AdminController } from './presentation/controllers/admin.controller';
import { ClientEntity } from './domain/entities/client.entity';
import { FinancialTransactionEntity } from './domain/entities/financial-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity, FinancialTransactionEntity])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
