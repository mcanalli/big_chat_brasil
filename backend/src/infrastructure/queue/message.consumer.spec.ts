import { Test, TestingModule } from '@nestjs/testing';
import { MessageConsumer } from './message.consumer';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import { DataSource, Repository } from 'typeorm';

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
  };

  beforeEach(async () => {
    messageRepo = {
      update: jest.fn(),
    };
    historyRepo = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn(),
    };
    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

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

  it('should process urgent messages and increment counter', async () => {
    const data = { id: 'msg-1', priority: 'urgent' };
    await consumer.handleUrgentMessage(data);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalledTimes(3);
    expect(
      (consumer as unknown as { urgentCounter: number }).urgentCounter,
    ).toBe(1);
  });

  it('should reset counter when processing a normal message', async () => {
    (consumer as unknown as { urgentCounter: number }).urgentCounter = 3;
    const data = { id: 'msg-2', priority: 'normal' };
    await consumer.handleNormalMessage(data);

    expect(
      (consumer as unknown as { urgentCounter: number }).urgentCounter,
    ).toBe(0);
  });

  it('should follow the life cycle status flow', async () => {
    const data = { id: 'msg-3' };
    await (
      consumer as unknown as { processMessage: (d: any) => Promise<void> }
    ).processMessage(data);

    expect(mockQueryRunner.manager.update).toHaveBeenNthCalledWith(
      1,
      MessageEntity,
      'msg-3',
      { status: 'processing' },
    );
    expect(mockQueryRunner.manager.update).toHaveBeenNthCalledWith(
      2,
      MessageEntity,
      'msg-3',
      { status: 'sent' },
    );
    expect(mockQueryRunner.manager.update).toHaveBeenNthCalledWith(
      3,
      MessageEntity,
      'msg-3',
      { status: 'delivered' },
    );
  });
});
