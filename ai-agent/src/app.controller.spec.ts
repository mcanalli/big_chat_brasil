import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AiService } from './services/ai.service';

describe('AppController', () => {
  let controller: AppController;
  let aiService: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AiService,
          useValue: {
            generateReply: jest.fn().mockResolvedValue('Olá, recebi sua mensagem! Tudo bem por aqui.'),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    aiService = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should generate response and dispatch inbound webhook', async () => {
    const dto = {
      clientId: 'client-123',
      senderId: 'client-123',
      recipientPhone: '+5511999999999',
      recipientName: 'Maria Silva',
      content: 'Olá Maria, tudo bem?',
      channel: 'WHATSAPP',
    };

    const result = await controller.generateResponse(dto);

    expect(aiService.generateReply).toHaveBeenCalledWith(dto.content, dto.recipientName);
    expect(result).toEqual({
      success: true,
      aiResponse: 'Olá, recebi sua mensagem! Tudo bem por aqui.',
    });
  });
});
