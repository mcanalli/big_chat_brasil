import { Injectable, inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  private zone = inject(NgZone);
  private readonly apiUrl = 'http://localhost:3000/api';

  /**
   * Conecta ao stream de SSE para receber atualizações de status.
   */
  listenToStatusUpdates(): Observable<any> {
    return new Observable(observer => {
      const eventSource = new EventSource(`${this.apiUrl}/real-time/status-updates`);

      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data);
            observer.next(data);
          } catch (err) {
            observer.error(err);
          }
        });
      };

      eventSource.onerror = (error) => {
        this.zone.run(() => {
          observer.error(error);
        });
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
