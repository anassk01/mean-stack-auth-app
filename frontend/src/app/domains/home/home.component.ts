// src/app/domains/home/home.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '@shared/ui/navbar/navbar.component';
import { AuthService } from '@core/auth/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="home-container">
      <app-navbar></app-navbar>

      <main class="home-content">
        <section class="hero">
          <h1>Secure Authentication System</h1>
          <p class="subtitle">Built with MongoDB, Express, Angular, and Node.js</p>
          
          <!-- Different CTA buttons based on authentication state -->
          @if (!authService.isAuthenticated()) {
            <div class="cta-buttons">
              <a routerLink="/register" class="btn btn-primary btn-large">Get Started</a>
              <a routerLink="/login" class="btn btn-outline btn-large">Sign In</a>
            </div>
          } @else {
            <div class="cta-buttons">
              <a routerLink="/dashboard" class="btn btn-primary btn-large">Go to Dashboard</a>
            </div>
          }
        </section>

        <section class="features">
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Secure Authentication</h3>
            <p>Industry-standard security practices with JWT tokens and HTTP-only cookies.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Clean, modern interface that works on all devices.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Modern Angular</h3>
            <p>Built with Angular 19 using signals and standalone components.</p>
          </div>
        </section>
      </main>

      <footer class="home-footer">
        <p>&copy; {{ currentYear }} MEAN Authentication App</p>
      </footer>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .home-content {
      flex: 1;
    }
    
    .hero {
      text-align: center;
      padding: calc(var(--spacing-xl) * 2) var(--spacing-lg);
      background-color: var(--background);
      
      h1 {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-md);
        color: var(--text-dark);
      }
      
      .subtitle {
        font-size: 1.25rem;
        margin-bottom: var(--spacing-xl);
        color: var(--text-medium);
      }
      
      .cta-buttons {
        display: flex;
        justify-content: center;
        gap: var(--spacing-md);
        margin-top: var(--spacing-lg);
        
        @media (max-width: 576px) {
          flex-direction: column;
          align-items: center;
        }
      }
    }
    
    .btn-large {
      padding: var(--spacing-md) var(--spacing-xl);
      font-size: 1.1rem;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--spacing-lg);
      padding: var(--spacing-xl);
      background-color: var(--card-bg);
      
      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    
    .feature-card {
      padding: var(--spacing-lg);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-md);
      }
      
      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: var(--spacing-md);
      }
      
      h3 {
        margin-bottom: var(--spacing-sm);
        color: var(--text-dark);
      }
      
      p {
        color: var(--text-medium);
      }
    }
    
    .home-footer {
      padding: var(--spacing-lg);
      text-align: center;
      background-color: var(--card-bg);
      border-top: 1px solid var(--border);
      color: var(--text-medium);
    }
  `]
})
export class HomeComponent {
  protected authService = inject(AuthService);
  currentYear = new Date().getFullYear();
}