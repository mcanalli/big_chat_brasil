import { Repository } from 'typeorm';
import { ClientEntity } from '../../infrastructure/database/entities/client.entity';
import { MessageEntity, MessageUrgency } from '../../infrastructure/database/entities/message.entity';
export declare class MessageService {
    private clientRepo;
    private messageRepo;
    constructor(clientRepo: Repository<ClientEntity>, messageRepo: Repository<MessageEntity>);
    sendMessage(clientId: string, data: {
        content: string;
        urgency: MessageUrgency;
        conversationId: string;
    }): Promise<MessageEntity>;
}
