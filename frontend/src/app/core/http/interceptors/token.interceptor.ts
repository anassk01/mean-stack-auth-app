// src/app/auth/interceptors/token.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';
import { Router } from '@angular/router';

/**
 * Interceptor for adding cookies and CSRF tokens to requests
 */
export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Always include credentials to allow cookies to be sent
  let authReq = req.clone({ withCredentials: true });
  
  // For non-GET methods, add CSRF token from cookie
  if (req.method !== 'GET') {
    // Get CSRF token from cookie directly
    const csrfToken = getCsrfTokenFromCookie();
    
    if (csrfToken) {
      // Add CSRF token to headers
      authReq = req.clone({ 
        withCredentials: true,
        setHeaders: { 'X-CSRF-Token': csrfToken }
      });
    }
  }
  
  // Handle the request
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Don't handle auth errors for login/register endpoints
      if (error.status === 401 && 
          !req.url.includes('/login') && 
          !req.url.includes('/register') && 
          !req.url.includes('/verify-email') &&
          !req.url.includes('/forgot-password') &&
          !req.url.includes('/reset-password')) {
            
        // Clear auth data and redirect to login
        localStorage.removeItem('currentUser');
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};

/**
 * Get CSRF token from cookies
 */
function getCsrfTokenFromCookie(): string | null {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('csrf=')) {
      return cookie.substring('csrf='.length);
    }
  }
  return null;
}