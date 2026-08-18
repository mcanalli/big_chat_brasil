import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';

describe('QueueService', () => {
  let service: QueueService;
  let clientProxy: any;

  beforeEach(async () => {
    clientProxy = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: 'RABBITMQ_SERVICE', useValue: clientProxy },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should publish to urgent queue when priority is urgent', async () => {
    const message = { id: '1', priority: 'urgent' };
    await service.publishMessage(message);
    expect(clientProxy.emit).toHaveBeenCalledWith('bcb.messages.urgent', message);
  });

  it('should publish to normal queue when priority is normal', async () => {
    const message = { id: '2', priority: 'normal' };
    await service.publishMessage(message);
    expect(clientProxy.emit).toHaveBeenCalledWith('bcb.messages.normal', message);
  });
});
