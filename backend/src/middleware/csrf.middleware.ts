// src/middleware/csrf.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils';

/**
 * Middleware to protect against CSRF attacks
 * Only applies to authenticated, state-changing routes
 */
export const validateCsrf = (req: Request, res: Response, next: NextFunction): void => {
  // Skip for GET, HEAD, OPTIONS requests as they should be safe
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip for public routes that don't need CSRF protection
  const publicPaths = [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email'
  ];
  
  if (publicPaths.some(path => req.path.includes(path))) {
    return next();
  }
  
  // Check for CSRF token
  const csrfHeader = req.headers['x-csrf-token'];
  const csrfCookie = req.cookies.csrf;
  
  // If either is missing, reject the request
  if (!csrfHeader || !csrfCookie) {
    return next(new AppError('CSRF token missing', 403));
  }
  
  // If they don't match, reject the request
  if (csrfHeader !== csrfCookie) {
    return next(new AppError('CSRF token invalid', 403));
  }
  
  // Tokens match, proceed
  next();
};