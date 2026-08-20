import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap, of } from 'rxjs';
import { AuthRequest, AuthResponse, Client } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  
  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'bcb_token';
  private readonly USER_KEY = 'bcb_user';

  // Signals para estado reativo
  private _currentUser = signal<Client | null>(null);
  private _token = signal<string | null>(null);

  currentUser = this._currentUser.asReadonly();
  token = this._token.asReadonly();
  isAuthenticated = computed(() => !!this._token());
  balance = computed(() => this._currentUser()?.balance ?? 0);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
    }
  }

  login(document: string, type: 'CPF' | 'CNPJ') {
    const payload: AuthRequest = { document, type };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  logout() {
    this._currentUser.set(null);
    this._token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.router.navigate(['/login']);
  }

  refreshBalance() {
    const user = this._currentUser();
    if (!user) return of({ balance: 0 });
    return this.http.get<{ balance: number }>(`${this.apiUrl}/clients/${user.id}/balance`).pipe(
      tap(res => this.updateBalance(res.balance))
    );
  }

  updateBalance(newBalance: number) {
    const current = this._currentUser();
    if (current) {
      const updated = { ...current, balance: newBalance };
      this._currentUser.set(updated);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
      }
    }
  }

  private setSession(auth: AuthResponse) {
    this._token.set(auth.token);
    this._currentUser.set(auth.client);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, auth.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(auth.client));
    }
  }

  private restoreSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson) {
      try {
        this._token.set(token);
        this._currentUser.set(JSON.parse(userJson));
      } catch (e) {
        this.logout();
      }
    }
  }
}

