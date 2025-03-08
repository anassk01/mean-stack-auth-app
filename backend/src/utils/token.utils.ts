// src/utils/token.utils.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { environment } from '../config/environment.config';

// Token payload interface
export interface TokenPayload {
  userId: string;
  email: string;
  tokenId?: string;
}

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  // Use a single type assertion to comply with jwt's expected types
  return jwt.sign(
    payload, 
    environment.jwtSecret, 
    { expiresIn: environment.jwtExpiresIn as any }
  );
};

/**
 * Generate a longer-lived refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  // Generate a random token ID if not provided
  const tokenId = payload.tokenId || crypto.randomBytes(16).toString('hex');
  
  // Use a single type assertion to comply with jwt's expected types
  return jwt.sign(
    { ...payload, tokenId }, 
    environment.refreshTokenSecret, 
    { expiresIn: environment.refreshTokenExpiresIn as any }
  );
};

/**
 * Verify access token and return payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, environment.jwtSecret) as (jwt.JwtPayload & TokenPayload);
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token and return payload or null if invalid
 */
export const verifyRefreshToken = (token: string): (TokenPayload & { tokenId: string }) | null => {
  try {
    const decoded = jwt.verify(token, environment.refreshTokenSecret) as (jwt.JwtPayload & TokenPayload & { tokenId: string });
    return {
      userId: decoded.userId,
      email: decoded.email,
      tokenId: decoded.tokenId
    };
  } catch (error) {
    return null;
  }
};