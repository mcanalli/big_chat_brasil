import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumer } from './message.consumer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('MessageConsumer', () => {
  let consumer: MessageConsumer;
  let messageRepo: jest.Mocked<Repository<MessageEntity>>;
  let historyRepo: jest.Mocked<Repository<MessageStatusHistoryEntity>>;
  let dataSource: jest.Mocked<DataSource>;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      update: jest.fn(),
      save: jest.fn(),
    },
  } as unknown as jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    messageRepo = {
      update: jest.fn(),
      findOne: jest.fn(),
    } as any;
    historyRepo = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<MessageStatusHistoryEntity>>;
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as jest.Mocked<DataSource>;

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }) as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageConsumer,
        { provide: getRepositoryToken(MessageEntity), useValue: messageRepo },
        {
          provide: getRepositoryToken(MessageStatusHistoryEntity),
          useValue: historyRepo,
        },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    consumer = module.get<MessageConsumer>(MessageConsumer);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should process urgent messages', async () => {
    const data = { messageId: 'msg-1', priority: 'urgente', createdAt: new Date() };
    const context = {
      getChannelRef: () => ({ ack: jest.fn() }),
      getMessage: () => ({ properties: {} }),
    } as any;
    
    messageRepo.findOne.mockResolvedValue({ id: 'msg-1', status: 'queued' } as any);

    await consumer.handleUrgentMessage(data, context);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should process normal messages', async () => {
    const data = { messageId: 'msg-2', priority: 'normal', createdAt: new Date() };
    const context = {
      getChannelRef: () => ({ ack: jest.fn() }),
      getMessage: () => ({ properties: {} }),
    } as any;

    messageRepo.findOne.mockResolvedValue({ id: 'msg-2', status: 'queued' } as any);

    await consumer.handleNormalMessage(data, context);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  it('should follow the life cycle status flow', async () => {
    const data = { messageId: 'msg-3', priority: 'normal', createdAt: new Date() };
    const context = {
      getChannelRef: () => ({ ack: jest.fn() }),
      getMessage: () => ({ properties: {} }),
    } as any;

    messageRepo.findOne.mockResolvedValue({ id: 'msg-3', status: 'queued' } as any);

    await consumer.handleNormalMessage(data, context);

    expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
      MessageEntity,
      'msg-3',
      { status: 'processing' },
    );
    expect(mockQueryRunner.manager.update).toHaveBeenCalledWith(
      MessageEntity,
      'msg-3',
      { status: 'sent' },
    );
  });
});

