import { MessageEntity } from './message.entity';
export declare enum ClientType {
    PRE_PAID = "PRE_PAID",
    POST_PAID = "POST_PAID"
}
export declare class ClientEntity {
    id: string;
    name: string;
    identifier: string;
    type: ClientType;
    balance: number;
    limit: number;
    consumed: number;
    messages: MessageEntity[];
}
