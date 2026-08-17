import { ClientEntity } from './client.entity';
export declare enum MessageUrgency {
    NORMAL = "NORMAL",
    URGENT = "URGENT"
}
export declare enum MessageStatus {
    QUEUED = "queued",
    PROCESSING = "processing",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed"
}
export declare class MessageEntity {
    id: string;
    content: string;
    urgency: MessageUrgency;
    status: MessageStatus;
    cost: number;
    createdAt: Date;
    client: ClientEntity;
    clientId: string;
    conversationId: string;
}
