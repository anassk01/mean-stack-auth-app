// src/app/domains/auth/verify-email/verify-email.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Email Verification</h2>
        
        @if (loadingSignal()) {
          <div class="verification-status loading">
            <div class="spinner"></div>
            <p>Verifying your email address...</p>
          </div>
        }
        
        @if (errorSignal()) {
          <div class="verification-status error">
            <div class="icon-error">❌</div>
            <h3>Verification Failed</h3>
            <p>{{ errorSignal() }}</p>
            <div class="actions">
              <a routerLink="/login" class="btn btn-outline">Go to Login</a>
            </div>
          </div>
        }
        
        @if (successSignal()) {
          <div class="verification-status success">
            <div class="icon-success">✓</div>
            <h3>Email Verified</h3>
            <p>{{ successSignal() }}</p>
            <div class="actions">
              <a routerLink="/login" class="btn btn-primary">Sign In</a>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .verification-status {
      text-align: center;
      padding: var(--spacing-lg) 0;
    }
    
    .spinner {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 3px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: var(--primary);
      animation: spin 1s ease-in-out infinite;
      margin-bottom: var(--spacing-lg);
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .icon-success {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: var(--success);
      color: white;
      font-size: 32px;
      margin-bottom: var(--spacing-lg);
    }
    
    .icon-error {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: var(--error);
      color: white;
      font-size: 32px;
      margin-bottom: var(--spacing-lg);
    }
    
    .verification-status h3 {
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
    }
    
    .verification-status p {
      margin-bottom: var(--spacing-lg);
      color: var(--text-medium);
    }
    
    .actions {
      margin-top: var(--spacing-lg);
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  // UI state signals
  loadingSignal = signal(true);
  errorSignal = signal<string | null>(null);
  successSignal = signal<string | null>(null);
  
  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    
    // Get verification token from query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        this.verifyEmail(token);
      } else {
        this.loadingSignal.set(false);
        this.errorSignal.set('Verification token is missing. Please check your email link.');
      }
    });
  }
  
  // Verify email with token
  private verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.loadingSignal.set(false);
        this.successSignal.set(response.message || 'Your email has been verified successfully.');
      },
      error: (error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Failed to verify email. The link may have expired.');
      }
    });
  }
}