import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from '../../application/services/message.service';
import { SendMessageDto } from '../dtos/send-message.dto';

describe('MessageController', () => {
  let controller: MessageController;
  let service: jest.Mocked<MessageService>;

  beforeEach(async () => {
    service = {
      sendMessage: jest.fn().mockResolvedValue({ id: '1' }),
      getReport: jest.fn().mockResolvedValue([]),
      getHistory: jest.fn().mockResolvedValue([]),
      sendBulkMessage: jest.fn(),
    } as unknown as jest.Mocked<MessageService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [{ provide: MessageService, useValue: service }],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should send message', async () => {
    const dto: SendMessageDto = {
      senderId: '1',
      recipientPhone: '5511',
      content: 'hi',
      channel: 'SMS',
    };
    expect(await controller.send(dto)).toEqual({ id: '1' });
  });
});
