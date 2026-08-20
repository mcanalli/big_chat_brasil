import { describe, beforeEach, it, expect, jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from '../../application/services/admin.service';
import { AddCreditsDto, AdjustLimitDto, ConvertPlanDto } from '../dtos/admin.dto';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  beforeEach(async () => {
    service = {
      addCredits: jest
        .fn<AdminService['addCredits']>()
        .mockResolvedValue({ success: true, newBalance: 0 }),
      adjustLimit: jest
        .fn<AdminService['adjustLimit']>()
        .mockResolvedValue({
          success: true,
          previousLimit: 0,
          newLimit: 100,
        }),
      convertPlan: jest
        .fn<AdminService['convertPlan']>()
        .mockResolvedValue({
          success: true,
        } as unknown as Awaited<ReturnType<AdminService['convertPlan']>>),
      getTransactions: jest
        .fn<AdminService['getTransactions']>()
        .mockResolvedValue([]),
    } as unknown as jest.Mocked<AdminService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: service }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should add credits', async () => {
    const dto: AddCreditsDto = { amount: 10 };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(await controller.addCredits('1', dto)).toEqual({
      success: true,
    });
  });

  it('should adjust limit', async () => {
    const dto: AdjustLimitDto = { newLimit: 100 };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(await controller.adjustLimit('1', dto)).toEqual({
      success: true,
    });
  });

  it('should convert plan', async () => {
    const dto: ConvertPlanDto = { newPlanType: 'postpaid' };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    expect(await controller.convertPlan('1', dto)).toEqual({ success: true });
  });

  it('should get transactions', async () => {
    expect(await controller.getTransactions('1')).toEqual([]);
  });
});
