// src/app/shared/ui/navbar/navbar.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="logo">MEAN Auth</a>
      </div>
      
      <div class="navbar-menu">
        @if (authService.isAuthenticated()) {
          <!-- Logged in menu -->
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
          <button class="btn btn-outline" (click)="logout()">Logout</button>
        } @else {
          <!-- Logged out menu -->
          <a routerLink="/login" routerLinkActive="active" class="nav-link">Login</a>
          <a routerLink="/register" routerLinkActive="active" class="btn btn-primary">Register</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      background-color: var(--card-bg);
      box-shadow: var(--shadow-sm);
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
    }
    
    .navbar-menu {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
    
    .nav-link {
      color: var(--text-medium);
      text-decoration: none;
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-sm);
      transition: all 0.2s;
      
      &:hover {
        color: var(--primary);
        background-color: rgba(74, 144, 226, 0.05);
      }
      
      &.active {
        color: var(--primary);
        font-weight: 500;
      }
    }
  `]
})
export class NavbarComponent {
  protected authService = inject(AuthService);
  
  logout(): void {
    this.authService.logout().subscribe();
  }
}