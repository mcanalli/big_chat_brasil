import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConversationService } from '../../application/services/conversation.service';
import { CreateConversationDto } from '../dtos/create-conversation.dto';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ou recuperar uma conversa' })
  @ApiResponse({ status: 201, description: 'Conversa criada ou recuperada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async findOrCreate(@Body() dto: CreateConversationDto) {
    return this.conversationService.findOrCreate(
      dto.clientId,
      dto.recipientPhone,
      dto.recipientName,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Listar conversas por cliente' })
  async findByClient(@Query('clientId') clientId: string) {
    return this.conversationService.findByClient(clientId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Listar mensagens de uma conversa' })
  async findById(@Param('id') id: string) {
    return this.conversationService.findById(id);
  }
}

