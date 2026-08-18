import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClientService } from '../../application/services/client.service';
import { CreateClientDto } from '../dtos/create-client.dto';
import { UpdateClientDto } from '../dtos/update-client.dto';

@ApiTags('Clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  async findAll() {
    return this.clientService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter dados de um cliente específico' })
  async findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de um cliente' })
  async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(id, updateClientDto);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Obter saldo/limite do cliente' })
  async getBalance(@Param('id') id: string) {
    return this.clientService.getBalance(id);
  }
}
