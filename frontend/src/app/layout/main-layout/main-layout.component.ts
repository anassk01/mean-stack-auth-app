import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/ui/navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <div class="main-layout">
      <app-navbar></app-navbar>
      
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="footer">
        <p>&copy; {{ currentYear }} MEAN Authentication App</p>
      </footer>
    </div>
  `,
  styles: [`
    .main-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .content {
      flex: 1;
      padding: var(--spacing-lg);
      
      @media (min-width: 768px) {
        padding: var(--spacing-xl);
      }
    }
    
    .footer {
      padding: var(--spacing-lg);
      text-align: center;
      background-color: var(--card-bg);
      border-top: 1px solid var(--border);
      color: var(--text-medium);
      font-size: 0.875rem;
    }
  `]
})
export class MainLayoutComponent {
  currentYear = new Date().getFullYear();
}