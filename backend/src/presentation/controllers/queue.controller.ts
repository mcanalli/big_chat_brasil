import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Get current queue status and statistics' })
  async getStatus() {
    const stats = await this.messageRepo
      .createQueryBuilder('message')
      .select('message.status', 'status')
      .addSelect('message.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.status')
      .addGroupBy('message.priority')
      .getRawMany();

    return {
      timestamp: new Date(),
      statistics: stats.map(s => ({
        status: s.status,
        priority: s.priority,
        count: parseInt(s.count, 10),
      })),
    };
  }
}
