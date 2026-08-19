import { Test, TestingModule } from '@nestjs/testing';
import { ClientController } from './client.controller';
import { ClientService } from '../../application/services/client.service';

describe('ClientController', () => {
  let controller: ClientController;
  let service: jest.Mocked<ClientService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      getBalance: jest.fn(),
    } as unknown as jest.Mocked<ClientService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientController],
      providers: [{ provide: ClientService, useValue: service }],
    }).compile();

    controller = module.get<ClientController>(ClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
