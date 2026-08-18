import { Repository, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ConversationService } from './conversation.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { SendMessageDto } from '../../presentation/dtos/send-message.dto';
import { ReportFilterDto } from '../../presentation/dtos/report-filter.dto';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
export declare class MessageService {
    private readonly messageRepo;
    private readonly clientRepo;
    private readonly statusHistoryRepo;
    private readonly conversationService;
    private readonly queueService;
    private readonly dataSource;
    constructor(messageRepo: Repository<MessageEntity>, clientRepo: Repository<ClientEntity>, statusHistoryRepo: Repository<MessageStatusHistoryEntity>, conversationService: ConversationService, queueService: QueueService, dataSource: DataSource);
    sendMessage(dto: SendMessageDto): Promise<MessageEntity>;
    getReport(filter: ReportFilterDto): Promise<{
        items: MessageEntity[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    getHistory(messageId: string): Promise<MessageStatusHistoryEntity[]>;
}
