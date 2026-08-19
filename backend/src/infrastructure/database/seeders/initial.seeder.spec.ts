import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, QueryRunner } from 'typeorm';
import { InitialSeeder } from './initial.seeder';

describe('InitialSeeder', () => {
  let seeder: InitialSeeder;

  let queryRunner: Partial<QueryRunner>;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn().mockResolvedValue(null),
      startTransaction: jest.fn().mockResolvedValue(null),
      commitTransaction: jest.fn().mockResolvedValue(null),
      rollbackTransaction: jest.fn().mockResolvedValue(null),
      release: jest.fn().mockResolvedValue(null),
      manager: {
        findOne: jest.fn().mockResolvedValue(null),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        create: jest.fn().mockImplementation((entity: any, data: any) => ({
          id: 'generated-uuid',
          ...data,
        })),
        save: jest.fn().mockResolvedValue(null),
      } as unknown as QueryRunner['manager'],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InitialSeeder,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    seeder = module.get<InitialSeeder>(InitialSeeder);
  });

  it('should be defined', () => {
    expect(seeder).toBeDefined();
  });

  it('should seed data successfully', async () => {
    await seeder.seed();

    expect(queryRunner.connect).toHaveBeenCalled();

    expect(queryRunner.startTransaction).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(queryRunner.manager!.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(queryRunner.manager!.save).toHaveBeenCalled();

    expect(queryRunner.commitTransaction).toHaveBeenCalled();

    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('should rollback transaction on error', async () => {
    (queryRunner.manager?.save as jest.Mock).mockRejectedValueOnce(
      new Error('Save failed'),
    );

    await expect(() => seeder.seed()).rejects.toThrow('Save failed');

    expect(queryRunner.rollbackTransaction).toHaveBeenCalled();

    expect(queryRunner.release).toHaveBeenCalled();
  });
});
