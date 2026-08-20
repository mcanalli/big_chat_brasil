import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, switchMap, filter } from 'rxjs';
import { AuthService } from './auth.service';
import { RealTimeService } from './real-time.service';

@Injectable({
  providedIn: 'root'
})
export class PollingService implements OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private realTimeService = inject(RealTimeService);
  private readonly apiUrl = 'http://localhost:3000/api';
  
  private pollingSub?: Subscription;
  private realTimeSub?: Subscription;
  
  // Signal para indicar que houve atualização (pode ser consumido pelos componentes)
  syncTick = signal<number>(0);

  constructor() {
    this.startPolling();
    this.startRealTime();
  }

  startRealTime() {
    this.realTimeSub = this.realTimeService.listenToStatusUpdates().subscribe({
      next: (update) => {
        console.log('Update de status recebido via SSE:', update);
        // Incrementa o tick para forçar atualização da UI
        this.syncTick.update(v => v + 1);
      },
      error: (err) => console.error('SSE Error:', err)
    });
  }

  startPolling() {
    if (this.pollingSub) return;

    // Polling a cada 10 segundos apenas se autenticado
    this.pollingSub = interval(10000).pipe(
      filter(() => this.authService.isAuthenticated()),
      switchMap(() => {
        const client = this.authService.currentUser();
        return this.http.get<{ balance: number }>(`${this.apiUrl}/clients/${client?.id}/balance`);
      })
    ).subscribe({
      next: (res) => {
        this.authService.updateBalance(res.balance);
        this.syncTick.update(v => v + 1);
      },
      error: (err) => console.error('Polling error', err)
    });
  }

  stopPolling() {
    this.pollingSub?.unsubscribe();
    this.pollingSub = undefined;
    this.realTimeSub?.unsubscribe();
    this.realTimeSub = undefined;
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}
