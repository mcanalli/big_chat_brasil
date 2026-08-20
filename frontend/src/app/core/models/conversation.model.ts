import { Message } from './message.model';

export interface Conversation {
  id: string;
  clientId: string;
  recipientId?: string;
  recipientPhone: string;
  recipientName?: string;
  lastMessageContent?: string;
  lastMessageTime?: string | Date;
  unreadCount: number;
  updatedAt: string | Date;
  messages?: Message[];
  
  // Compatibilidade com código legado se houver
  contactName?: string;
}

