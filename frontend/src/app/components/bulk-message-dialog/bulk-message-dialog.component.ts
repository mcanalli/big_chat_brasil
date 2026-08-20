import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { PricingService } from '../../core/services/pricing.service';

@Component({
  selector: 'app-bulk-message-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './bulk-message-dialog.component.html',
  styleUrls: ['./bulk-message-dialog.component.scss']
})
export class BulkMessageDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<BulkMessageDialogComponent>);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private pricingService = inject(PricingService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  form: FormGroup;
  loading = false;
  recipientCount = 0;
  totalEstimatedCost = 0;

  constructor() {
    this.form = this.fb.group({
      recipientPhones: ['', Validators.required],
      recipientNames: [''],
      content: ['', Validators.required],
      channel: ['WHATSAPP', Validators.required],
      priority: ['normal', Validators.required]
    });
  }

  ngOnInit() {
    this.updateTotalCost();

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTotalCost();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateTotalCost() {
    const priority = this.form.get('priority')?.value || 'normal';
    const recipientPhones = this.form.get('recipientPhones')?.value || '';

    // Processa contagem de telefones válidos
    const phones = recipientPhones
      .split(/[\n,]/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);
    
    this.recipientCount = phones.length;

    if (this.recipientCount === 0) {
      this.totalEstimatedCost = 0;
      return;
    }

    // Busca o preço unitário baseado na prioridade selecionada
    this.pricingService.getPricingByPriority(priority).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        const unitCost = Number(res?.cost || 0);
        this.totalEstimatedCost = this.recipientCount * unitCost;
      },
      error: () => {
        this.totalEstimatedCost = 0;
      }
    });
  }

  private parseList(input: string, preserveEmpty = false): string[] {
    if (!input || input.trim() === '') return [];
    
    const items = input.split(/[,\n]/).map(item => item.trim());
    
    if (preserveEmpty) {
      return items;
    }
    
    return items.filter(item => item.length > 0);
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSend() {
    if (this.form.invalid) return;

    const { recipientPhones, recipientNames, content, channel, priority } = this.form.value;
    const phones = this.parseList(recipientPhones);
    let names = this.parseList(recipientNames, true);

    // Remove trailing empty name if it exceeds phone count
    if (names.length === phones.length + 1 && names[names.length - 1] === '') {
      names.pop();
    }

    if (phones.length === 0) {
      this.snackBar.open('Por favor, insira ao menos um telefone válido.', 'Fechar', { duration: 3000 });
      return;
    }

    if (names.length > 0 && names.length !== phones.length) {
      this.snackBar.open(`A quantidade de nomes (${names.length}) deve ser igual à de telefones (${phones.length}).`, 'Fechar', { duration: 5000 });
      return;
    }

    const currentUser = this.authService.currentUser();
    if (!currentUser) return;

    this.loading = true;
    this.chatService.sendBulkMessages({
      senderId: currentUser.id,
      recipientPhones: phones,
      recipientNames: names.length > 0 ? names : undefined,
      content: content,
      channel: channel,
      priority: priority
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

