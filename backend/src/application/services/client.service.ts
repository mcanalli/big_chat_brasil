import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEntity } from '../../domain/entities/client.entity';
import { CreateClientDto } from '../../presentation/dtos/create-client.dto';
import { UpdateClientDto } from '../../presentation/dtos/update-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async findAll() {
    return this.clientRepository.find();
  }

  async findOne(id: string) {
    const client = await this.clientRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }
    return client;
  }

  async create(createClientDto: CreateClientDto) {
    const client = this.clientRepository.create(createClientDto);
    return this.clientRepository.save(client);
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async getBalance(id: string) {
    const client = await this.findOne(id);
    return {
      id: client.id,
      planType: client.planType,
      balance: client.balance,
      limit: client.limit,
      consumed: client.consumed,
      available:
        client.planType === 'prepaid'
          ? client.balance
          : client.limit - client.consumed,
    };
  }
}
