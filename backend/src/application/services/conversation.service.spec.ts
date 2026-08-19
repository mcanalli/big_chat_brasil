import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from './conversation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConversationEntity } from '../../domain/entities/conversation.entity';
import { ClientEntity } from '../../domain/entities/client.entity';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('ConversationService', () => {
  let service: ConversationService;
  let repo: jest.Mocked<Repository<ConversationEntity>>;
  let clientRepo: jest.Mocked<Repository<ClientEntity>>;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      create: jest.fn().mockImplementation((dto: any) => dto),
      save: jest
        .fn()

        .mockImplementation((dto: any) =>
          Promise.resolve({ id: 'new-id', ...dto }),
        ),
      manager: {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      },
    } as unknown as jest.Mocked<Repository<ConversationEntity>>;

    clientRepo = {
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<ClientEntity>>;

    (repo.manager.findOne as jest.Mock).mockImplementation(
      (entity: any, options: any): any => {
        if (entity === ClientEntity) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          return clientRepo.findOne(options);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return repo.findOne(options);
      },
    );
    (repo.manager.create as jest.Mock).mockImplementation(
      (entity: any, dto: any): any => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return repo.create(dto);
      },
    );
    (repo.manager.save as jest.Mock).mockImplementation((entity: any): any =>
      repo.save(entity),
    );

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
    const existing = { id: '1', recipientPhone: '123' } as ConversationEntity;
    (repo.findOne as jest.Mock).mockResolvedValue(existing);
    const result = await service.findOrCreate('client-1', '123', 'Name');
    expect(result).toBe(existing);
  });

  it('should update recipient name if changed', async () => {
    const existing = {
      id: '1',
      recipientPhone: '123',
      recipientName: 'Old',
    } as ConversationEntity;
    (repo.findOne as jest.Mock).mockResolvedValue(existing);
    await service.findOrCreate('client-1', '123', 'New');
    expect(existing.recipientName).toBe('New');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.save).toHaveBeenCalled();
  });

  it('should throw if client not found during creation', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(null);
    (clientRepo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.findOrCreate('c-1', '123')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find by client', async () => {
    (repo.find as jest.Mock).mockResolvedValue([]);
    await service.findByClient('c-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.find).toHaveBeenCalled();
  });

  it('should find by id', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue({
      id: '1',
    });
    await service.findById('1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.findOne).toHaveBeenCalled();
  });

  it('should throw if not found by id', async () => {
    (repo.findOne as jest.Mock).mockResolvedValue(null);
    await expect(service.findById('1')).rejects.toThrow(NotFoundException);
  });
});
