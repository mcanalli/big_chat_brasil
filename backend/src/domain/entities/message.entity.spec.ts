import { MessageEntity } from './message.entity';
import { ConversationEntity } from './conversation.entity';
import { ClientEntity } from './client.entity';

describe('MessageEntity', () => {
  it('should create a message entity instance', () => {
    const message = new MessageEntity();
    message.conversationId = 'conv-uuid';
    message.senderId = 'client-uuid';
    message.recipientPhone = '5511999999999';
    message.channel = 'SMS';
    message.content = 'Test message';
    message.priority = 'normal';
    message.status = 'queued';
    message.cost = 0.10;

    expect(message).toBeDefined();
    expect(message.conversationId).toBe('conv-uuid');
    expect(message.senderId).toBe('client-uuid');
    expect(message.recipientPhone).toBe('5511999999999');
    expect(message.channel).toBe('SMS');
    expect(message.content).toBe('Test message');
    expect(message.priority).toBe('normal');
    expect(message.status).toBe('queued');
    expect(message.cost).toBe(0.10);
  });

  it('should have associations defined', () => {
    const message = new MessageEntity();
    const conversation = new ConversationEntity();
    const sender = new ClientEntity();
    
    message.conversation = conversation;
    message.sender = sender;
    message.statusHistory = [];

    expect(message.conversation).toBeInstanceOf(ConversationEntity);
    expect(message.sender).toBeInstanceOf(ClientEntity);
    expect(message.statusHistory).toEqual([]);
  });
});
