// src/services/auth.service.ts
import { User, IUserDocument } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/token.utils';
import crypto from 'crypto';
import { AppError } from '../utils/error.utils';
import { Types } from 'mongoose';
import { emailService } from './email.service';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UserOutput {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
}


interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserOutput;
}

class AuthService {
  private static instance: AuthService;
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  public async register(input: RegisterInput): Promise<IUserDocument> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create a new user
    const user = new User({
      ...input,
      verificationToken,
      verificationExpires
    });

    // Save the user
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    return user;
  }

  /**
   * Login a user
   */

  public async login(email: string, password: string): Promise<LoginResponse> {
    // Find the user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is locked
    if (user.isLocked()) {
      throw new AppError('Account is locked due to too many failed attempts. Try again later', 403);
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    
    // If password doesn't match, increment login attempts
    if (!isMatch) {
      await user.incrementLoginAttempts();
      throw new AppError('Invalid credentials', 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await User.findByIdAndUpdate(user._id, {
        $set: { loginAttempts: 0, lastLogin: new Date() },
        $unset: { lockUntil: 1 }
      });
    } else {
      await User.findByIdAndUpdate(user._id, {
        $set: { lastLogin: new Date() }
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new AppError('Please verify your email to login', 403);
    }

    // Generate a unique token ID for the refresh token
    const tokenId = crypto.randomBytes(16).toString('hex');

    // Update the user's record with this token ID
    await User.findByIdAndUpdate(user._id, {
      refreshTokenId: tokenId,
      $set: { lastLogin: new Date() },
      $unset: { lockUntil: 1 }
    });

    // Generate tokens
    const payload: TokenPayload = { 
      userId: user._id.toString(), 
      email: user.email,
      tokenId 
    };
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin?.toISOString(),
        createdAt: user.createdAt?.toISOString()
      }
    };
  }

  /**
   * Verify email
   */
  public async verifyEmail(token: string): Promise<boolean> {
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return true;
  }

  /**
   * Request password reset
   */
  public async requestPasswordReset(email: string): Promise<boolean> {
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security reasons, we still return true even if the user doesn't exist
      return true;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return true;
  }

  /**
   * Reset password
   */
  public async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update user's password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return true;
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<IUserDocument | null> {
    try {
      const objectId = new Types.ObjectId(userId);
      return await User.findById(objectId).select('-password');
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a new refresh token and update the user's refreshTokenId
   */
  public async rotateRefreshToken(userId: string, email: string): Promise<string> {
    // Generate a new token ID
    const tokenId = crypto.randomBytes(16).toString('hex');
    
    // Update the user's refreshTokenId in the database
    await User.findByIdAndUpdate(userId, { refreshTokenId: tokenId }).exec();
    
    // Generate and return a new refresh token with this ID
    return generateRefreshToken({ userId, email, tokenId });
  }
}

export const authService = AuthService.getInstance();