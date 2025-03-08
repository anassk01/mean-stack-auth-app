// src/app/auth/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of, catchError, tap, BehaviorSubject, map } from 'rxjs';
import { environment } from '@env/environment';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  ApiResponse 
} from '@app/core/auth/types/auth.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  // Observable for components to subscribe to
  public currentUser = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from localStorage on service initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }
  
  // Get current user value without subscribing
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
  
  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
  
  // Register new user
  register(data: RegisterRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/register`, data);
  }
  
  // Login user
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data, { withCredentials: true })
      .pipe(
        tap(response => {
          
          // Store user data in localStorage
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }
  
  // Logout user
  logout(): Observable<ApiResponse> {
    // Get CSRF token from cookie
    const csrfToken = this.getCsrfTokenFromCookie();
    
    // Set up headers with CSRF token
    const options = {
      withCredentials: true,
      headers: {
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {})
      }
    };
    
    return this.http.post<ApiResponse>(`${this.apiUrl}/logout`, {}, options)
      .pipe(
        tap(() => {
          // Remove user from localStorage
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
        }),
        catchError(error => {
          // Even if the server request fails, we should clear local auth data
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
          this.router.navigate(['/login']);
          return throwError(() => error);
        })
      );
  }
  
  // Get current user profile
  getCurrentUser(): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(
        map(response => response.user), 
        tap(user => {          
          // Update stored user data
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('getCurrentUser error:', error);
          
          if (error.status === 401) {
            // If unauthorized, clear user data
            localStorage.removeItem('currentUser');
            this.currentUserSubject.next(null);
          }
          return throwError(() => error);
        })
      );
  }

  // Request password reset
  forgotPassword(data: ForgotPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/forgot-password`, data);
  }
  
  // Reset password with token
  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/reset-password`, data);
  }
  
  // Verify email address
  verifyEmail(token: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/verify-email/${token}`);
  }
  
  // Extract CSRF token from cookies
  private getCsrfTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('csrf=')) {
        return cookie.substring('csrf='.length);
      }
    }
    return null;
  }
}