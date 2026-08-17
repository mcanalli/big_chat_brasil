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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageEntity = exports.MessageStatus = exports.MessageUrgency = void 0;
const typeorm_1 = require("typeorm");
const client_entity_1 = require("./client.entity");
var MessageUrgency;
(function (MessageUrgency) {
    MessageUrgency["NORMAL"] = "NORMAL";
    MessageUrgency["URGENT"] = "URGENT";
})(MessageUrgency || (exports.MessageUrgency = MessageUrgency = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["QUEUED"] = "queued";
    MessageStatus["PROCESSING"] = "processing";
    MessageStatus["SENT"] = "sent";
    MessageStatus["DELIVERED"] = "delivered";
    MessageStatus["READ"] = "read";
    MessageStatus["FAILED"] = "failed";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
let MessageEntity = class MessageEntity {
    id;
    content;
    urgency;
    status;
    cost;
    createdAt;
    client;
    clientId;
    conversationId;
};
exports.MessageEntity = MessageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MessageEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MessageEntity.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MessageUrgency,
        default: MessageUrgency.NORMAL,
    }),
    __metadata("design:type", String)
], MessageEntity.prototype, "urgency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MessageStatus,
        default: MessageStatus.QUEUED,
    }),
    __metadata("design:type", String)
], MessageEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MessageEntity.prototype, "cost", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MessageEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => client_entity_1.ClientEntity, (client) => client.messages),
    __metadata("design:type", client_entity_1.ClientEntity)
], MessageEntity.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MessageEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MessageEntity.prototype, "conversationId", void 0);
exports.MessageEntity = MessageEntity = __decorate([
    (0, typeorm_1.Entity)('messages')
], MessageEntity);
//# sourceMappingURL=message.entity.js.map