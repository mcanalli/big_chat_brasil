import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InitialSeeder } from './infrastructure/database/seeders/initial.seeder';
import { MessageModule } from './message.module';
import { AuthModule } from './auth.module';
import { ClientModule } from './client.module';
import { AdminModule } from './admin.module';

import { PricingModule } from './pricing.module';

@Module({
  imports: [
    // 1. O ConfigModule DEVE vir primeiro e ser global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Garante a leitura do .env na raiz do backend
    }),
    // 2. O TypeOrmModule deve carregar assincronamente via ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'bcb_user'), // fallback para bcb_user
        password: config.get<string>('DB_PASSWORD', 'bcb_password'),
        database: config.get<string>('DB_NAME', 'bcb_db'),
        autoLoadEntities: true,
        synchronize: true, // Apenas para dev
      }),
    }),
    AuthModule,
    ClientModule,
    PricingModule,

    AdminModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService, InitialSeeder],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly initialSeeder: InitialSeeder) {}

  async onModuleInit() {
    if (process.env.RUN_SEEDER === 'true') {
      await this.initialSeeder.seed();
    }
  }
}
