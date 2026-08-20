import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bulk-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Envio em Massa</h2>
    <mat-dialog-content>
      <form #bulkForm="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Destinatários (Telefones com DDD, ex: 5511999999999)</mat-label>
          <textarea matInput 
                    name="phones" 
                    [(ngModel)]="phoneList" 
                    required 
                    rows="4" 
                    placeholder="5511999999999, 5511988888888..."></textarea>
          <mat-hint>Separe por vírgula ou nova linha.</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Mensagem</mat-label>
          <textarea matInput 
                    name="content" 
                    [(ngModel)]="messageContent" 
                    required 
                    rows="4"></textarea>
        </mat-form-field>

        <div class="row">
          <mat-form-field appearance="outline" style="flex: 1; margin-right: 8px;">
            <mat-label>Canal</mat-label>
            <mat-select [(ngModel)]="channel" name="channel">
              <mat-option value="WHATSAPP">WhatsApp</mat-option>
              <mat-option value="SMS">SMS</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="flex: 1;">
            <mat-label>Prioridade</mat-label>
            <mat-select [(ngModel)]="priority" name="priority">
              <mat-option value="normal">Normal</mat-option>
              <mat-option value="urgente">Urgente</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div *ngIf="estimatedCost > 0" class="cost-estimate">
          Custo total estimado: {{ estimatedCost | currency:'BRL' }}
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button 
              color="primary" 
              (click)="onSend()" 
              [disabled]="!bulkForm.form.valid || loading">
        {{ loading ? 'Enviando...' : 'Disparar Agora' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; margin-bottom: 1rem; }
    .row { display: flex; }
    .cost-estimate { margin-top: 10px; font-weight: bold; color: #2e7d32; border: 1px dashed #2e7d32; padding: 10px; border-radius: 4px; }
    mat-dialog-content { min-width: 450px; padding-top: 10px !important; }
  `]
})
export class BulkMessageDialogComponent {
  private dialogRef = inject(MatDialogRef<BulkMessageDialogComponent>);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  phoneList = '';
  messageContent = '';
  priority: 'normal' | 'urgente' = 'normal';
  channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP';
  loading = false;

  get estimatedCost(): number {
    const count = this.phoneList.split(/[\n,]+/).filter(p => p.trim()).length;
    // Preços fictícios para estimativa baseados na prioridade/canal
    let basePrice = this.channel === 'WHATSAPP' ? 0.25 : 0.15;
    if (this.priority === 'urgente') basePrice += 0.05;
    return count * basePrice;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSend() {
    const phones = this.phoneList
      .split(/[\n,]+/)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    if (phones.length === 0) {
      this.snackBar.open('Por favor, insira ao menos um telefone válido.', 'Fechar', { duration: 3000 });
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.loading = true;
    this.chatService.sendBulkMessages({
      senderId: currentUser.id,
      recipientPhones: phones,
      content: this.messageContent,
      channel: this.channel,
      priority: this.priority
    }).subscribe({
      next: (res) => {
        this.snackBar.open(`Sucesso! ${res.totalRecipients} mensagens processadas. Custo: R$ ${res.totalCost.toFixed(2)}`, 'Fechar', { duration: 5000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.status === 402 ? 'Saldo insuficiente!' : 'Erro ao enviar disparos.';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      }
    });
  }
}
