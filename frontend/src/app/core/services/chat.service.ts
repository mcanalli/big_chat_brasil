import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Conversation } from '../models/conversation.model';
import { Message, SendMessageRequest, SendMessageResponse, SendBulkMessagesRequest, SendBulkMessagesResponse } from '../models/message.model';
import { tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:3000/api';

  getConversations(clientId?: string) {
    let params = new HttpParams();
    if (clientId) {
      params = params.set('clientId', clientId);
    }
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations`, { params });
  }

  getMessages(conversationId: string) {
    return this.http.get<Message[]>(`${this.apiUrl}/conversations/${conversationId}/messages`);
  }

  sendMessage(payload: any) {
    return this.http.post<Message>(`${this.apiUrl}/messages`, payload);
  }

  sendBulkMessages(payload: SendBulkMessagesRequest) {
    return this.http.post<SendBulkMessagesResponse>(`${this.apiUrl}/messages/bulk`, payload).pipe(
      tap(res => {
        if (res.newBalance !== undefined) {
          this.authService.updateBalance(res.newBalance);
        } else {
          // Se o backend não retornar o novo saldo no bulk, podemos forçar um refresh do saldo
          this.authService.refreshBalance().subscribe();
        }
      })
    );
  }
}
