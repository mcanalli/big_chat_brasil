"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../../domain/entities/message.entity");
const client_entity_1 = require("../../domain/entities/client.entity");
const conversation_service_1 = require("./conversation.service");
const queue_service_1 = require("../../infrastructure/queue/queue.service");
const message_status_history_entity_1 = require("../../domain/entities/message-status-history.entity");
const uuid_1 = require("uuid");
const pricing_service_1 = require("./pricing.service");
let MessageService = class MessageService {
    messageRepo;
    clientRepo;
    statusHistoryRepo;
    conversationService;
    queueService;
    pricingService;
    dataSource;
    constructor(messageRepo, clientRepo, statusHistoryRepo, conversationService, queueService, pricingService, dataSource) {
        this.messageRepo = messageRepo;
        this.clientRepo = clientRepo;
        this.statusHistoryRepo = statusHistoryRepo;
        this.conversationService = conversationService;
        this.queueService = queueService;
        this.pricingService = pricingService;
        this.dataSource = dataSource;
    }
    async sendMessage(dto) {
        console.log('[STEP 1] Início do processamento de sendMessage', { dto });
        const queryRunner = this.dataSource.createQueryRunner();
        console.log('[STEP 2] Conectando QueryRunner ao Pool do Postgres');
        await queryRunner.connect();
        console.log('[STEP 3] Iniciando Transação SQL');
        await queryRunner.startTransaction();
        try {
            console.log('[STEP 4] Buscando cliente com Lock Pessimista (pessimistic_write)', { senderId: dto.senderId });
            const client = await queryRunner.manager.findOne(client_entity_1.ClientEntity, {
                where: { id: dto.senderId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!client) {
                console.log('[STEP 4.1] Erro: Cliente não encontrado');
                throw new common_1.NotFoundException('Client not found');
            }
            const unitCost = await this.pricingService.getCost(dto.priority || 'normal');
            const cost = unitCost;
            console.log('[STEP 5] Validando saldo/limite do cliente', {
                planType: client.planType,
                balance: client.balance,
                cost,
            });
            if (client.planType === 'prepaid') {
                if (Number(client.balance) < cost) {
                    console.log('[STEP 5.1] Erro: Saldo insuficiente');
                    throw new common_1.HttpException('Insufficient balance', common_1.HttpStatus.PAYMENT_REQUIRED);
                }
                client.balance = Number(client.balance) - cost;
            }
            else {
                if (Number(client.consumed) + cost > Number(client.limit)) {
                    console.log('[STEP 5.1] Erro: Limite mensal excedido');
                    throw new common_1.HttpException('Monthly limit exceeded', common_1.HttpStatus.PAYMENT_REQUIRED);
                }
                client.consumed = Number(client.consumed) + cost;
            }
            console.log('[STEP 6] Buscando ou criando conversa via ConversationService');
            const conversation = await this.conversationService.findOrCreate(client.id, dto.recipientPhone, dto.recipientName, queryRunner.manager);
            console.log('[STEP 7] Persistindo entidade da Mensagem');
            const message = queryRunner.manager.create(message_entity_1.MessageEntity, {
                senderId: dto.senderId,
                recipientPhone: dto.recipientPhone,
                content: dto.content,
                channel: dto.channel,
                priority: dto.priority,
                conversationId: conversation.id,
                cost,
                status: 'queued',
            });
            const savedMessage = await queryRunner.manager.save(message);
            console.log('[STEP 8] Atualizando histórico e dados da conversa');
            const history = queryRunner.manager.create(message_status_history_entity_1.MessageStatusHistoryEntity, {
                messageId: savedMessage.id,
                status: 'queued',
                details: 'Message queued for sending',
            });
            await queryRunner.manager.save(history);
            conversation.lastMessageContent = dto.content;
            conversation.lastMessageTime = new Date();
            await queryRunner.manager.save(conversation);
            console.log('[STEP 8.1] Atualizando saldo/consumo do cliente');
            await queryRunner.manager.save(client);
            console.log('[STEP 9] Executando Commit da Transação');
            await queryRunner.commitTransaction();
            console.log('[STEP 10] Commit executado com sucesso');
            console.log('[STEP 11] Disparando evento assíncrono para o RabbitMQ');
            this.queueService.publishMessage(savedMessage);
            console.log('[STEP 12] Retornando resposta ao Controller');
            return savedMessage;
        }
        catch (err) {
            console.error('[STEP ERROR] Ocorreu um erro na transação:', err instanceof Error ? err.message : String(err));
            if (queryRunner.isTransactionActive) {
                console.log('[STEP ROLLBACK] Efetuando rollback da transação');
                await queryRunner.rollbackTransaction();
            }
            throw err;
        }
        finally {
            console.log('[STEP FINALLY] Liberando QueryRunner de volta para o Pool');
            await queryRunner.release();
        }
    }
    async sendBulkMessage(dto) {
        console.log('[BULK] Início do processamento de sendBulkMessage', {
            senderId: dto.senderId,
            recipientCount: dto.recipientPhones.length,
        });
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const client = await queryRunner.manager.findOne(client_entity_1.ClientEntity, {
                where: { id: dto.senderId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!client) {
                throw new common_1.NotFoundException('Client not found');
            }
            const unitCost = await this.pricingService.getCost(dto.priority || 'normal');
            const totalCost = unitCost * dto.recipientPhones.length;
            console.log('[BULK] Validando saldo/limite total', {
                planType: client.planType,
                totalCost,
            });
            if (client.planType === 'prepaid') {
                if (Number(client.balance) < totalCost) {
                    throw new common_1.HttpException('Insufficient balance for bulk operation', common_1.HttpStatus.PAYMENT_REQUIRED);
                }
                client.balance = Number(client.balance) - totalCost;
            }
            else {
                if (Number(client.consumed) + totalCost > Number(client.limit)) {
                    throw new common_1.HttpException('Monthly limit exceeded for bulk operation', common_1.HttpStatus.PAYMENT_REQUIRED);
                }
                client.consumed = Number(client.consumed) + totalCost;
            }
            const savedMessages = [];
            const bulkId = (0, uuid_1.v4)();
            for (let i = 0; i < dto.recipientPhones.length; i++) {
                const phone = dto.recipientPhones[i];
                const name = dto.recipientNames ? dto.recipientNames[i] : undefined;
                const conversation = await this.conversationService.findOrCreate(client.id, phone, name, queryRunner.manager);
                const message = queryRunner.manager.create(message_entity_1.MessageEntity, {
                    senderId: dto.senderId,
                    content: dto.content,
                    channel: dto.channel,
                    recipientPhone: phone,
                    conversationId: conversation.id,
                    cost: unitCost,
                    status: 'queued',
                    priority: dto.priority || 'normal',
                });
                const savedMessage = await queryRunner.manager.save(message);
                savedMessages.push(savedMessage);
                const history = queryRunner.manager.create(message_status_history_entity_1.MessageStatusHistoryEntity, {
                    messageId: savedMessage.id,
                    status: 'queued',
                    details: 'Bulk message queued',
                });
                await queryRunner.manager.save(history);
                conversation.lastMessageContent = dto.content;
                conversation.lastMessageTime = new Date();
                await queryRunner.manager.save(conversation);
            }
            await queryRunner.manager.save(client);
            await queryRunner.commitTransaction();
            savedMessages.forEach((msg) => {
                this.queueService.publishMessage(msg);
            });
            return {
                bulkId,
                totalRecipients: dto.recipientPhones.length,
                totalCost,
                status: 'accepted',
                queuedMessages: savedMessages.map((m) => ({
                    messageId: m.id,
                    recipientPhone: m.recipientPhone,
                })),
            };
        }
        catch (err) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getReport(filter) {
        const { startDate, endDate, status, senderId, page = 1, limit = 10, } = filter;
        const where = {};
        if (startDate && endDate) {
            where.timestamp = (0, typeorm_2.Between)(new Date(startDate), new Date(endDate));
        }
        if (status) {
            where.status = status;
        }
        if (senderId) {
            where.senderId = senderId;
        }
        const [items, total] = await this.messageRepo.findAndCount({
            where,
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            order: { timestamp: 'DESC' },
        });
        return {
            items,
            total,
            page: Number(page),
            lastPage: Math.ceil(total / Number(limit)),
        };
    }
    async getHistory(messageId) {
        return this.statusHistoryRepo.find({
            where: { messageId },
            order: { timestamp: 'ASC' },
        });
    }
    async receiveInboundMessage(dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const client = await queryRunner.manager.findOne(client_entity_1.ClientEntity, {
                where: { id: dto.clientId },
            });
            if (!client) {
                throw new common_1.NotFoundException('Client not found');
            }
            const conversation = await this.conversationService.findOrCreate(client.id, dto.from, dto.senderName, queryRunner.manager);
            const message = queryRunner.manager.create(message_entity_1.MessageEntity, {
                senderId: client.id,
                content: dto.content,
                channel: dto.channel,
                recipientPhone: dto.from,
                conversationId: conversation.id,
                cost: 0,
                status: 'delivered',
                direction: 'inbound',
                type: 'text',
                priority: 'normal',
            });
            const savedMessage = await queryRunner.manager.save(message);
            const history = queryRunner.manager.create(message_status_history_entity_1.MessageStatusHistoryEntity, {
                messageId: savedMessage.id,
                status: 'delivered',
                details: 'Inbound message received',
            });
            await queryRunner.manager.save(history);
            conversation.lastMessageContent = dto.content;
            conversation.lastMessageTime = new Date();
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            await queryRunner.manager.save(conversation);
            await queryRunner.commitTransaction();
            return savedMessage;
        }
        catch (err) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(client_entity_1.ClientEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(message_status_history_entity_1.MessageStatusHistoryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        conversation_service_1.ConversationService,
        queue_service_1.QueueService,
        pricing_service_1.PricingService,
        typeorm_2.DataSource])
], MessageService);
//# sourceMappingURL=message.service.js.map