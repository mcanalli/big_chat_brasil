import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { ClientEntity } from '../src/domain/entities/client.entity';
import { MessageEntity } from '../src/domain/entities/message.entity';
import { ConversationEntity } from '../src/domain/entities/conversation.entity';
import { QueueService } from '../src/infrastructure/queue/queue.service';

describe('Message Bulk Send (e2e)', () => {
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
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    const uniqueDocId = Math.floor(
      10000000000 + Math.random() * 90000000000,
    ).toString();
    const clientRepo = dataSource.getRepository(ClientEntity);
    client = clientRepo.create({
      name: 'Bulk Test Client',
      documentId: uniqueDocId,
      documentType: 'CPF',
      planType: 'prepaid',
      balance: 100.0,
    });
    client = await clientRepo.save(client);
  });

  afterAll(async () => {
    if (client && dataSource && dataSource.isInitialized) {
      const messageRepo = dataSource.getRepository(MessageEntity);
      const conversationRepo = dataSource.getRepository(ConversationEntity);
      const clientRepo = dataSource.getRepository(ClientEntity);

      await messageRepo.delete({ senderId: client.id });
      await conversationRepo.delete({ clientId: client.id });
      await clientRepo.delete(client.id);
    }

    if (app) {
      await app.close();
    }
  });

  it('POST /messages/bulk - Sucesso com múltiplos destinatários', async () => {
    const payload = {
      senderId: client.id,
      recipientPhones: ['5511900000001', '5511900000002'],
      recipientNames: ['User One', 'User Two'],
      content: 'Hello Bulk!',
      channel: 'WHATSAPP',
    };

    const response = await request(
      app.getHttpServer(),
    )
      .post('/messages/bulk')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('bulkId');
    interface BulkResponse {
      totalRecipients: number;
      totalCost: number;
      queuedMessages: any[];
    }
    const body = response.body as BulkResponse;
    expect(body.totalRecipients).toBe(2);
    expect(body.totalCost).toBe(0.5);
    expect(body.queuedMessages).toHaveLength(2);

    const updatedClient = await dataSource
      .getRepository(ClientEntity)
      .findOneBy({ id: client.id });
    if (!updatedClient) {
      throw new Error('Client not found after bulk message send');
    }
    expect(Number(updatedClient.balance)).toBe(99.5);
  });

  it('POST /messages/bulk - Erro 402 se saldo insuficiente', async () => {
    await dataSource
      .getRepository(ClientEntity)
      .update(client.id, { balance: 0.01 });

    const payload = {
      senderId: client.id,
      recipientPhones: ['5511900000001', '5511900000002'],
      content: 'Hello Bulk!',
      channel: 'SMS',
    };

    await request(app.getHttpServer())
      .post('/messages/bulk')
      .send(payload)
      .expect(402);
  });

  it('POST /messages/bulk - Deve respeitar a prioridade urgente e cobrar o valor correto', async () => {
    // Reset balance
    await dataSource
      .getRepository(ClientEntity)
      .update(client.id, { balance: 10.0 });

    const payload = {
      senderId: client.id,
      recipientPhones: ['5511911111111', '5511922222222'],
      content: 'Hello Urgent Bulk!',
      channel: 'WHATSAPP',
      priority: 'urgente',
    };

    const response = await request(
      app.getHttpServer(),
    )
      .post('/messages/bulk')
      .send(payload)
      .expect(201);

    const body = response.body;
    // O custo de WHATSAPP urgente deve ser 0.50 (baseado no PricingService se ele seguir o padrão)
    // Se o custo normal é 0.25 e o urgente é 0.50, para 2 mensagens o total é 1.00
    expect(body.totalCost).toBe(1.0);

    const messageRepo = dataSource.getRepository(MessageEntity);
    const messages = await messageRepo.find({
      where: { senderId: client.id, priority: 'urgente' as any },
    });
    expect(messages.length).toBeGreaterThanOrEqual(2);
    expect(messages[0].priority).toBe('urgente');
  });
});

