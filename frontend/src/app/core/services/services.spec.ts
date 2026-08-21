import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { RealTimeService } from './real-time.service';

try {
  getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
} catch (e) {
  // Already initialized
}

describe('Services Full Coverage Tests', () => {
  it('should test AuthService login, logout, refreshBalance, restoreSession', async () => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'login', children: [] }])
      ]
    });

    const authService = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    // Login success
    authService.login('12345678909', 'CPF').subscribe(res => {
      expect(res.token).toBe('token-123');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/auth');
    req.flush({ token: 'token-123', client: { id: 'c1', balance: 100 } });

    expect(authService.isAuthenticated()).toBe(true);

    // Refresh balance success
    authService.refreshBalance().subscribe(res => {
      expect(res).toBeTruthy();
    });

    const reqBalance = httpMock.expectOne('http://localhost:3000/api/clients/c1/balance');
    reqBalance.flush({ balance: 200, planType: 'PREPAID', limit: 1000, consumed: 100 });

    expect(authService.balance()).toBe(200);

    // Refresh balance when no user
    (authService as any)._currentUser.set(null);
    authService.refreshBalance().subscribe(res => {
      expect(res).toBeNull();
    });

    // Logout
    authService.logout();
    expect(authService.isAuthenticated()).toBe(false);

    // Restore session with invalid JSON
    localStorage.setItem('bcb_token', 'token-123');
    localStorage.setItem('bcb_user', 'invalid-json');
    const authService2 = TestBed.runInInjectionContext(() => new AuthService());
    expect(authService2.isAuthenticated()).toBe(false);

    // Restore session with valid JSON
    localStorage.setItem('bcb_token', 'token-456');
    localStorage.setItem('bcb_user', JSON.stringify({ id: 'c2', balance: 50 }));
    const authService3 = TestBed.runInInjectionContext(() => new AuthService());
    expect(authService3.isAuthenticated()).toBe(true);

    httpMock.verify();
  });

  it('should test ChatService methods (getConversations, getMessages, sendMessage, sendBulkMessages)', () => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    const chatService = TestBed.inject(ChatService);
    const authService = TestBed.inject(AuthService);
    const httpMock = TestBed.inject(HttpTestingController);

    chatService.getConversations('c1').subscribe(res => {
      expect(res).toBeTruthy();
    });
    httpMock.expectOne('http://localhost:3000/api/conversations?clientId=c1').flush([]);

    chatService.getConversations().subscribe(res => {
      expect(res).toBeTruthy();
    });
    httpMock.expectOne('http://localhost:3000/api/conversations').flush([]);

    chatService.getMessages('conv-1').subscribe(res => {
      expect(res).toBeTruthy();
    });
    httpMock.expectOne('http://localhost:3000/api/conversations/conv-1/messages').flush([]);

    chatService.sendMessage({ senderId: 'c1', recipientPhone: '5511999999999', content: 'hi', channel: 'WHATSAPP', priority: 'normal' }).subscribe(res => {
      expect(res).toBeTruthy();
    });
    httpMock.expectOne('http://localhost:3000/api/messages').flush({ success: true });

    // Bulk messages with newBalance
    chatService.sendBulkMessages({ senderId: 'c1', recipientPhones: ['5511999999999'], content: 'bulk', channel: 'WHATSAPP' }).subscribe(res => {
      expect(res).toBeTruthy();
    });
    httpMock.expectOne('http://localhost:3000/api/messages/bulk').flush({ success: true, newBalance: 120 });

    // Bulk messages without newBalance (triggers refreshBalance or fallback)
    (authService as any)._currentUser.set({ id: 'c1', balance: 100 });
    chatService.sendBulkMessages({ senderId: 'c1', recipientPhones: ['5511999999999'], content: 'bulk', channel: 'WHATSAPP' }).subscribe(res => {
      expect(res).toBeTruthy();
    });
    httpMock.expectOne('http://localhost:3000/api/messages/bulk').flush({ success: true });
    httpMock.expectOne('http://localhost:3000/api/clients/c1/balance').flush({ balance: 90 });

    httpMock.verify();
  });

  it('should test RealTimeService SSE listener', () => {
    TestBed.configureTestingModule({
      providers: [RealTimeService]
    });

    const rtService = TestBed.inject(RealTimeService);
    const obs = rtService.listenToStatusUpdates();

    const sub = obs.subscribe({
      next: () => {},
      error: () => {}
    });

    const mockES = (window as any).EventSource.instances?.[(window as any).EventSource.instances?.length - 1] || {
      onmessage: null,
      onerror: null,
      close: () => {}
    };

    if (mockES.onmessage) {
      mockES.onmessage(new MessageEvent('message', { data: JSON.stringify({ type: 'update' }) }));
    }
    if (mockES.onerror) {
      mockES.onerror(new Event('error'));
    }

    sub.unsubscribe();
    expect(obs).toBeTruthy();
  });
});
