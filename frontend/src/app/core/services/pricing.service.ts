import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessagePricing } from '../models/pricing.model';

@Injectable({
  providedIn: 'root'
})
export class PricingService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/pricings';

  getPricings() {
    return this.http.get<MessagePricing[]>(this.apiUrl);
  }

  getPricingByPriority(priority: string) {
    return this.http.get<{ priority: string, cost: number }>(`${this.apiUrl}/${priority}`);
  }

  getCost(channel: string, priority: string) {
    return this.http.get<{ channel: string, priority: string, cost: number }>(`${this.apiUrl}/${channel}/${priority}`);
  }
}
