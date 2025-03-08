// src/services/email.service.ts
import nodemailer from 'nodemailer';
import { environment } from '../config/environment.config';

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // Create nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: environment.emailHost,
      port: environment.emailPort,
      secure: environment.emailSecure,
      auth: {
        user: environment.emailUser,
        pass: environment.emailPassword,
      },
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send verification email
   */
  public async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${environment.clientUrl}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"${environment.emailFromName}" <${environment.emailFromAddress}>`,
      to,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Verify Email
          </a>
          <p>If you did not request this, please ignore this email.</p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
        </div>
      `,
    });
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${environment.clientUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"${environment.emailFromName}" <${environment.emailFromAddress}>`,
      to,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset. Please click the button below to create a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Reset Password
          </a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>This password reset link will expire in 15 minutes.</p>
          <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
          <p>${resetUrl}</p>
        </div>
      `,
    });
  }
}

export const emailService = EmailService.getInstance();