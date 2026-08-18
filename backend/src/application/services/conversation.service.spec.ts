import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { NotFoundException } from '@nestjs/common';

describe('ConversationService', () => {
  let service: ConversationService;
  let repo: any;
  let clientRepo: any;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn().mockImplementation(dto => dto),
      save: jest.fn().mockImplementation(async dto => ({ id: 'new-id', ...dto })),
    };

    clientRepo = {
      findOne: jest.fn(),
    };

    // Adiciona o manager no mock do repositório
    repo.manager = {
      findOne: jest.fn().mockImplementation((entity, options) => {
        if (entity === ClientEntity) {
          return clientRepo.findOne(options);
        }
        return repo.findOne(options);
      }),
      create: jest.fn().mockImplementation((entity, dto) => repo.create(dto)),
      save: jest.fn().mockImplementation(async entity => repo.save(entity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: getRepositoryToken(ConversationEntity), useValue: repo },
        { provide: getRepositoryToken(ClientEntity), useValue: clientRepo },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
  });

  it('should find existing conversation', async () => {
    const existing = { id: '1', recipientPhone: '123' };
    repo.findOne.mockResolvedValue(existing);
    const result = await service.findOrCreate('client-1', '123', 'Name');
    expect(result).toBe(existing);
  });

  it('should update recipient name if changed', async () => {
    const existing = { id: '1', recipientPhone: '123', recipientName: 'Old' };
    repo.findOne.mockResolvedValue(existing);
    await service.findOrCreate('client-1', '123', 'New');
    expect(existing.recipientName).toBe('New');
    expect(repo.save).toHaveBeenCalled();
  });

  it('should throw if client not found during creation', async () => {
    repo.findOne.mockResolvedValue(null);
    clientRepo.findOne.mockResolvedValue(null);
    await expect(service.findOrCreate('c-1', '123')).rejects.toThrow(NotFoundException);
  });

  it('should find by client', async () => {
    repo.find.mockResolvedValue([]);
    await service.findByClient('c-1');
    expect(repo.find).toHaveBeenCalled();
  });

  it('should find by id', async () => {
    repo.findOne.mockResolvedValue({ id: '1' });
    await service.findById('1');
    expect(repo.findOne).toHaveBeenCalled();
  });

  it('should throw if not found by id', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });
});