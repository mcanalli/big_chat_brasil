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
const recipient_entity_1 = require("../src/domain/entities/recipient.entity");
const queue_service_1 = require("../src/infrastructure/queue/queue.service");
describe('Webhooks Inbound (e2e)', () => {
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
        const clientRepo = dataSource.getRepository(client_entity_1.ClientEntity);
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
            const messageRepo = dataSource.getRepository(message_entity_1.MessageEntity);
            const conversationRepo = dataSource.getRepository(conversation_entity_1.ConversationEntity);
            const recipientRepo = dataSource.getRepository(recipient_entity_1.RecipientEntity);
            const clientRepo = dataSource.getRepository(client_entity_1.ClientEntity);
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
        const response = await (0, supertest_1.default)(app.getHttpServer())
            .post('/messages/inbound')
            .send(payload);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.direction).toBe('inbound');
        const recipientRepo = dataSource.getRepository(recipient_entity_1.RecipientEntity);
        const recipient = await recipientRepo.findOneBy({ phone: payload.from, clientId: client.id });
        expect(recipient).toBeDefined();
        const conversationRepo = dataSource.getRepository(conversation_entity_1.ConversationEntity);
        const conversation = await conversationRepo.findOneBy({ id: response.body.conversationId });
        expect(conversation).toBeDefined();
        expect(conversation?.unreadCount).toBeGreaterThanOrEqual(1);
    });
});
//# sourceMappingURL=inbound.e2e-spec.js.map