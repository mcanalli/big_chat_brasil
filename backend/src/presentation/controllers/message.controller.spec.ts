import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from '../../application/services/message.service';

describe('MessageController', () => {
  let controller: MessageController;
  let service: any;

  beforeEach(async () => {
    service = {
      sendMessage: jest.fn().mockResolvedValue({ id: '1' }),
      getReport: jest.fn().mockResolvedValue([]),
      getHistory: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        { provide: MessageService, useValue: service },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
  });

  it('should send message', async () => {
    expect(await controller.send({} as any)).toEqual({ id: '1' });
  });
});