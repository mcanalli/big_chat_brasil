import { MessageStatusHistoryEntity } from './message-status-history.entity';
import { MessageEntity } from './message.entity';

describe('MessageStatusHistoryEntity', () => {
  it('should create a message status history entity instance', () => {
    const history = new MessageStatusHistoryEntity();
    history.messageId = 'message-uuid';
    history.status = 'sent';
    history.details = 'Status update details';

    expect(history).toBeDefined();
    expect(history.messageId).toBe('message-uuid');
    expect(history.status).toBe('sent');
    expect(history.details).toBe('Status update details');
  });

  it('should have associations defined', () => {
    const history = new MessageStatusHistoryEntity();
    const message = new MessageEntity();
    
    history.message = message;

    expect(history.message).toBeInstanceOf(MessageEntity);
  });
});
