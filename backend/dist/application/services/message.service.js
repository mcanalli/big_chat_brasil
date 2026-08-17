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
const client_entity_1 = require("../../infrastructure/database/entities/client.entity");
const message_entity_1 = require("../../infrastructure/database/entities/message.entity");
let MessageService = class MessageService {
    clientRepo;
    messageRepo;
    constructor(clientRepo, messageRepo) {
        this.clientRepo = clientRepo;
        this.messageRepo = messageRepo;
    }
    async sendMessage(clientId, data) {
        const client = await this.clientRepo.findOne({ where: { id: clientId } });
        if (!client)
            throw new common_1.BadRequestException('Client not found');
        const cost = data.urgency === message_entity_1.MessageUrgency.URGENT ? 0.50 : 0.25;
        if (client.type === client_entity_1.ClientType.PRE_PAID) {
            if (Number(client.balance) < cost) {
                throw new common_1.BadRequestException('Insufficient balance');
            }
            client.balance = Number(client.balance) - cost;
        }
        else {
            if (Number(client.consumed) + cost > Number(client.limit)) {
                throw new common_1.BadRequestException('Monthly limit exceeded');
            }
            client.consumed = Number(client.consumed) + cost;
        }
        const message = this.messageRepo.create({
            ...data,
            clientId,
            cost,
            status: message_entity_1.MessageStatus.QUEUED,
        });
        await this.clientRepo.save(client);
        const savedMessage = await this.messageRepo.save(message);
        return savedMessage;
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(client_entity_1.ClientEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.MessageEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MessageService);
//# sourceMappingURL=message.service.js.map