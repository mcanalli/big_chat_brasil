import { Message } from './message.model';

export interface Conversation {
  id: string;
  contactName: string;
  contactDocument: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}
