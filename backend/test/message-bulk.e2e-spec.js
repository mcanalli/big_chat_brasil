"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supertest_1 = __importDefault(require("supertest"));
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
const client_entity_1 = require("../src/domain/entities/client.entity");
const message_entity_1 = require("../src/domain/entities/message.entity");
const conversation_entity_1 = require("../src/domain/entities/conversation.entity");
const queue_service_1 = require("../src/infrastructure/queue/queue.service");
describe('Message Bulk Send (e2e)', () => {
    let app;
    let dataSource;
    let client;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        })
            .overrideProvider(queue_service_1.QueueService)
            .useValue({
            publishMessage: jest.fn().mockResolvedValue(null),
            onModuleInit: jest.fn(),
            onModuleDestroy: jest.fn(),
        })
            .compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        dataSource = moduleFixture.get(typeorm_1.DataSource);
        const uniqueDocId = Math.floor(10000000000 + Math.random() * 90000000000).toString();
        const clientRepo = dataSource.getRepository(client_entity_1.ClientEntity);
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
            const messageRepo = dataSource.getRepository(message_entity_1.MessageEntity);
            const conversationRepo = dataSource.getRepository(conversation_entity_1.ConversationEntity);
            const clientRepo = dataSource.getRepository(client_entity_1.ClientEntity);
            await messageRepo.delete({ senderId: client.id });
            await conversationRepo.delete({ clientId: client.id });
            await clientRepo.delete(client.id);
        }
        if (app) {
            await app.close();
        }
    });
    it('POST /messages/bulk - Sucesso com m�ltiplos destinat�rios', async () => {
        const payload = {
            senderId: client.id,
            recipientPhones: ['5511900000001', '5511900000002'],
            recipientNames: ['User One', 'User Two'],
            content: 'Hello Bulk!',
            channel: 'WHATSAPP',
        };
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post('/messages/bulk')
            .send(payload)
            .expect(201);
        expect(response.body).toHaveProperty('bulkId');
        const body = response.body;
        expect(body.totalRecipients).toBe(2);
        expect(body.totalCost).toBe(0.5);
        expect(body.queuedMessages).toHaveLength(2);
        const updatedClient = await dataSource
            .getRepository(client_entity_1.ClientEntity)
            .findOneBy({ id: client.id });
        if (!updatedClient) {
            throw new Error('Client not found after bulk message send');
        }
        expect(Number(updatedClient.balance)).toBe(99.5);
    });
    it('POST /messages/bulk - Erro 402 se saldo insuficiente', async () => {
        await dataSource
            .getRepository(client_entity_1.ClientEntity)
            .update(client.id, { balance: 0.01 });
        const payload = {
            senderId: client.id,
            recipientPhones: ['5511900000001', '5511900000002'],
            content: 'Hello Bulk!',
            channel: 'SMS',
        };
        await (0, supertest_1.default)(app.getHttpServer())
            .post('/messages/bulk')
            .send(payload)
            .expect(402);
    });
    it('POST /messages/bulk - Deve respeitar a prioridade urgente e cobrar o valor correto', async () => {
        await dataSource
            .getRepository(client_entity_1.ClientEntity)
            .update(client.id, { balance: 10.0 });
        const payload = {
            senderId: client.id,
            recipientPhones: ['5511911111111', '5511922222222'],
            content: 'Hello Urgent Bulk!',
            channel: 'WHATSAPP',
            priority: 'urgente',
        };
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post('/messages/bulk')
            .send(payload)
            .expect(201);
        const body = response.body;
        expect(body.totalCost).toBe(1.0);
        const messageRepo = dataSource.getRepository(message_entity_1.MessageEntity);
        const messages = await messageRepo.find({
            where: { senderId: client.id, priority: 'urgente' },
        });
        expect(messages.length).toBeGreaterThanOrEqual(2);
        expect(messages[0].priority).toBe('urgente');
    });
});
//# sourceMappingURL=message-bulk.e2e-spec.js.map