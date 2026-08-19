import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('QueueService', () => {
  let service: QueueService;
  let clientProxy: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    clientProxy = {
      emit: jest.fn().mockReturnValue(of({})),
    } as unknown as jest.Mocked<ClientProxy>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: 'RABBITMQ_SERVICE', useValue: clientProxy },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should publish to urgent queue when priority is urgent', () => {
    const message = { id: '1', priority: 'urgent' };
    service.publishMessage(message);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(clientProxy.emit).toHaveBeenCalledWith(
      'bcb.messages.urgent',
      message,
    );
  });

  it('should publish to normal queue when priority is normal', () => {
    const message = { id: '2', priority: 'normal' };
    service.publishMessage(message);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(clientProxy.emit).toHaveBeenCalledWith(
      'bcb.messages.normal',
      message,
    );
  });
});
