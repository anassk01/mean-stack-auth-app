// src/app/domains/auth/forgot-password/forgot-password.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { ForgotPasswordRequest } from '@app/core/auth/types/auth.types';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Forgot Password</h2>
        
        @if (successSignal()) {
          <div class="alert alert-success">
            {{ successSignal() }}
            <p>Please check your email for instructions to reset your password.</p>
            <p><a routerLink="/login">Return to login</a></p>
          </div>
        }
        
        @if (errorSignal()) {
          <div class="alert alert-error">
            {{ errorSignal() }}
          </div>
        }
        
        @if (!successSignal()) {
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <div class="form-description">
              <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                autocomplete="email"
                placeholder="your@email.com"
                [class.invalid]="email?.invalid && email?.touched"
              />
              @if (email?.invalid && email?.touched) {
                <div class="error-message">
                  @if (email?.errors?.['required']) {
                    <div>Email is required</div>
                  }
                  @if (email?.errors?.['email']) {
                    <div>Please enter a valid email</div>
                  }
                </div>
              }
            </div>
            
            <button 
              type="submit" 
              class="btn-submit"
              [disabled]="forgotPasswordForm.invalid || loadingSignal()"
            >
              @if (loadingSignal()) {
                <span class="loading-spinner"></span>
                Sending Reset Link...
              } @else {
                Send Reset Link
              }
            </button>
          </form>
        }
        
        <div class="auth-links">
          <p>Remember your password? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-description {
      margin-bottom: var(--spacing-lg);
      color: var(--text-medium);
    }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  // Form group
  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });
  
  // UI state signals
  loadingSignal = signal(false);
  errorSignal = signal<string | null>(null);
  successSignal = signal<string | null>(null);
  
  // Getter for email control
  get email() { return this.forgotPasswordForm.get('email'); }
  
  // Submit forgot password form
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const forgotPasswordData: ForgotPasswordRequest = {
      email: this.email?.value as string
    };
    
    this.authService.forgotPassword(forgotPasswordData).subscribe({
      next: (response) => {
        this.loadingSignal.set(false);
        this.successSignal.set(response.message || 'Password reset email sent. Please check your inbox.');
      },
      error: (error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Failed to send reset email. Please try again.');
      }
    });
  }
}