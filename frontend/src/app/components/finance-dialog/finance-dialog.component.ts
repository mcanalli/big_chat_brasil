import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { ChatService } from '../../core/services/chat.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-finance-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTableModule,
    MatTabsModule,
    MatButtonModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>Financeiro e Consumo</h2>
    <mat-dialog-content>
      <div class="summary-cards">
        <div class="card">
          <span class="label">Tipo de Plano</span>
          <span class="value">{{ (currentUser()?.planType === 'prepaid' ? 'Pré-pago' : 'Pós-pago') }}</span>
        </div>
        <div class="card">
          <span class="label">{{ currentUser()?.planType === 'prepaid' ? 'Saldo Atual' : 'Limite Disponível' }}</span>
          <span class="value" [class.low-balance]="isLowBalance()">
            {{ (currentUser()?.planType === 'prepaid' ? currentUser()?.balance : (currentUser()?.limit || 0) - (currentUser()?.consumed || 0)) | currency:'BRL' }}
          </span>
        </div>
      </div>

      <mat-tab-group>
        <mat-tab label="Últimas Mensagens (Custo)">
          <table mat-table [dataSource]="recentMessages" class="full-width">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef> Data </th>
              <td mat-cell *matCellDef="let msg"> {{ msg.timestamp | date:'short' }} </td>
            </ng-container>

            <ng-container matColumnDef="recipient">
              <th mat-header-cell *matHeaderCellDef> Destinatário </th>
              <td mat-cell *matCellDef="let msg"> {{ msg.recipientPhone }} </td>
            </ng-container>

            <ng-container matColumnDef="cost">
              <th mat-header-cell *matHeaderCellDef> Custo </th>
              <td mat-cell *matCellDef="let msg"> {{ msg.cost | currency:'BRL' }} </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let msg"> 
                <mat-chip-set>
                  <mat-chip [color]="getStatusColor(msg.status)" selected disabled>
                    {{ msg.status }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div *ngIf="recentMessages.length === 0" class="empty-state">
            Nenhuma mensagem encontrada.
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Fechar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width { width: 100%; }
    .summary-cards { display: flex; gap: 16px; margin-bottom: 20px; }
    .card { flex: 1; background: #f5f5f5; padding: 16px; border-radius: 8px; display: flex; flex-direction: column; }
    .label { font-size: 0.8rem; color: #666; }
    .value { font-size: 1.2rem; font-weight: bold; }
    .low-balance { color: #d32f2f; }
    .empty-state { padding: 20px; text-align: center; color: #999; }
    mat-dialog-content { min-width: 600px; min-height: 400px; }
    .mat-column-cost { font-weight: bold; }
  `]
})
export class FinanceDialogComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  
  currentUser = this.authService.currentUser;
  recentMessages: any[] = [];
  displayedColumns: string[] = ['timestamp', 'recipient', 'cost', 'status'];

  ngOnInit() {
    this.loadRecentMessages();
  }

  loadRecentMessages() {
    const user = this.currentUser();
    if (!user) return;

    // Usando o endpoint de relatório para pegar as últimas mensagens do cliente
    this.http.get<any>(`http://localhost:3000/api/messages/report?senderId=${user.id}&limit=5`).subscribe(res => {
      this.recentMessages = res.items;
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'read':
        return 'primary';
      case 'failed':
        return 'warn';
      default:
        return undefined;
    }
  }

  isLowBalance() {
    const user = this.currentUser();
    if (!user) return false;
    if (user.planType === 'prepaid') {
      return user.balance < 5.00;
    }
    return (user.limit - user.consumed) < 10.00;
  }
}
