import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessageService } from '../../application/services/message.service';
import { SendMessageDto } from '../dtos/send-message.dto';
import { ReportFilterDto } from '../dtos/report-filter.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar uma nova mensagem' })
  async send(@Body() dto: SendMessageDto) {
    return this.messageService.sendMessage(dto);
  }

  @Get('report')
  @ApiOperation({ summary: 'Relatório de mensagens paginado' })
  async getReport(@Query() filter: ReportFilterDto) {
    return this.messageService.getReport(filter);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Histórico de status de uma mensagem' })
  async getHistory(@Param('id') id: string) {
    return this.messageService.getHistory(id);
  }
}
