import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';
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
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './finance-dialog.component.html',

  styles: [`
    .full-width { width: 100%; }
    .compact { font-size: 0.9rem; margin-top: 8px; }
    .summary-cards { display: flex; gap: 16px; margin-bottom: 20px; align-items: flex-start; }
    .financial-card { flex: 1; background: #f5f5f5; padding: 16px; border-radius: 8px; display: flex; flex-direction: column; min-height: 80px; transition: all 0.3s ease; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .card-title { font-size: 0.8rem; color: #666; }
    .card-value { font-size: 1.2rem; font-weight: bold; }
    .card-subtitle { font-size: 0.7rem; color: #666; margin-top: 4px; }
    .low-balance { color: #d32f2f; }
    .empty-state { padding: 20px; text-align: center; color: #999; }
    mat-dialog-content { min-width: 700px; min-height: 500px; }
    .mat-column-cost { font-weight: bold; }
    .action-form { margin-top: 12px; padding-top: 12px; border-top: 1px solid #ddd; }
    .form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .text-success { color: #2e7d32; }
    .text-danger { color: #d32f2f; }
    button[mat-icon-button] { width: 32px; height: 32px; line-height: 32px; }
    button[mat-icon-button] mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `]
})
export class FinanceDialogComponent implements OnInit {
  private authService = inject(AuthService);
  private financeService = inject(FinanceService);
  private http = inject(HttpClient);
  
  currentUser = this.authService.currentUser;

  limitValue: number = 0;
  consumedValue: number = 0;
  availableLimit: number = 0;
  balanceValue: number = 0;
  recentMessages: any[] = [];
  transactions: any[] = [];
  displayedColumns: string[] = ['timestamp', 'recipient', 'cost', 'status'];
  transactionColumns: string[] = ['timestamp', 'type', 'amount', 'description'];

  // UI state
  showConvertPlan = false;
  showAddCredits = false;
  showAdjustLimit = false;

  convertData = { newPlanType: 'postpaid' as 'prepaid' | 'postpaid', initialLimit: 0 };
  creditData = { amount: 0, description: '' };
  limitData = { newLimit: 0 };

  ngOnInit() {
    this.refreshData();
  }

  onTabChange(event: any) {
    if (event.index === 1) {
      this.loadTransactions();
    }
  }

  loadRecentMessages() {
    const user = this.currentUser();
    if (!user) return;
    this.http.get<any>(`http://localhost:3000/api/messages/report?senderId=${user.id}&limit=10`).subscribe(res => {
      this.recentMessages = res.items;
    });
  }

  loadTransactions() {
    const user = this.currentUser();
    if (!user) return;
    this.financeService.getTransactions(user.id).subscribe(res => {
      this.transactions = res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
  }

  refreshData() {
    this.authService.refreshBalance().subscribe((res: any) => {
      // Garantir conversão numérica para evitar problemas de exibição (String para Number)
      if (res) {
        this.limitValue = Number(res.limit || 0);
        this.consumedValue = Number(res.consumed || 0);
        this.balanceValue = Number(res.balance || 0);
        
        // Utilize o campo 'available' do backend se fornecido, ou calcule
        this.availableLimit = res.available !== undefined 
          ? Number(res.available) 
          : (this.limitValue - this.consumedValue);

        console.log('Dados do Balance processados:', { 
          limitValue: this.limitValue, 
          consumedValue: this.consumedValue, 
          availableLimit: this.availableLimit,
          balanceValue: this.balanceValue
        });
      }
      this.loadRecentMessages();
      this.loadTransactions();
    });
  }

  toggleConvertPlan() {
    this.showConvertPlan = !this.showConvertPlan;
    this.showAddCredits = false;
    this.showAdjustLimit = false;
    if (this.showConvertPlan) {
      this.convertData.newPlanType = this.currentUser()?.planType === 'prepaid' ? 'postpaid' : 'prepaid';
    }
  }

  toggleAddCredits() {
    this.showAddCredits = !this.showAddCredits;
    this.showConvertPlan = false;
    this.showAdjustLimit = false;
  }

  toggleAdjustLimit() {
    this.showAdjustLimit = !this.showAdjustLimit;
    this.showConvertPlan = false;
    this.showAddCredits = false;
    this.limitData.newLimit = this.limitValue;
  }

  confirmConvertPlan() {
    const user = this.currentUser();
    if (!user) return;
    this.financeService.convertPlan(user.id, this.convertData).subscribe(() => {
      this.showConvertPlan = false;
      this.refreshData();
    });
  }

  confirmAddCredits() {
    const user = this.currentUser();
    if (!user) return;
    this.financeService.addCredits(user.id, this.creditData).subscribe(() => {
      this.showAddCredits = false;
      this.creditData = { amount: 0, description: '' };
      this.refreshData();
    });
  }

  confirmAdjustLimit() {
    const user = this.currentUser();
    if (!user) return;
    this.financeService.adjustLimit(user.id, this.limitData).subscribe(() => {
      this.showAdjustLimit = false;
      this.refreshData();
    });
  }

  translateTransactionType(type: string) {
    const types: any = {
      'CREDIT_PURCHASE': 'Recarga',
      'MESSAGE_DEBIT': 'Consumo Mensagem',
      'PLAN_CONVERSION': 'Troca de Plano',
      'ADJUSTMENT': 'Ajuste',
      'INVOICE_PAYMENT': 'Pagamento de Fatura'
    };
    return types[type] || type;
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
      return this.balanceValue < 5.00;
    }
    return this.availableLimit < 10.00;
  }
}
