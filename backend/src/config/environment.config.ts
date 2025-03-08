// src/config/environment.config.ts
import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Define environment interface with proper types
interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwtSecret: Secret;
  jwtExpiresIn: string;
  refreshTokenSecret: Secret;
  refreshTokenExpiresIn: string;
  cookieSecret: string;
  clientUrl: string;
  // Email configuration
  emailHost: string;
  emailPort: number;
  emailSecure: boolean;
  emailUser: string;
  emailPassword: string;
  emailFromName: string;
  emailFromAddress: string;
}

// Create and export the environment configuration
export const environment: EnvironmentConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/auth-app',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',
  
  // Email configuration
  emailHost: process.env.EMAIL_HOST || 'smtp.example.com',
  emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
  emailSecure: process.env.EMAIL_SECURE === 'true',
  emailUser: process.env.EMAIL_USER || 'user@example.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'password',
  emailFromName: process.env.EMAIL_FROM_NAME || 'MEAN Auth App',
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@example.com'
};