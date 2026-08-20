import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { AuthRequestDto } from '../dtos/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    service = {
      login: jest.fn().mockReturnValue({ token: 'abc' }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should login', () => {
    const dto: AuthRequestDto = {
      documentId: '12345678900',
      documentType: 'CPF',
    };
    expect(controller.login(dto)).toEqual({ token: 'abc' });
  });
});
