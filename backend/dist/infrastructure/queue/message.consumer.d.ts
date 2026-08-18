import { RmqContext } from '@nestjs/microservices';
import { Repository, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
export declare class MessageConsumer {
    private readonly messageRepo;
    private readonly statusHistoryRepo;
    private readonly dataSource;
    private readonly logger;
    private urgentCounter;
    constructor(messageRepo: Repository<MessageEntity>, statusHistoryRepo: Repository<MessageStatusHistoryEntity>, dataSource: DataSource);
    handleUrgentMessage(data: any, context: RmqContext): Promise<void>;
    handleNormalMessage(data: any, context: RmqContext): Promise<void>;
    private processMessage;
    private updateStatus;
}
