import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AiService } from './services/ai.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AiService],
})
export class AppModule {}
