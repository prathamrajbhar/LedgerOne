import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: Transporter | null = null;

  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // If explicit credentials are provided, use them
    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      return this.transporter;
    }

    // Otherwise create an automatic Ethereal test account for development/testing
    console.warn("SMTP_USER or SMTP_PASS not set. Falling back to Ethereal Mail test account.");
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return this.transporter;
  }

  async send(input: SendEmailInput) {
    const transporter = await this.getTransporter();
    const fromAddress =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER ? `LedgerOne <${process.env.SMTP_USER}>` : '"LedgerOne" <noreply@ledgerone.com>');

    const info = await transporter.sendMail({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return {
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    };
  }

  async sendPortalInvitation(
    email: string,
    loginId: string,
    temporaryPassword: string,
    contactName: string
  ) {
    const portalUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/login`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .credentials { background-color: white; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
            .credentials strong { display: inline-block; width: 180px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to LedgerOne Portal</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${contactName}</strong>,</p>

              <p>You have been invited to access the LedgerOne Portal. This portal allows you to:</p>
              <ul>
                <li>View your invoices and bills</li>
                <li>Make payments online</li>
                <li>Track your transaction history</li>
                <li>Download payment receipts</li>
              </ul>

              <div class="credentials">
                <h3 style="margin-top: 0;">Your Login Credentials</h3>
                <p><strong>Portal URL:</strong> <a href="${portalUrl}">${portalUrl}</a></p>
                <p><strong>Login ID:</strong> ${loginId}</p>
                <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
              </div>

              <div class="warning">
                <strong>Important Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">This is a temporary password. For your security, you will be required to change it upon your first login.</p>
              </div>

              <p style="text-align: center;">
                <a href="${portalUrl}" class="button">Login to Portal</a>
              </p>

              <p><strong>Need Help?</strong><br>
              If you have any questions or need assistance accessing the portal, please contact our support team.</p>

              <div class="footer">
                <p>This is an automated message from LedgerOne Accounting System.<br>
                Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} LedgerOne. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.send({
      to: email,
      subject: "You're invited to LedgerOne Portal",
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

  async sendPaymentConfirmation(
    customerName: string,
    customerEmail: string,
    invoiceNumber: string,
    invoiceTotal: string,
    paymentAmount: string,
    paymentDate: string,
    amountPaid: string,
    remainingBalance: string,
    invoiceId: string
  ) {
    const portalUrl = `${process.env.NEXTAUTH_URL}/portal/invoices/${invoiceId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Payment Received</h2>

        <p>Dear ${customerName},</p>

        <p>Thank you for your payment. We have successfully received your payment for Invoice #${invoiceNumber}.</p>

        <h3 style="color: #374151; margin-top: 24px;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">₹${paymentAmount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Payment Date:</td>
            <td style="padding: 8px 0; text-align: right;">${paymentDate}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Payment Method:</td>
            <td style="padding: 8px 0; text-align: right;">Online Payment</td>
          </tr>
        </table>

        <h3 style="color: #374151; margin-top: 24px;">Invoice Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Invoice Number:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${invoiceNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Invoice Total:</td>
            <td style="padding: 8px 0; text-align: right;">₹${invoiceTotal}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Total Amount Paid:</td>
            <td style="padding: 8px 0; text-align: right;">₹${amountPaid}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px 0; color: #6b7280;">Remaining Balance:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${remainingBalance === '0.00' ? '#059669' : '#dc2626'};">₹${remainingBalance}</td>
          </tr>
        </table>

        ${remainingBalance === '0.00'
          ? '<p style="color: #059669; font-weight: 600;">✓ This invoice has been paid in full.</p>'
          : '<p style="color: #dc2626;">Note: There is still a remaining balance on this invoice.</p>'}

        <div style="margin: 32px 0; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-weight: 600;">View Invoice</p>
          <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">You can view your invoice details and download a copy from your portal:</p>
          <a href="${portalUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Invoice in Portal</a>
        </div>

        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>If you have any questions about this payment or invoice, please contact our support team.</p>
          <p style="margin-top: 16px;">Best regards,<br/>The LedgerOne Team</p>
        </div>
      </div>
    `;

    return this.send({
      to: customerEmail,
      subject: `Payment Received - Invoice #${invoiceNumber}`,
      html,
    });
  }
}

export const emailService = new EmailService();
