// src/routes/auth.routes.ts
import express from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { 
  validateRequest, 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema, 
  forgotPasswordSchema 
} from '../middleware/validation';
import { loginLimiter, resetLimiter } from '../middleware/rate-limiter';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validateRequest(registerSchema),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get tokens
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validateRequest(loginSchema),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires refresh token cookie)
 */
router.post(
  '/refresh',
  authController.refreshToken
);

/**
 * @route   GET /api/auth/csrf-token
 * @desc    Get a new CSRF token
 * @access  Private (requires auth cookie)
 */
router.get(
  '/csrf-token',
  authenticate,
  authController.getCsrfToken
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user & clear cookies
 * @access  Public
 */
router.post(
  '/logout',
  authController.logout
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  resetLimiter,
  validateRequest(forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getMe
);

export default router;