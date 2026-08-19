import { Test, TestingModule } from '@nestjs/testing';
import { QueueController } from './queue.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { Repository } from 'typeorm';

describe('QueueController', () => {
  let controller: QueueController;
  let repo: jest.Mocked<Repository<MessageEntity>>;

  beforeEach(async () => {
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { status: 'queued', priority: 'urgent', count: '5' },
          { status: 'sent', priority: 'normal', count: '10' },
        ]),
      }),
    } as unknown as jest.Mocked<Repository<MessageEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueController],
      providers: [
        { provide: getRepositoryToken(MessageEntity), useValue: repo },
      ],
    }).compile();

    controller = module.get<QueueController>(QueueController);
    repo = module.get(getRepositoryToken(MessageEntity));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return statistics', async () => {
    const result = await controller.getStatus();
    expect(result.statistics).toHaveLength(2);
    expect(result.statistics[0]).toEqual({
      status: 'queued',
      priority: 'urgent',
      count: 5,
    });
  });
});
