// src/app/domains/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { LoginRequest } from '@app/core/auth/types/auth.types';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Sign In</h2>
        
        @if (errorSignal()) {
          <div class="alert alert-error">
            {{ errorSignal() }}
          </div>
        }
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              autocomplete="email"
              placeholder="your@email.com"
              [class.invalid]="email?.invalid && email?.touched"
              [attr.disabled]="loadingSignal() ? true : null"
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
          
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-field">
              <input
                [type]="hidePasswordSignal() ? 'password' : 'text'"
                id="password"
                formControlName="password"
                autocomplete="current-password"
                placeholder="Your password"
                [class.invalid]="password?.invalid && password?.touched"
                [attr.disabled]="loadingSignal() ? true : null"
              />
              <button
                type="button"
                class="toggle-password"
                (click)="togglePassword()"
                [attr.disabled]="loadingSignal() ? true : null"
              >
                {{ hidePasswordSignal() ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            @if (password?.invalid && password?.touched) {
              <div class="error-message">
                @if (password?.errors?.['required']) {
                  <div>Password is required</div>
                }
              </div>
            }
          </div>
          
          <div class="form-actions">
            <a routerLink="/forgot-password" class="forgot-password">Forgot password?</a>
            <button 
              type="submit" 
              class="btn btn-primary" 
              [disabled]="loginForm.invalid || loadingSignal()"
            >
              @if (loadingSignal()) {
                <span class="loading-spinner"></span>
                Signing in...
              } @else {
                Sign in
              }
            </button>
          </div>
        </form>
        
        <div class="auth-links">
          <p>Don't have an account? <a routerLink="/register">Sign up</a></p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // Form group
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });
  
  // UI state signals
  loadingSignal = signal(false);
  errorSignal = signal<string | null>(null);
  hidePasswordSignal = signal(true);
  
  // Getters for form controls
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
  
  // Initialize component
  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    
    // Check for verification success message
    this.route.queryParams.subscribe(params => {
      if (params['verified'] === 'true') {
        this.errorSignal.set('Your email has been verified. You can now log in.');
      }
    });
  }
  
  // Toggle password visibility
  togglePassword(): void {
    this.hidePasswordSignal.update(value => !value);
  }
  
  // Submit login form
  onSubmit(): void {
    // Skip if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const loginData: LoginRequest = {
      email: this.email?.value as string,
      password: this.password?.value as string
    };
    
    this.authService.login(loginData).subscribe({
      next: () => {
        // Get return URL from query params or default to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.loadingSignal.set(false);
        
        if (error instanceof HttpErrorResponse) {
          // Handle specific error cases
          if (error.status === 403 && error.error?.message?.includes('verify your email')) {
            this.errorSignal.set('Please check your email to verify your account before logging in.');
          } else if (error.status === 403 && error.error?.message?.includes('locked')) {
            this.errorSignal.set('Your account is locked due to too many failed attempts. Please try again later.');
          } else if (error.status === 401) {
            this.errorSignal.set('Invalid email or password. Please try again.');
          } else if (error.status === 429) {
            this.errorSignal.set('Too many login attempts. Please try again later.');
          } else {
            this.errorSignal.set(error.error?.message || 'Login failed. Please try again.');
          }
        } else {
          this.errorSignal.set('Login failed. Please check your network connection and try again.');
        }
      }
    });
  }
}