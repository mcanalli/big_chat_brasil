import { ConversationEntity } from './conversation.entity';
import { ClientEntity } from './client.entity';

describe('ConversationEntity', () => {
  it('should create a conversation entity instance', () => {
    const conversation = new ConversationEntity();
    conversation.clientId = 'client-uuid';
    conversation.recipientPhone = '5511999999999';
    conversation.recipientName = 'Recipient Name';
    conversation.lastMessageContent = 'Hello';
    conversation.lastMessageTime = new Date();
    conversation.unreadCount = 1;

    expect(conversation).toBeDefined();
    expect(conversation.clientId).toBe('client-uuid');
    expect(conversation.recipientPhone).toBe('5511999999999');
    expect(conversation.recipientName).toBe('Recipient Name');
    expect(conversation.lastMessageContent).toBe('Hello');
    expect(conversation.unreadCount).toBe(1);
  });

  it('should have associations defined', () => {
    const conversation = new ConversationEntity();
    const client = new ClientEntity();
    conversation.client = client;
    conversation.messages = [];

    expect(conversation.client).toBeInstanceOf(ClientEntity);
    expect(conversation.messages).toEqual([]);
  });
});
