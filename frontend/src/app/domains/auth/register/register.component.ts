// src/app/domains/auth/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  FormBuilder, 
  ReactiveFormsModule, 
  Validators, 
  FormGroup, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';
import { RegisterRequest } from '@app/core/auth/types/auth.types';

// Password regex for strong passwords
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Create Account</h2>
        
        @if (successSignal()) {
          <div class="alert alert-success">
            {{ successSignal() }}
            <p>Please check your email to verify your account. Then you can <a routerLink="/login">sign in</a>.</p>
          </div>
        }
        
        @if (errorSignal()) {
          <div class="alert alert-error">
            {{ errorSignal() }}
          </div>
        }
        
        @if (!successSignal()) {
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  autocomplete="given-name"
                  placeholder="First name"
                  [class.invalid]="firstName?.invalid && firstName?.touched"
                />
                @if (firstName?.invalid && firstName?.touched) {
                  <div class="error-message">
                    @if (firstName?.errors?.['required']) {
                      <div>First name is required</div>
                    }
                  </div>
                }
              </div>
              
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  autocomplete="family-name"
                  placeholder="Last name"
                  [class.invalid]="lastName?.invalid && lastName?.touched"
                />
                @if (lastName?.invalid && lastName?.touched) {
                  <div class="error-message">
                    @if (lastName?.errors?.['required']) {
                      <div>Last name is required</div>
                    }
                  </div>
                }
              </div>
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
            
            <div class="form-group">
              <label for="password">Password</label>
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
              <label for="confirmPassword">Confirm Password</label>
              <div class="password-field">
                <input
                  [type]="hideConfirmPasswordSignal() ? 'password' : 'text'"
                  id="confirmPassword"
                  formControlName="confirmPassword"
                  autocomplete="new-password"
                  placeholder="Confirm your password"
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
              [disabled]="registerForm.invalid || loadingSignal()"
            >
              @if (loadingSignal()) {
                <span class="loading-spinner"></span>
                Creating Account...
              } @else {
                Create Account
              }
            </button>
          </form>
        }
        
        <div class="auth-links">
          <p>Already have an account? <a routerLink="/login">Sign in</a></p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  // Form group with password matching validator
  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
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
  
  // Getters for form controls
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  
  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }
  
  // Password match validator
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
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
  
  // Submit registration form
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    const registerData: RegisterRequest = {
      firstName: this.firstName?.value as string,
      lastName: this.lastName?.value as string,
      email: this.email?.value as string,
      password: this.password?.value as string
    };
    
    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loadingSignal.set(false);
        this.successSignal.set(response.message || 'Registration successful! Please check your email to verify your account.');
      },
      error: (error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error.message || 'Registration failed. Please try again.');
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