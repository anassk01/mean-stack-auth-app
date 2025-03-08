// src/app/domains/auth/reset-password/reset-password.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { ResetPasswordRequest } from '@app/core/auth/types/auth.types';

// Password regex for strong passwords (same as register component)
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Reset Password</h2>
        
        @if (successSignal()) {
          <div class="alert alert-success">
            {{ successSignal() }}
            <p><a routerLink="/login">Sign in</a> with your new password.</p>
          </div>
        }
        
        @if (errorSignal()) {
          <div class="alert alert-error">
            {{ errorSignal() }}
          </div>
        }
        
        @if (!successSignal() && tokenSignal()) {
          <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="password">New Password</label>
              <div class="password-field">
                <input
                  [type]="hidePasswordSignal() ? 'password' : 'text'"
                  id="password"
                  formControlName="password"
                  autocomplete="new-password"
                  placeholder="Create a strong password"
                  [class.invalid]="password?.invalid && password?.touched"
                />
                <button 
                  type="button" 
                  class="toggle-password" 
                  (click)="togglePassword()"
                >
                  {{ hidePasswordSignal() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              
              @if (password?.invalid && password?.touched) {
                <div class="error-message">
                  @if (password?.errors?.['required']) {
                    <div>Password is required</div>
                  }
                  @if (password?.errors?.['pattern']) {
                    <div>Password must meet all requirements below</div>
                  }
                </div>
              }
              
              <div class="password-requirements">
                <div [class.met]="hasMinLength()">✓ At least 12 characters</div>
                <div [class.met]="hasUpperCase()">✓ At least one uppercase letter</div>
                <div [class.met]="hasLowerCase()">✓ At least one lowercase letter</div>
                <div [class.met]="hasNumber()">✓ At least one number</div>
                <div [class.met]="hasSpecialChar()">✓ At least one special character</div>
              </div>
            </div>
            
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <div class="password-field">
                <input
                  [type]="hideConfirmPasswordSignal() ? 'password' : 'text'"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  autocomplete="new-password"
                  placeholder="Confirm your new password"
                  [class.invalid]="confirmPassword?.invalid && confirmPassword?.touched"
                />
                <button 
                  type="button" 
                  class="toggle-password" 
                  (click)="toggleConfirmPassword()"
                >
                  {{ hideConfirmPasswordSignal() ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              @if (confirmPassword?.invalid && confirmPassword?.touched) {
                <div class="error-message">
                  @if (confirmPassword?.errors?.['required']) {
                    <div>Please confirm your password</div>
                  }
                  @if (confirmPassword?.errors?.['passwordMismatch']) {
                    <div>Passwords do not match</div>
                  }
                </div>
              }
            </div>
            
            <button 
              type="submit" 
              class="btn-submit"
              [disabled]="resetPasswordForm.invalid || loadingSignal()"
            >
              @if (loadingSignal()) {
                <span class="loading-spinner"></span>
                Resetting Password...
              } @else {
                Reset Password
              }
            </button>
          </form>
        }
        
        @if (!tokenSignal()) {
          <div class="alert alert-error">
            <p>Invalid or expired password reset link. Please request a new password reset.</p>
            <a routerLink="/auth/forgot-password" class="btn btn-outline">Request Password Reset</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: []
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Form group
  resetPasswordForm = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(12),
      Validators.pattern(PASSWORD_PATTERN)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });
  
  // UI state signals
  loadingSignal = signal(false);
  errorSignal = signal<string | null>(null);
  successSignal = signal<string | null>(null);
  hidePasswordSignal = signal(true);
  hideConfirmPasswordSignal = signal(true);
  tokenSignal = signal<string | null>(null);
  
  // Getters for form controls
  get password() { return this.resetPasswordForm.get('password'); }
  get confirmPassword() { return this.resetPasswordForm.get('confirmPassword'); }
  
  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // Get token from query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.tokenSignal.set(token);
      }
    });
  }
  
  // Password match validator
  passwordMatchValidator(control: any): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  // Toggle password visibility
  togglePassword(): void {
    this.hidePasswordSignal.update(value => !value);
  }
  
  // Toggle confirm password visibility
  toggleConfirmPassword(): void {
    this.hideConfirmPasswordSignal.update(value => !value);
  }
  
  // Submit reset password form
  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.tokenSignal()) {
      return;
    }
    
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const resetPasswordData: ResetPasswordRequest = {
      token: this.tokenSignal()!,
      password: this.password?.value as string
    };
    
    this.authService.resetPassword(resetPasswordData).subscribe({
      next: (response) => {
        this.loadingSignal.set(false);
        this.successSignal.set(response.message || 'Your password has been reset successfully.');
      },
      error: (error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Failed to reset password. The link may have expired.');
      }
    });
  }

  hasMinLength(): boolean {
    return (this.password?.value?.length ?? 0) >= 12;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.password?.value || '');
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.password?.value || '');
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.password?.value || '');
  }

  hasSpecialChar(): boolean {
    return /[@$!%*?&]/.test(this.password?.value || '');
  }
}