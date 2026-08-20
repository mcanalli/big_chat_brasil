import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Big Chat Brasil</h1>
        <p>Identifique-se para começar</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Tipo de Documento</label>
            <div class="radio-group">
              <label>
                <input type="radio" formControlName="type" value="CPF"> PF (CPF)
              </label>
              <label>
                <input type="radio" formControlName="type" value="CNPJ"> PJ (CNPJ)
              </label>
            </div>
          </div>

          <div class="form-group">
            <label for="document">{{ loginForm.get('type')?.value }}</label>
            <input 
              id="document" 
              type="text" 
              formControlName="document" 
              [placeholder]="loginForm.get('type')?.value === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'"
              (input)="applyMask($event)"
            >
            <div *ngIf="loginForm.get('document')?.touched && loginForm.get('document')?.invalid" class="error">
              Documento inválido.
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLoading()">
            {{ isLoading() ? 'Carregando...' : 'Entrar' }}
          </button>

          <div *ngIf="errorMessage()" class="error-alert">
            {{ errorMessage() }}
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h1 { color: #2c3e50; margin-bottom: 0.5rem; text-align: center; }
    p { color: #7f8c8d; text-align: center; margin-bottom: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: bold; }
    .radio-group { display: flex; gap: 1rem; margin-top: 0.5rem; }
    input[type="text"] {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background-color: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:disabled { background-color: #bdc3c7; }
    .error { color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem; }
    .error-alert {
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #fdeaea;
      color: #e74c3c;
      border-radius: 4px;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    type: ['CPF' as 'CPF' | 'CNPJ', Validators.required],
    document: ['', [Validators.required, Validators.minLength(11)]]
  });

  applyMask(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    const type = this.loginForm.get('type')?.value;

    if (type === 'CPF') {
      value = value.substring(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      value = value.substring(0, 14);
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    this.loginForm.get('document')?.setValue(value, { emitEvent: false });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { document, type } = this.loginForm.value;
    const cleanDocument = document!.replace(/\D/g, '');

    this.authService.login(cleanDocument, type as 'CPF' | 'CNPJ').subscribe({
      next: () => {
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Erro ao realizar login. Verifique seus dados.');
      }
    });
  }
}
