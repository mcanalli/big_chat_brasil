import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { AuthDto } from '../dtos/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(async () => {
    service = {
      login: jest.fn().mockReturnValue({ token: 'abc' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: service }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should login', () => {
    const dto: AuthDto = {
      email: 'admin@bigchatbrasil.com.br',
      password: 'password',
    };
    expect(controller.login(dto)).toEqual({ token: 'abc' });
  });
});
