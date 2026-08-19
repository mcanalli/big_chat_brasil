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
var MessageConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageConsumer = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../../domain/entities/message.entity");
const message_status_history_entity_1 = require("../../domain/entities/message-status-history.entity");
let MessageConsumer = MessageConsumer_1 = class MessageConsumer {
    messageRepo;
    statusHistoryRepo;
    dataSource;
    logger = new common_1.Logger(MessageConsumer_1.name);
    urgentCounter = 0;
    constructor(messageRepo, statusHistoryRepo, dataSource) {
        this.messageRepo = messageRepo;
        this.statusHistoryRepo = statusHistoryRepo;
        this.dataSource = dataSource;
    }
    async handleUrgentMessage(data) {
        this.logger.log(`Received URGENT message: ${data.id}`);
        await this.processMessage(data);
        this.urgentCounter++;
    }
    async handleNormalMessage(data) {
        this.logger.log(`Received NORMAL message: ${data.id}`);
        await this.processMessage(data);
        this.urgentCounter = 0;
    }
    async processMessage(data) {
        const messageId = data.id;
        await this.updateStatus(messageId, 'processing', 'Message is being processed by worker');
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this.updateStatus(messageId, 'sent', 'Message successfully sent to gateway');
        await new Promise((resolve) => setTimeout(resolve, 300));
        await this.updateStatus(messageId, 'delivered', 'Message delivered to recipient device');
    }
    async updateStatus(messageId, status, details) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.update(message_entity_1.MessageEntity, messageId, { status });
            const history = this.statusHistoryRepo.create({
                messageId,
                status,
                details,
            });
            await queryRunner.manager.save(history);
            await queryRunner.commitTransaction();
            this.logger.debug(`Status updated: ${messageId} -> ${status}`);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            const stack = err instanceof Error ? err.stack : undefined;
            this.logger.error(`Failed to update status for ${messageId}`, stack);
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.MessageConsumer = MessageConsumer;
__decorate([
    (0, microservices_1.EventPattern)('bcb.messages.urgent'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageConsumer.prototype, "handleUrgentMessage", null);
__decorate([
    (0, microservices_1.EventPattern)('bcb.messages.normal'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessageConsumer.prototype, "handleNormalMessage", null);
exports.MessageConsumer = MessageConsumer = MessageConsumer_1 = __decorate([
    (0, common_1.Controller)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(message_status_history_entity_1.MessageStatusHistoryEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], MessageConsumer);
//# sourceMappingURL=message.consumer.js.map