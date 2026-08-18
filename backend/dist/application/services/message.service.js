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
let MessageService = class MessageService {
    messageRepo;
    clientRepo;
    statusHistoryRepo;
    conversationService;
    queueService;
    dataSource;
    constructor(messageRepo, clientRepo, statusHistoryRepo, conversationService, queueService, dataSource) {
        this.messageRepo = messageRepo;
        this.clientRepo = clientRepo;
        this.statusHistoryRepo = statusHistoryRepo;
        this.conversationService = conversationService;
        this.queueService = queueService;
        this.dataSource = dataSource;
    }
    async sendMessage(dto) {
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
            const cost = dto.channel === 'WHATSAPP' ? 0.05 : 0.1;
            if (client.planType === 'prepaid') {
                if (Number(client.balance) < cost) {
                    throw new common_1.HttpException('Insufficient balance', common_1.HttpStatus.PAYMENT_REQUIRED);
                }
                client.balance = Number(client.balance) - cost;
            }
            else {
                if (Number(client.consumed) + cost > Number(client.limit)) {
                    throw new common_1.HttpException('Monthly limit exceeded', common_1.HttpStatus.PAYMENT_REQUIRED);
                }
                client.consumed = Number(client.consumed) + cost;
            }
            await queryRunner.manager.save(client);
            const conversation = await this.conversationService.findOrCreate(client.id, dto.recipientPhone, dto.recipientName);
            const message = this.messageRepo.create({
                ...dto,
                conversationId: conversation.id,
                cost,
                status: 'queued',
            });
            const savedMessage = await queryRunner.manager.save(message);
            const history = this.statusHistoryRepo.create({
                messageId: savedMessage.id,
                status: 'queued',
                details: 'Message queued for sending',
            });
            await queryRunner.manager.save(history);
            conversation.lastMessageContent = dto.content;
            conversation.lastMessageTime = new Date();
            await queryRunner.manager.save(conversation);
            await queryRunner.commitTransaction();
            await this.queueService.publishMessage(savedMessage);
            return savedMessage;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getReport(filter) {
        const { startDate, endDate, status, senderId, page = 1, limit = 10 } = filter;
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
        typeorm_2.DataSource])
], MessageService);
//# sourceMappingURL=message.service.js.map