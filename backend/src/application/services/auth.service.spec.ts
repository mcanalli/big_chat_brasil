import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a token on successful login', async () => {
    const result = await service.login({
      email: 'admin@bigchatbrasil.com.br',
      password: 'admin123',
    });
    expect(result).toHaveProperty('access_token');
    expect(result.user.email).toBe('admin@bigchatbrasil.com.br');
  });

  it('should throw UnauthorizedException on invalid credentials', async () => {
    await expect(
      service.login({
        email: 'wrong@email.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
