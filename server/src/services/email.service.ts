import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class EmailService {
  private static getTransporter() {
    if (process.env.NODE_ENV === 'test' || env.NODE_ENV === 'test') {
      return null;
    }

    const user = process.env.SMTP_USER || env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || env.SMTP_PASS || '';
    const host = process.env.SMTP_HOST || env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || String(env.SMTP_PORT || 587), 10);
    const secure = (process.env.SMTP_SECURE || String(env.SMTP_SECURE)) === 'true';

    if (
      !user ||
      !pass ||
      user.includes('your-email') ||
      pass.includes('your-app-password')
    ) {
      return null;
    }

    const transportOptions = {
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
      auth: {
        user,
        pass
      }
    };

    if (host.includes('gmail')) {
      return nodemailer.createTransport({
        service: 'gmail',
        ...transportOptions
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      ...transportOptions
    });
  }

  private static async sendMail(options: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    const recipient = (options.to || '').trim().toLowerCase();

    // Prevent sending real emails to dummy/test domains that trigger Gmail spam blocks & bounces
    const dummyDomains = ['example.com', 'example.org', 'example.net', 'test.com', 'localhost', 'invalid'];
    const recipientDomain = recipient.split('@')[1] || '';
    if (dummyDomains.includes(recipientDomain)) {
      console.log(`[EMAIL LOG - DUMMY DOMAIN SKIPPED] To: ${options.to} | Subject: ${options.subject}`);
      return;
    }

    const transporter = this.getTransporter();

    if (!transporter) {
      console.log(`[EMAIL LOG - NO SMTP / TEST MODE] To: ${options.to} | Subject: ${options.subject}`);
      return;
    }

    const smtpUser = process.env.SMTP_USER || env.SMTP_USER || '';
    const emailFrom = process.env.EMAIL_FROM || env.EMAIL_FROM || '';

    // Gmail SMTP requires the From address to match the authenticated SMTP_USER to avoid spam filter blocking
    const fromHeader =
      smtpUser.includes('@gmail.com') || !emailFrom || emailFrom.includes('no-reply@workforge.com')
        ? `"WorkForge Team" <${smtpUser}>`
        : emailFrom;

    // Generate plain text fallback by stripping HTML tags if plain text is not explicitly passed
    const plainText = options.text || options.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    try {
      const info = await transporter.sendMail({
        from: fromHeader,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: plainText
      });
      console.log(`[EMAIL SENT SUCCESS] To: ${options.to} | MessageId: ${info.messageId}`);
    } catch (error) {
      console.error(`[EMAIL ERROR] Failed to send email to ${options.to}:`, error);
    }
  }

  static async sendInvitationEmail(to: string, orgName: string, inviteToken: string, inviterName: string) {
    const inviteUrl = `${env.CLIENT_URL}/accept-invitation?token=${inviteToken}`;
    const subject = `You've been invited to join ${orgName} on WorkForge`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="color: #6366f1; margin-top: 0;">WorkForge Organization Invitation</h2>
          <p>Hello,</p>
          <p><strong>${inviterName}</strong> has invited you to join the <strong>${orgName}</strong> workspace on WorkForge.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${inviteUrl}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Accept Invitation</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">If the button above does not work, copy and paste this link into your browser:<br/><a href="${inviteUrl}" style="color: #818cf8;">${inviteUrl}</a></p>
        </div>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }

  static async sendVerificationEmail(to: string, userName: string, verifyToken: string) {
    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    const subject = `Verify your email for WorkForge`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="color: #6366f1; margin-top: 0;">Welcome to WorkForge</h2>
          <p>Hi ${userName},</p>
          <p>Please click the button below to verify your email address and activate your account.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verifyUrl}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Verify Email Address</a>
          </div>
        </div>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }

  static async sendPasswordResetEmail(to: string, userName: string, resetToken: string) {
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const subject = `Reset your WorkForge Password`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="color: #ef4444; margin-top: 0;">Password Reset Request</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your WorkForge password. Click the button below to set a new password.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">If you did not request a password reset, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }

  static async sendTaskAssignedEmail(to: string, userName: string, taskTitle: string, taskKey: string, assignerName: string) {
    const subject = `Task Assigned: [${taskKey}] ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="color: #6366f1; margin-top: 0;">New Task Assignment</h2>
          <p>Hi ${userName},</p>
          <p><strong>${assignerName}</strong> assigned task <strong>${taskKey}: ${taskTitle}</strong> to you.</p>
          <div style="margin: 20px 0; padding: 16px; background-color: #0f172a; border-radius: 8px; border-left: 4px solid #6366f1;">
            <span style="color: #818cf8; font-weight: bold;">${taskKey}</span> — ${taskTitle}
          </div>
        </div>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }

  static async sendCommentNotificationEmail(to: string, userName: string, taskTitle: string, taskKey: string, commenterName: string, commentContent: string) {
    const subject = `New Comment on [${taskKey}] ${taskTitle}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="color: #3b82f6; margin-top: 0;">New Task Comment</h2>
          <p>Hi ${userName},</p>
          <p><strong>${commenterName}</strong> commented on task <strong>${taskKey}: ${taskTitle}</strong>:</p>
          <div style="margin: 20px 0; padding: 16px; background-color: #0f172a; border-radius: 8px; border-left: 4px solid #3b82f6; font-style: italic; color: #cbd5e1;">
            "${commentContent}"
          </div>
        </div>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }

  static async sendRoleUpdatedEmail(to: string, userName: string, orgName: string, newRole: string) {
    const subject = `Your role in ${orgName} has been updated to ${newRole}`;
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 24px; border: 1px solid #334155;">
          <h2 style="color: #a855f7; margin-top: 0;">Organization Role Update</h2>
          <p>Hi ${userName},</p>
          <p>Your member role in <strong>${orgName}</strong> has been updated to <strong>${newRole}</strong>.</p>
        </div>
      </div>
    `;

    await this.sendMail({ to, subject, html });
  }
}
