import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConversationService } from '../../application/services/conversation.service';

@ApiTags('Conversations')
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @ApiOperation({ summary: 'Criar ou recuperar uma conversa' })
  async findOrCreate(
    @Body() body: { clientId: string; recipientPhone: string; recipientName?: string },
  ) {
    return this.conversationService.findOrCreate(
      body.clientId,
      body.recipientPhone,
      body.recipientName,
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