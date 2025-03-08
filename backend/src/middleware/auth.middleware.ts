// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/token.utils';
import { AppError } from '../utils/error.utils';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT in cookies
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get the token from cookies
    const token = req.cookies.accessToken;
    
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // Verify the token
    const payload = verifyAccessToken(token);
    
    if (!payload) {
      throw new AppError('Invalid or expired token', 401);
    }

    // Attach the user to the request
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
};