import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { ClientEntity } from '../src/domain/entities/client.entity';
import { MessageEntity } from '../src/domain/entities/message.entity';
import { ConversationEntity } from '../src/domain/entities/conversation.entity';
import { RecipientEntity } from '../src/domain/entities/recipient.entity';
import { QueueService } from '../src/infrastructure/queue/queue.service';

describe('Webhooks Inbound (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let client: ClientEntity;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(QueueService)
      .useValue({
        publishMessage: jest.fn().mockResolvedValue(null),
        onModuleInit: jest.fn(),
        onModuleDestroy: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    const clientRepo = dataSource.getRepository(ClientEntity);
    client = clientRepo.create({
      name: 'Inbound Test Client 2',
      documentId: '98765432109876',
      documentType: 'CNPJ',
      planType: 'prepaid',
      balance: 100.0,
    });
    client = await clientRepo.save(client);
  });

  afterAll(async () => {
    if (client && dataSource && dataSource.isInitialized) {
      const messageRepo = dataSource.getRepository(MessageEntity);
      const conversationRepo = dataSource.getRepository(ConversationEntity);
      const recipientRepo = dataSource.getRepository(RecipientEntity);
      const clientRepo = dataSource.getRepository(ClientEntity);

      await messageRepo.delete({ senderId: client.id });
      await conversationRepo.delete({ clientId: client.id });
      await recipientRepo.delete({ clientId: client.id });
      await clientRepo.delete(client.id);
    }

    if (app) {
      await app.close();
    }
  });

  it('POST /messages/inbound - Deve receber mensagem, criar recipient e conversation', async () => {
    const payload = {
      clientId: client.id,
      from: '5511977776666',
      senderName: 'Jane Inbound',
      content: 'Hello, I am a user Jane',
      channel: 'WHATSAPP',
    };

    const response = await request(app.getHttpServer())
      .post('/api/messages/inbound')
      .send(payload);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.direction).toBe('inbound');

    // Validar criação do Recipient
    const recipientRepo = dataSource.getRepository(RecipientEntity);
    const recipient = await recipientRepo.findOneBy({ phone: payload.from, clientId: client.id });
    expect(recipient).toBeDefined();

    // Validar criação da Conversation
    const conversationRepo = dataSource.getRepository(ConversationEntity);
    const conversation = await conversationRepo.findOneBy({ id: response.body.conversationId });
    expect(conversation).toBeDefined();
    expect(conversation?.unreadCount).toBeGreaterThanOrEqual(1);
  });
});
