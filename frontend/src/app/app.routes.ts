// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { AUTH_ROUTES } from './domains/auth/auth.routes';
import { DASHBOARD_ROUTES } from './domains/dashboard/dashboard.routes';
import { HOME_ROUTES } from './domains/home/home.routes';

export const routes: Routes = [
  {
    path: '',
    children: HOME_ROUTES
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: AUTH_ROUTES
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: DASHBOARD_ROUTES
  },
  { 
    path: '**', 
    redirectTo: ''
  }
];