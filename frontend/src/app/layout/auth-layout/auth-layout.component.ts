import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '@shared/ui/navbar/navbar.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <div class="layout-container">
      <app-navbar></app-navbar>
      
      <div class="auth-layout">
        <div class="auth-container">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .auth-layout {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--background);
      padding: var(--spacing-md);
    }
    
    .auth-container {
      width: 100%;
      
      @media (min-width: 576px) {
        max-width: 450px;
      }
    }
  `]
})
export class AuthLayoutComponent {
}