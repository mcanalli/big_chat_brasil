export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: 'CLIENT' | 'CONTACT';
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'QUEUED' | 'PROCESSING' | 'FAILED';
  priority?: 'NORMAL' | 'URGENT';
}

export interface SendMessageRequest {
  conversationId?: string;
  contactId?: string;
  content: string;
  priority?: 'NORMAL' | 'URGENT';
}

export interface SendBulkMessagesRequest {
  senderId: string;
  recipientPhones: string[];
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
  newBalance?: number; // Adicionado para facilitar no frontend se o backend retornar
}

