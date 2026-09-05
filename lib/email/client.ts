import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async send(input: SendEmailInput) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("RESEND_FROM_EMAIL environment variable is not set");
    }

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  }

  async sendPortalInvitation(email: string, temporaryPassword: string) {
    const html = `
      <h2>Welcome to LedgerOne Portal</h2>
      <p>You have been invited to access the LedgerOne customer/vendor portal.</p>
      <p><strong>Login Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p>Please log in and change your password immediately.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/login">Login to Portal</a></p>
    `;

    return this.send({
      to: email,
      subject: "LedgerOne Portal Invitation",
      html,
    });
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.send({
      to: email,
      subject: "LedgerOne Password Reset",
      html,
    });
  }

  async sendWelcomeEmail(email: string, userName: string) {
    const html = `
      <h2>Welcome to LedgerOne!</h2>
      <p>Hello ${userName},</p>
      <p>Your account has been successfully created.</p>
      <p>You can now log in to access the system.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/login">Login to LedgerOne</a></p>
    `;

    return this.send({
      to: email,
      subject: "Welcome to LedgerOne",
      html,
    });
  }
}

export const emailService = new EmailService();
