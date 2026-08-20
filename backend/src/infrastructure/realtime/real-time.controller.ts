import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { RealTimeService } from './real-time.service';

@Controller('real-time')
export class RealTimeController {
  constructor(private readonly realTimeService: RealTimeService) {}

  /**
   * Endpoint de Server-Sent Events (SSE) para atualizações em tempo real.
   * O frontend deve se conectar em: GET /api/real-time/status-updates
   */
  @Sse('status-updates')
  statusUpdates(): Observable<MessageEvent> {
    return this.realTimeService.getStatusUpdatesObservable();
  }

  /**
   * Escuta eventos do RabbitMQ emitidos pelo Worker e encaminha para o SSE.
   */
  @EventPattern('message.status.updated')
  handleMessageStatusUpdated(@Payload() data: any) {
    this.realTimeService.emitStatusUpdate(data);
  }
}
