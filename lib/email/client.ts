import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { createEmailTransporter } from "./transporter";
import { renderPortalInvitationTemplate } from "./templates/portal-invitation.template";
import { renderWelcomeTemplate } from "./templates/welcome.template";
import { renderPaymentConfirmationTemplate } from "./templates/payment-confirmation.template";
import { renderPasswordResetTemplate } from "./templates/password-reset.template";
import {
  renderBillPaymentReminderTemplate,
  BillPaymentReminderTemplateParams,
} from "./templates/bill-payment-reminder.template";
import {
  renderInvoicePaymentReminderTemplate,
  InvoicePaymentReminderTemplateParams,
} from "./templates/invoice-payment-reminder.template";
import {
  renderInvoiceDispatchTemplate,
  InvoiceDispatchTemplateParams,
} from "./templates/invoice-dispatch.template";
import {
  renderRemittanceAdviceTemplate,
  RemittanceAdviceTemplateParams,
} from "./templates/remittance-advice.template";

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export class EmailService {
  private transporter: Transporter | null = null;

  private async getTransporter(): Promise<Transporter> {
    if (!this.transporter) {
      this.transporter = await createEmailTransporter();
    }
    return this.transporter;
  }

  async send(input: SendEmailInput) {
    const transporter = await this.getTransporter();
    const fromAddress =
      process.env.SMTP_FROM ||
      (process.env.SMTP_USER
        ? `LedgerOne <${process.env.SMTP_USER}>`
        : '"LedgerOne" <noreply@ledgerone.com>');

    const info = await transporter.sendMail({
      from: fromAddress,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments,
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
    const { subject, html } = renderPortalInvitationTemplate({
      email,
      loginId,
      temporaryPassword,
      contactName,
    });
    return this.send({ to: email, subject, html });
  }

  async sendWelcomeEmail(email: string, userName: string, roleName?: string) {
    const { subject, html } = renderWelcomeTemplate({
      email,
      userName,
      roleName,
    });
    return this.send({ to: email, subject, html });
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
    const { subject, html } = renderPaymentConfirmationTemplate({
      customerName,
      customerEmail,
      invoiceNumber,
      invoiceTotal,
      paymentAmount,
      paymentDate,
      amountPaid,
      remainingBalance,
      invoiceId,
    });
    return this.send({ to: customerEmail, subject, html });
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName?: string | null
  ) {
    const { subject, html } = renderPasswordResetTemplate({
      email,
      resetToken,
      userName,
    });
    return this.send({ to: email, subject, html });
  }

  async sendBillPaymentReminder(input: BillPaymentReminderTemplateParams) {
    const { subject, html } = renderBillPaymentReminderTemplate(input);
    return this.send({ to: input.vendorEmail, subject, html });
  }

  async sendInvoicePaymentReminder(input: InvoicePaymentReminderTemplateParams) {
    const { subject, html } = renderInvoicePaymentReminderTemplate(input);
    return this.send({ to: input.customerEmail, subject, html });
  }

  async sendInvoiceWithPDF(
    input: InvoiceDispatchTemplateParams & { pdfBuffer: Buffer }
  ) {
    const { subject, html } = renderInvoiceDispatchTemplate(input);
    return this.send({
      to: input.customerEmail,
      subject,
      html,
      attachments: [
        {
          filename: `Invoice-${input.invoiceNumber}.pdf`,
          content: input.pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  }

  async sendRemittanceAdvice(input: RemittanceAdviceTemplateParams) {
    const { subject, html } = renderRemittanceAdviceTemplate(input);
    return this.send({ to: input.vendorEmail, subject, html });
  }
}

export const emailService = new EmailService();
