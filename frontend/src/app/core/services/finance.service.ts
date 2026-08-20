import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AddCreditsDto {
  amount: number;
  description?: string;
}

export interface AdjustLimitDto {
  newLimit: number;
}

export interface ConvertPlanDto {
  newPlanType: 'prepaid' | 'postpaid';
  initialLimit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/admin';

  addCredits(clientId: string, dto: AddCreditsDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/credits`, dto);
  }

  adjustLimit(clientId: string, dto: AdjustLimitDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clients/${clientId}/limit`, dto);
  }

  convertPlan(clientId: string, dto: ConvertPlanDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/convert-plan`, dto);
  }

  getTransactions(clientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients/${clientId}/transactions`);
  }
}
