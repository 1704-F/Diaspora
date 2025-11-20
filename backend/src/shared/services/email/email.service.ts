import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface EmailVerificationContext {
  firstName: string;
  verificationUrl: string;
  expiresIn: string;
}

export interface PasswordResetContext {
  firstName: string;
  resetUrl: string;
  expiresIn: string;
}

export interface WelcomeEmailContext {
  firstName: string;
  associationName?: string;
  loginUrl: string;
}

export interface InvitationEmailContext {
  firstName: string;
  inviterName: string;
  associationName: string;
  acceptUrl: string;
  role: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify your email address',
        template: './verify-email',
        context: {
          firstName,
          verificationUrl,
          expiresIn: '24 hours',
        } as EmailVerificationContext,
      });

      this.logger.log(`Email verification sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email verification to ${email}: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to send email verification');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    email: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password',
        template: './reset-password',
        context: {
          firstName,
          resetUrl,
          expiresIn: '1 hour',
        } as PasswordResetContext,
      });

      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send welcome email after email verification
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string,
    associationName?: string,
  ): Promise<void> {
    const loginUrl = `${this.frontendUrl}/auth/login`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Diaspora Platform!',
        template: './welcome',
        context: {
          firstName,
          associationName,
          loginUrl,
        } as WelcomeEmailContext,
      });

      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}: ${error.message}`,
        error.stack,
      );
      // Don't throw - welcome email is not critical
    }
  }

  /**
   * Send member invitation email
   */
  async sendMemberInvitation(
    email: string,
    firstName: string,
    inviterName: string,
    associationName: string,
    role: string,
    token?: string,
  ): Promise<void> {
    const acceptUrl = token
      ? `${this.frontendUrl}/invitations/accept?token=${token}`
      : `${this.frontendUrl}/auth/login`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `You've been invited to join ${associationName}`,
        template: './invitation',
        context: {
          firstName,
          inviterName,
          associationName,
          acceptUrl,
          role,
        } as InvitationEmailContext,
      });

      this.logger.log(`Invitation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send invitation email to ${email}: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to send invitation email');
    }
  }

  /**
   * Send test email (for configuration testing)
   */
  async sendTestEmail(email: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Diaspora Platform - Test Email',
        html: `
          <h1>Test Email</h1>
          <p>If you're reading this, your email configuration is working correctly!</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
      });

      this.logger.log(`Test email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send test email to ${email}: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to send test email');
    }
  }
}
