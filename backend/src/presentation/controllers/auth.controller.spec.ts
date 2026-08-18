import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(async () => {
    service = {
      login: jest.fn().mockResolvedValue({ token: 'abc' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: service },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should login', async () => {
    expect(await controller.login({} as any)).toEqual({ token: 'abc' });
  });
});
