// src/app/domains/dashboard/overview/overview.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/services/auth.service';
import { User } from '@app/core/auth/types/auth.types';
import { Subscription } from 'rxjs';

@Component({
  selector: "app-overview",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <section class="welcome-card">
        <h1>Welcome, {{ user?.firstName || 'User' }}!</h1>
        <p>You've successfully logged in to your secure account.</p>
      </section>
      
      <section class="user-profile">
        <h2>Your Profile</h2>
        
        @if (user) {
          <div class="profile-details">
            <div class="profile-field">
              <span class="field-label">Name:</span>
              <span class="field-value">{{ user.firstName }} {{ user.lastName }}</span>
            </div>
            
            <div class="profile-field">
              <span class="field-label">Email:</span>
              <span class="field-value">{{ user.email }}</span>
            </div>
            
            <div class="profile-field">
              <span class="field-label">Account Status:</span>
              <span class="field-value verification-status">
                {{ user.isVerified ? 'Verified' : 'Unverified' }}
                @if (user.isVerified) {
                  <span class="verification-badge">✓</span>
                }
              </span>
            </div>
            
            <div class="profile-field">
              <span class="field-label">Last Login:</span>
              <span class="field-value">{{ user.lastLogin | date:'medium' }}</span>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .welcome-card {
      background-color: var(--card-bg);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      
      h1 {
        margin-bottom: var(--spacing-md);
        color: var(--text-dark);
      }
      
      p {
        color: var(--text-medium);
      }
    }
    
    .user-profile {
      background-color: var(--card-bg);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      box-shadow: var(--shadow-sm);
      
      h2 {
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-sm);
        border-bottom: 1px solid var(--border);
        color: var(--text-dark);
      }
    }
    
    .profile-details {
      display: grid;
      grid-gap: var(--spacing-md);
    }
    
    .profile-field {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      
      @media (min-width: 768px) {
        flex-wrap: nowrap;
      }
    }
    
    .field-label {
      font-weight: 600;
      min-width: 120px;
      color: var(--text-medium);
    }
    
    .field-value {
      color: var(--text-dark);
    }
    
    .verification-status {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
    }
    
    .verification-badge {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 18px;
      height: 18px;
      background-color: var(--success);
      color: white;
      border-radius: 50%;
      font-size: 12px;
    }
  `]
})
export class OverviewComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  
  // Store user data locally
  user: User | null = null;
  
  // Subscription to clean up
  private authSubscription?: Subscription;
  
  ngOnInit(): void {
    // Subscribe to current user from auth service
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.user = user;
      
      // Only try to get user data if we have a user and aren't in the middle of logout
      if (user) {
        // User is available from localStorage, no need for API call
      } else if (window.location.pathname !== '/login') {
        // Only make API call if we're not already redirecting to login
        this.authService.getCurrentUser().subscribe({
          next: (userData) => {
            this.user = userData;
          },
          error: () => {
            // Silently handle errors - no console logs
          }
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}