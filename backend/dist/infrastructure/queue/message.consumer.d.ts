import { Repository } from 'typeorm';
import { MessageEntity } from '../database/entities/message.entity';
export declare class MessageConsumer {
    private messageRepo;
    constructor(messageRepo: Repository<MessageEntity>);
    handleMessageProcess(data: any): Promise<void>;
}
