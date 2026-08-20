export interface Message {
  id?: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';
  priority?: 'normal' | 'urgente';
  timestamp: string | Date;
  senderId?: string;
  recipientPhone?: string;
  channel?: 'SMS' | 'WHATSAPP';
  cost?: number;
}

export interface SendMessageRequest {
  senderId: string;
  recipientPhone: string;
  recipientName?: string;
  content: string;
  channel: 'SMS' | 'WHATSAPP';
  priority?: 'normal' | 'urgente';
}

export interface SendBulkMessagesRequest {
  senderId: string;
  recipientPhones: string[];
  recipientNames?: string[];
  content: string;
  channel: 'WHATSAPP' | 'SMS';
  priority?: 'normal' | 'urgente';
}

export interface SendMessageResponse {
  message: Message;
  newBalance: number;
}

export interface SendBulkMessagesResponse {
  bulkId: string;
  totalRecipients: number;
  totalCost: number;
  status: string;
  newBalance?: number;
}

