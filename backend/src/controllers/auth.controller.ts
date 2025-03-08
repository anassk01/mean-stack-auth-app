// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { verifyRefreshToken, generateAccessToken } from '../utils/token.utils';
import { environment } from '../config/environment.config';
import { handleError, AppError } from '../utils/error.utils';
import crypto from 'crypto';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    await authService.register({
      email,
      password,
      firstName,
      lastName
    });

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.' 
    });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Registration failed'), res);
  }
};

/**
 * Login a user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const { accessToken, refreshToken, user } = await authService.login(email, password);

    // Set access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: environment.nodeEnv === 'production', // In production, only send over HTTPS
      sameSite: 'lax', // Changed to lax to work with redirects
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: environment.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth'
    });

    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf', csrfToken, {
      httpOnly: false, // Must be accessible to JavaScript
      secure: environment.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    res.status(200).json({
      user,
      csrfToken
    });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Login failed'), res);
  }
};

/**
 * Refresh the access token using a refresh token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    // Verify the refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    if (!payload) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Get user data
    const user = await authService.getUserById(payload.userId);
    
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Validate that the token ID matches what's stored in the user record
    if (user.refreshTokenId !== payload.tokenId) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate a new refresh token with rotation
    const newRefreshToken = await authService.rotateRefreshToken(payload.userId, payload.email);

    // Generate a new access token
    const accessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email
    });

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: environment.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/api/auth'
    });

    // Set new access token as HTTP-only cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: environment.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    // Generate new CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf', csrfToken, {
      httpOnly: false,
      secure: environment.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      csrfToken
    });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Token refresh failed'), res);
  }
};

/**
 * Get a new CSRF token
 */
export const getCsrfToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Generate CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    res.cookie('csrf', csrfToken, {
      httpOnly: false, // Must be accessible to JavaScript
      secure: environment.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/'
    });

    res.status(200).json({ csrfToken });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Failed to generate CSRF token'), res);
  }
};

/**
 * Logout a user by clearing auth cookies
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Clear all auth cookies
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.clearCookie('csrf', { path: '/' });
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Logout failed'), res);
  }
};

/**
 * Verify a user's email
 */
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    
    await authService.verifyEmail(token);
    
    res.status(200).json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Email verification failed'), res);
  }
};

/**
 * Request a password reset
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    await authService.requestPasswordReset(email);
    
    // For security, always return the same response whether the email exists or not
    res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent.' 
    });
  } catch (error) {
    // For security, we don't want to reveal if the email exists or not
    res.status(200).json({ 
      message: 'If a user with that email exists, a password reset link has been sent.' 
    });
  }
};

/**
 * Reset a password using a token
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    
    await authService.resetPassword(token, password);
    
    res.status(200).json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Password reset failed'), res);
  }
};

/**
 * Get current user profile
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      throw new AppError('Authentication required', 401);
    }

    const user = await authService.getUserById(req.user.userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        createdAt: user.createdAt?.toISOString(),
        lastLogin: user.lastLogin?.toISOString()
      }
    });
  } catch (error) {
    handleError(error instanceof Error ? error : new Error('Failed to get user information'), res);
  }
};
