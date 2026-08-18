import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from '../../application/services/admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let service: any;

  beforeEach(async () => {
    service = {
      addCredits: jest.fn().mockResolvedValue({ success: true }),
      adjustLimit: jest.fn().mockResolvedValue({ success: true }),
      convertPlan: jest.fn().mockResolvedValue({ success: true }),
      getTransactions: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: service },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should add credits', async () => {
    expect(await controller.addCredits('1', { amount: 10 } as any)).toEqual({ success: true });
  });

  it('should adjust limit', async () => {
    expect(await controller.adjustLimit('1', { newLimit: 100 } as any)).toEqual({ success: true });
  });

  it('should convert plan', async () => {
    expect(await controller.convertPlan('1', { planType: 'postpaid' } as any)).toEqual({ success: true });
  });

  it('should get transactions', async () => {
    expect(await controller.getTransactions('1')).toEqual([]);
  });
});

