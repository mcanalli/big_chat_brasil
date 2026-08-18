import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import { ConversationService } from './conversation.service';
import { DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { QueueService } from '../../infrastructure/queue/queue.service';


describe('MessageService', () => {
  let service: MessageService;
  let clientRepo: any;
  let messageRepo: any;
  let conversationService: any;

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
    },
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(MessageEntity),
          useValue: { create: jest.fn(), findAndCount: jest.fn() },
        },
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(MessageStatusHistoryEntity),
          useValue: { create: jest.fn(), find: jest.fn() },
        },
        {
          provide: ConversationService,
          useValue: { findOrCreate: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: QueueService,
          useValue: { publishMessage: jest.fn() },
        },

      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    clientRepo = module.get(getRepositoryToken(ClientEntity));
    messageRepo = module.get(getRepositoryToken(MessageEntity));
    conversationService = module.get(ConversationService);
  });

  it('deve lançar 402 se saldo insuficiente no pré-pago', async () => {
    const dto: any = { senderId: 'client-1', channel: 'SMS', content: 'Oi' };
    mockQueryRunner.manager.findOne.mockResolvedValue({
      id: 'client-1',
      planType: 'prepaid',
      balance: 0.01,
    });

    await expect(service.sendMessage(dto)).rejects.toThrow(
      new HttpException('Insufficient balance', HttpStatus.PAYMENT_REQUIRED),
    );
  });

  it('deve lançar 402 se limite excedido no pós-pago', async () => {
    const dto: any = { senderId: 'client-2', channel: 'SMS', content: 'Oi' };
    mockQueryRunner.manager.findOne.mockResolvedValue({
      id: 'client-2',
      planType: 'postpaid',
      limit: 100,
      consumed: 99.95,
    });

    await expect(service.sendMessage(dto)).rejects.toThrow(
      new HttpException('Monthly limit exceeded', HttpStatus.PAYMENT_REQUIRED),
    );
  });

  it('deve criar mensagem com sucesso se houver saldo', async () => {
    const dto: any = { 
        senderId: 'client-1', 
        channel: 'WHATSAPP', 
        content: 'Oi',
        recipientPhone: '5511999999999'
    };
    
    mockQueryRunner.manager.findOne.mockResolvedValue({
      id: 'client-1',
      planType: 'prepaid',
      balance: 10.00,
    });

    conversationService.findOrCreate.mockResolvedValue({ id: 'conv-1' });
    messageRepo.create.mockReturnValue({ id: 'msg-1', ...dto });
    mockQueryRunner.manager.save.mockImplementation(async (entity) => entity);

    const result = await service.sendMessage(dto);

    expect(result).toBeDefined();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });
});
