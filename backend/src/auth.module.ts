import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { ClientEntity } from './domain/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientEntity])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
