import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class RealTimeService {
  private statusUpdates$ = new Subject<any>();

  /**
   * Emite uma atualização de status para os clientes conectados.
   */
  emitStatusUpdate(payload: any) {
    this.statusUpdates$.next({ data: payload });
  }

  /**
   * Retorna o Observable para o stream de SSE.
   */
  getStatusUpdatesObservable(): Observable<any> {
    return this.statusUpdates$.asObservable();
  }
}
