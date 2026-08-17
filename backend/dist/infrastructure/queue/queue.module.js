"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const queue_service_1 = require("./queue.service");
const message_consumer_1 = require("./message.consumer");
const typeorm_1 = require("@nestjs/typeorm");
const message_entity_1 = require("../database/entities/message.entity");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([message_entity_1.MessageEntity]),
            microservices_1.ClientsModule.register([
                {
                    name: 'MESSAGE_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URI || 'amqp://bcb_mq_user:bcb_mq_password@localhost:5672'],
                        queue: 'bcb.messages.normal',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
        ],
        providers: [queue_service_1.QueueService, message_consumer_1.MessageConsumer],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map