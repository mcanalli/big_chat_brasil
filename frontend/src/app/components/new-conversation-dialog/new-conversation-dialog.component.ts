import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { PricingService } from '../../core/services/pricing.service';
import { SendMessageRequest } from '../../core/models/message.model';

@Component({
  selector: 'app-new-conversation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './new-conversation-dialog.component.html',
  styleUrls: ['./new-conversation-dialog.component.scss']
})
export class NewConversationDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private pricingService = inject(PricingService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<NewConversationDialogComponent>);

  private destroy$ = new Subject<void>();

  form: FormGroup;
  estimatedCost = 0;
  loading = signal(false);

  constructor() {
    this.form = this.fb.group({
      recipientPhone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      recipientName: [''],
      channel: ['WHATSAPP', Validators.required],
      priority: ['normal', Validators.required],
      content: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit() {
    const priorityControl = this.form.get('priority');

    // 1. Carga inicial
    if (priorityControl?.value) {
      this.updateEstimatedCost(priorityControl.value);
    }

    // 2. Escuta para alterações do usuário
    priorityControl?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(newPriority => {
      this.updateEstimatedCost(newPriority);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateEstimatedCost(priority: string) {
    this.pricingService.getPricingByPriority(priority).subscribe({
      next: (pricing) => {
        // Converte para number com segurança caso o backend retorne string
        this.estimatedCost = Number(pricing.cost || 0);
      },
      error: () => {
        this.estimatedCost = 0;
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const user = this.authService.currentUser();
    if (!user) return;

    this.loading.set(true);
    const payload: SendMessageRequest = {
      senderId: user.id,
      ...this.form.value
    };

    this.chatService.sendMessage(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.snackBar.open('Mensagem enviada e conversa iniciada!', 'Fechar', { duration: 3000 });
        this.dialogRef.close(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.status === 402 ? 'Saldo insuficiente!' : 'Erro ao iniciar conversa.';
        this.snackBar.open(msg, 'Fechar', { duration: 3000 });
      }
    });
  }
}
