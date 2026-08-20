import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientEntity } from '../../domain/entities/client.entity';

describe('AuthService', () => {
  let service: AuthService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(ClientEntity),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a token on successful login', async () => {
    const mockClient = {
      id: 'uuid',
      name: 'Test Client',
      documentId: '12345678900',
      documentType: 'CPF',
      planType: 'prepaid',
      balance: 50,
      active: true,
    };
    repo.findOne.mockResolvedValue(mockClient);

    const result = await service.login({
      documentId: '12345678900',
      documentType: 'CPF',
    });
    expect(result).toHaveProperty('token');
    expect(result.client.documentId).toBe('12345678900');
  });

  it('should throw NotFoundException on client not found', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(
      service.login({
        documentId: 'notfound',
        documentType: 'CPF',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
