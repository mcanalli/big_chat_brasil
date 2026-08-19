import { Test, TestingModule } from '@nestjs/testing';
import { ConversationController } from './conversation.controller';
import { ConversationService } from '../../application/services/conversation.service';

describe('ConversationController', () => {
  let controller: ConversationController;
  let service: jest.Mocked<ConversationService>;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findByClient: jest.fn(),
      findById: jest.fn(),
      findOrCreate: jest.fn(),
    } as unknown as jest.Mocked<ConversationService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationController],
      providers: [{ provide: ConversationService, useValue: service }],
    }).compile();

    controller = module.get<ConversationController>(ConversationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
