import { Module } from '@nestjs/common';
import { RealTimeService } from './real-time.service';
import { RealTimeController } from './real-time.controller';

@Module({
  providers: [RealTimeService],
  controllers: [RealTimeController],
  exports: [RealTimeService],
})
export class RealTimeModule {}
