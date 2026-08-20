import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRequestDto } from '../../presentation/dtos/auth.dto';
import { ClientEntity } from '../../domain/entities/client.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  async login(authRequestDto: AuthRequestDto) {
    const { documentId, documentType } = authRequestDto;

    const client = await this.clientRepository.findOne({
      where: { documentId, documentType },
    });

    if (!client) {
      throw new NotFoundException(
        'Cliente não encontrado com o documento informado',
      );
    }

    return {
      token: `mock-jwt-token-${client.id}`,
      client: {
        id: client.id,
        name: client.name,
        documentId: client.documentId,
        documentType: client.documentType,
        planType: client.planType,
        balance: Number(client.balance),
        active: client.active,
      },
    };
  }
}
