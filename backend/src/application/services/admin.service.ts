import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientEntity } from '../../domain/entities/client.entity';
import { FinancialTransactionEntity } from '../../domain/entities/financial-transaction.entity';
import {
  AddCreditsDto,
  AdjustLimitDto,
  ConvertPlanDto,
} from '../../presentation/dtos/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
    @InjectRepository(FinancialTransactionEntity)
    private readonly transactionRepository: Repository<FinancialTransactionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async addCredits(clientId: string, addCreditsDto: AddCreditsDto) {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    if (client.planType !== 'prepaid') {
      throw new BadRequestException(
        'Apenas clientes pré-pagos podem receber créditos',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousBalance = Number(client.balance);
      const amount = Number(addCreditsDto.amount);
      client.balance = previousBalance + amount;

      const transaction = this.transactionRepository.create({
        clientId,
        type: 'CREDIT_PURCHASE',
        amount,
        previousBalance,
        newBalance: client.balance,
        description:
          addCreditsDto.description || 'Adição de créditos via admin',
      });

      await queryRunner.manager.save(client);
      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return { success: true, newBalance: client.balance };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async adjustLimit(clientId: string, adjustLimitDto: AdjustLimitDto) {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');
    if (client.planType !== 'postpaid') {
      throw new BadRequestException(
        'Apenas clientes pós-pagos possuem limite de crédito',
      );
    }

    const previousLimit = client.limit;
    client.limit = adjustLimitDto.newLimit;

    await this.clientRepository.save(client);

    return { success: true, previousLimit, newLimit: client.limit };
  }

  async convertPlan(clientId: string, convertPlanDto: ConvertPlanDto) {
    const client = await this.clientRepository.findOne({
      where: { id: clientId },
    });
    if (!client) throw new NotFoundException('Cliente não encontrado');

    if (client.planType === convertPlanDto.newPlanType) {
      throw new BadRequestException('O cliente já possui este tipo de plano');
    }

    client.planType = convertPlanDto.newPlanType;
    if (convertPlanDto.newPlanType === 'postpaid') {
      client.limit = convertPlanDto.initialLimit || 0;
      client.consumed = 0;
    } else {
      client.balance = 0;
    }

    await this.clientRepository.save(client);
    return client;
  }

  async getTransactions(clientId: string) {
    return this.transactionRepository.find({
      where: { clientId },
      order: { timestamp: 'DESC' },
    });
  }
}
