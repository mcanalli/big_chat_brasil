import { Repository, DataSource } from 'typeorm';
import { MessageEntity } from '../../domain/entities/message.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ConversationService } from './conversation.service';
import { QueueService } from '../../infrastructure/queue/queue.service';
import { SendMessageDto } from '../../presentation/dtos/send-message.dto';
import { ReportFilterDto } from '../../presentation/dtos/report-filter.dto';
import { MessageStatusHistoryEntity } from '../../domain/entities/message-status-history.entity';
import { BulkSendResponseDto, SendBulkMessageDto } from '../../presentation/dtos/send-bulk-message.dto';
import { InboundMessageDto } from '../../presentation/dtos/inbound-message.dto';
import { PricingService } from './pricing.service';
export declare class MessageService {
    private readonly messageRepo;
    private readonly clientRepo;
    private readonly statusHistoryRepo;
    private readonly conversationService;
    private readonly queueService;
    private readonly pricingService;
    private readonly dataSource;
    constructor(messageRepo: Repository<MessageEntity>, clientRepo: Repository<ClientEntity>, statusHistoryRepo: Repository<MessageStatusHistoryEntity>, conversationService: ConversationService, queueService: QueueService, pricingService: PricingService, dataSource: DataSource);
    sendMessage(dto: SendMessageDto): Promise<MessageEntity>;
    sendBulkMessage(dto: SendBulkMessageDto): Promise<BulkSendResponseDto>;
    getReport(filter: ReportFilterDto): Promise<{
        items: MessageEntity[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    getHistory(messageId: string): Promise<MessageStatusHistoryEntity[]>;
    receiveInboundMessage(dto: InboundMessageDto): Promise<MessageEntity>;
}
