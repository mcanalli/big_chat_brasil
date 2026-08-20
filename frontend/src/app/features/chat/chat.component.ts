import { Component, inject, signal, computed, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { PollingService } from '../../core/services/polling.service';
import { Conversation } from '../../core/models/conversation.model';
import { Message, SendMessageRequest } from '../../core/models/message.model';
import { BulkMessageDialogComponent } from '../../components/bulk-message-dialog/bulk-message-dialog.component';
import { FinanceDialogComponent } from '../../components/finance-dialog/finance-dialog.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatBadgeModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent {
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private pollingService = inject(PollingService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  currentUser = this.authService.currentUser;
  balance = this.authService.balance;
  
  @ViewChild('messagesViewport') private messagesViewport!: ElementRef;

  conversations = signal<Conversation[]>([]);
  selectedConversation = signal<Conversation | null>(null);
  isMobileChatOpen = signal(false);
  messages = signal<Message[]>([]);
  
  searchQuery = signal('');
  newMessage = signal('');
  isUrgent = signal(false);

  filteredConversations = computed(() => {
    const searchTerm = this.searchQuery()?.toLowerCase().trim() || '';
    return this.conversations().filter(conv => {
      const name = (conv.recipientName || conv.contactName || '').toLowerCase();
      const phone = (conv.recipientPhone || '').toLowerCase();
      return name.includes(searchTerm) || phone.includes(searchTerm);
    });
  });

  constructor() {
    this.loadConversations();
    
    // Recarrega mensagens quando a conversa selecionada muda ou o polling "tika"
    effect(() => {
      const conv = this.selectedConversation();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const tick = this.pollingService.syncTick(); 
      if (conv) {
        this.loadMessages(conv.id);
      }
      this.loadConversations();
    }, { allowSignalWrites: true });

    // Scroll to bottom when messages change
    effect(() => {
      this.messages();
      this.scrollToBottom();
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesViewport) {
        const element = this.messagesViewport.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    }, 100);
  }

  loadConversations() {
    const client = this.currentUser();
    if (!client) return;

    this.chatService.getConversations(client.id).subscribe((res: any) => {
      const list = Array.isArray(res) ? res : (res.data || (res ? [res] : []));
      this.conversations.set(list);
    });
  }

  loadMessages(conversationId: string) {
    this.chatService.getMessages(conversationId).subscribe((res: any) => {
      // O backend retorna a conversa com as mensagens dentro ou o array diretamente
      const list = Array.isArray(res) ? res : (res.messages || res.data || (res ? [res] : []));
      this.messages.set(list);
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
    this.isMobileChatOpen.set(true);
    this.newMessage.set('');
    this.isUrgent.set(false);
  }

  closeChatMobile() {
    this.isMobileChatOpen.set(false);
  }

  openFinance() {
    this.openFinanceDialog();
  }

  openBulkSend() {
    this.openBulkDialog();
  }

  openNewConversation() {
    // Implementação pendente ou abrir um diálogo de busca/novo contato
    this.snackBar.open('Funcionalidade de Nova Conversa em breve!', 'Fechar', { duration: 2000 });
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content) return;

    const conv = this.selectedConversation();
    const user = this.currentUser();
    if (!conv || !user) return;

    const payload: SendMessageRequest = {
      senderId: user.id,
      recipientPhone: conv.recipientPhone,
      content,
      channel: 'WHATSAPP',
      priority: this.isUrgent() ? 'urgente' : 'normal'
    };

    this.chatService.sendMessage(payload).subscribe({
      next: () => {
        this.newMessage.set('');
        this.isUrgent.set(false);
        this.loadMessages(conv.id);
        this.loadConversations();
        this.authService.refreshBalance().subscribe();
        this.snackBar.open('Mensagem enviada!', 'Fechar', { duration: 2000 });
      },
      error: (err) => {
        const msg = err.status === 402 ? 'Saldo insuficiente!' : 'Erro ao enviar mensagem.';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      }
    });
  }

  openBulkDialog() {
    this.dialog.open(BulkMessageDialogComponent, {
      width: '500px'
    });
  }

  openFinanceDialog() {
    this.dialog.open(FinanceDialogComponent, {
      width: '700px'
    });
  }

  logout() {
    this.authService.logout();
  }

  onKeyDown(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      keyboardEvent.preventDefault(); // Impede quebra de linha ao enviar com Enter
      this.sendMessage();
    }
  }

  getInitials(name: string | undefined): string {
    if (!name) return 'C';
    return name.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}

