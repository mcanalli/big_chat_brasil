import { Component, inject, signal, computed, effect } from '@angular/core';
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
import { Message } from '../../core/models/message.model';
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

  conversations = signal<Conversation[]>([]);
  selectedConversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  
  searchText = signal('');
  newMessage = signal('');
  isUrgent = signal(false);

  filteredConversations = computed(() => {
    const term = this.searchText().toLowerCase();
    return this.conversations().filter(c => 
      c.contactName.toLowerCase().includes(term) || 
      c.contactDocument.includes(term)
    );
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
  }

  loadConversations() {
    this.chatService.getConversations().subscribe(convs => {
      this.conversations.set(convs);
    });
  }

  loadMessages(conversationId: string) {
    this.chatService.getMessages(conversationId).subscribe(msgs => {
      this.messages.set(msgs);
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
  }

  sendMessage() {
    const content = this.newMessage().trim();
    if (!content) return;

    const conv = this.selectedConversation();
    const payload = {
      content,
      priority: (this.isUrgent() ? 'URGENT' : 'NORMAL') as 'URGENT' | 'NORMAL',
      ...(conv ? { conversationId: conv.id } : {})
    };

    this.chatService.sendMessage(payload).subscribe({
      next: (res) => {
        this.messages.update(msgs => [...msgs, res.message]);
        this.newMessage.set('');
        this.isUrgent.set(false);
        this.loadConversations();
        this.snackBar.open('Mensagem enviada!', 'Fechar', { duration: 2000 });
      },
      error: (err) => {
        if (err.status === 402) {
          this.snackBar.open('Saldo insuficiente!', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open('Erro ao enviar mensagem.', 'Fechar', { duration: 3000 });
        }
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

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}

