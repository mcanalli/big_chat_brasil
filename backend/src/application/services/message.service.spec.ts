import { Test, TestingModule } from '@nestjs/testing';
import { MessageService } from './message.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import { ConversationService } from './conversation.service';
import { DataSource, Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { SendMessageDto } from '../../presentation/dtos/send-message.dto';
import { SendBulkMessageDto } from '../../presentation/dtos/send-bulk-message.dto';

describe('MessageService', () => {
  let service: MessageService;

  let messageRepo: jest.Mocked<Repository<MessageEntity>>;
  let conversationService: jest.Mocked<ConversationService>;

  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(null),
    startTransaction: jest.fn().mockResolvedValue(null),
    commitTransaction: jest.fn().mockResolvedValue(null),
    rollbackTransaction: jest.fn().mockResolvedValue(null),
    release: jest.fn().mockResolvedValue(null),
    isTransactionActive: true,
    manager: {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn().mockImplementation((entity: any, dto: any): any => ({
        id: 'generated-id',
        ...dto,
      })),
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
          useValue: { publishMessage: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    // clientRepo removed(getRepositoryToken(ClientEntity));
    messageRepo = module.get(getRepositoryToken(MessageEntity));
    conversationService = module.get(ConversationService);
  });

  it('deve lançar 402 se saldo insuficiente no pré-pago', async () => {
    const dto: SendMessageDto = {
      senderId: 'client-1',
      channel: 'SMS',
      content: 'Oi',
      recipientPhone: '5511999999999',
    };
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
    const dto: SendMessageDto = {
      senderId: 'client-2',
      channel: 'SMS',
      content: 'Oi',
      recipientPhone: '5511999999999',
    };
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
    const dto: SendBulkMessageDto = {
      senderId: 'client-1',
      channel: 'WHATSAPP',
      content: 'Oi',
      recipientPhone: '5511999999999',
    };

    mockQueryRunner.manager.findOne.mockResolvedValue({
      id: 'client-1',
      planType: 'prepaid',
      balance: 10.0,
    });

    (conversationService.findOrCreate as jest.Mock).mockResolvedValue({
      id: 'conv-1',
    } as ConversationEntity);
    (messageRepo.create as jest.Mock).mockReturnValue({
      id: 'msg-1',
      ...dto,
    });
    mockQueryRunner.manager.save.mockImplementation((entity: any) =>
      Promise.resolve(entity),
    );

    const result = await service.sendMessage(dto);

    expect(result).toBeDefined();
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  });

  describe('sendBulkMessage', () => {
    it('deve lançar 402 se saldo insuficiente no pré-pago para lote', async () => {
      const dto: SendBulkMessageDto = {
        senderId: 'client-1',
        channel: 'SMS',
        content: 'Bulk',
        recipientPhones: ['phone1', 'phone2'],
      };

      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'client-1',
        planType: 'prepaid',
        balance: 0.15,
      });

      await expect(service.sendBulkMessage(dto)).rejects.toThrow(
        new HttpException(
          'Insufficient balance for bulk operation',
          HttpStatus.PAYMENT_REQUIRED,
        ),
      );
    });

    it('deve lançar 402 se limite excedido no pós-pago para lote', async () => {
      const dto: SendBulkMessageDto = {
        senderId: 'client-2',
        channel: 'WHATSAPP',
        content: 'Bulk',
        recipientPhones: ['phone1', 'phone2'],
      };

      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'client-2',
        planType: 'postpaid',
        limit: 100,
        consumed: 99.95,
      });

      await expect(service.sendBulkMessage(dto)).rejects.toThrow(
        new HttpException(
          'Monthly limit exceeded for bulk operation',
          HttpStatus.PAYMENT_REQUIRED,
        ),
      );
    });

    it('deve processar lote com sucesso e debitar saldo total', async () => {
      const dto: SendBulkMessageDto = {
        senderId: 'client-1',
        channel: 'SMS',
        content: 'Bulk SMS',
        recipientPhones: ['phone1', 'phone2'],
        recipientNames: ['Name 1', 'Name 2'],
      };

      const client = {
        id: 'client-1',
        planType: 'prepaid',
        balance: 10.0,
      };

      mockQueryRunner.manager.findOne.mockResolvedValue(client);
      (conversationService.findOrCreate as jest.Mock).mockResolvedValue({
        id: 'conv-x',
      } as ConversationEntity);
      mockQueryRunner.manager.save.mockImplementation((entity: any) =>
        Promise.resolve(entity),
      );

      const result = await service.sendBulkMessage(dto);

      expect(result.totalRecipients).toBe(2);
      expect(result.totalCost).toBe(2);
      expect(client.balance).toBe(8);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(result.queuedMessages.length).toBe(2);
    });

    it('deve fazer rollback se falhar a criação de uma mensagem no lote', async () => {
      const dto: SendBulkMessageDto = {
        senderId: 'client-1',
        channel: 'SMS',
        content: 'Bulk',
        recipientPhones: ['phone1', 'phone2'],
      };

      mockQueryRunner.manager.findOne.mockResolvedValue({
        id: 'client-1',
        planType: 'prepaid',
        balance: 10.0,
      });

      conversationService.findOrCreate.mockRejectedValue(new Error('DB Error'));

      await expect(service.sendBulkMessage(dto)).rejects.toThrow('DB Error');
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
