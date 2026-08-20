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
import { NewConversationDialogComponent } from '../../components/new-conversation-dialog/new-conversation-dialog.component';

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
  
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

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

  getLastMessageText(conv: any): string {
    if (!conv) return 'Nenhuma mensagem';
    
    // Tenta extrair a mensagem de várias estruturas comuns
    if (typeof conv.lastMessage === 'string') return conv.lastMessage;
    if (conv.lastMessage?.content) return conv.lastMessage.content;
    if (conv.lastMessageContent) return conv.lastMessageContent;
    
    if (conv.messages && conv.messages.length > 0) {
      const last = conv.messages[conv.messages.length - 1];
      return last.content || last.text || '';
    }
    return conv.content || 'Nenhuma mensagem registrada';
  }

  getLastMessageDate(conv: any): string | Date {
    return conv.lastMessageAt || conv.lastMessageTime || conv.lastMessage?.createdAt || conv.updatedAt || conv.createdAt;
  }

  formatConversationTime(dateVal: any): string {
    if (!dateVal) return '';
    const date = new Date(dateVal);
    if (isNaN(date.getTime())) return '';

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
      return timeStr;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Ontem ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${dateStr} ${timeStr}`;
    }
  }

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

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
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
      
      // Ordenação Cronológica Crescente (padrão WhatsApp)
      const sortedMessages = list.sort((a: Message, b: Message) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      this.messages.set(sortedMessages);
      this.scrollToBottom();
    });
  }

  shouldShowDateDivider(index: number): boolean {
    const msgs = this.messages();
    if (index === 0) return true;
    
    const currentDate = new Date(msgs[index].timestamp).toDateString();
    const previousDate = new Date(msgs[index - 1].timestamp).toDateString();
    
    return currentDate !== previousDate;
  }

  formatDateDivider(dateSource: string | Date): string {
    const date = new Date(dateSource);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

    return date.toLocaleDateString('pt-BR');
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
    const dialogRef = this.dialog.open(NewConversationDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((newMessage: Message | undefined) => {
      if (newMessage) {
        // Recarregar conversas e saldo
        this.authService.refreshBalance().subscribe();
        
        const client = this.currentUser();
        if (!client) return;

        this.chatService.getConversations(client.id).subscribe((res: any) => {
          const list = Array.isArray(res) ? res : (res.data || (res ? [res] : []));
          this.conversations.set(list);

          // Tentar encontrar a conversa que contém a nova mensagem
          const newConv = list.find((c: Conversation) => c.id === newMessage.conversationId);
          if (newConv) {
            this.selectConversation(newConv);
          }
        });
      }
    });
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

