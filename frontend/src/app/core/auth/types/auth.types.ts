// src/app/auth/models/user.model.ts

/**
 * User model representing authenticated user data
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
}

/**
 * Authentication response from the server
 */
export interface AuthResponse {
  user: User;
  csrfToken?: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Password reset request payload
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password with token request payload
 */
export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/**
 * Generic API response with message
 */
export interface ApiResponse {
  message: string;
}