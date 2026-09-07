"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/client";
import { requireAuth } from "@/lib/auth/session";
import { generateInvoicePDF, InvoiceWithRelations } from "@/lib/pdf/invoice-pdf";
import {
  DocumentStatus,
  EmailDeliveryStatus,
  EmailReminderType,
} from "@prisma/client";

export interface SendInvoiceEmailResult {
  success: boolean;
  message?: string;
  error?: string;
  log?: {
    id: string;
    sentAt: string;
    recipientEmail: string;
    emailType: string;
    status: string;
  };
}

export async function sendInvoiceEmailWithPDFAction(
  invoiceId: string
): Promise<SendInvoiceEmailResult> {
  try {
    await requireAuth();

    const [invoice, companySettings] = await Promise.all([
      prisma.customerInvoice.findUnique({
        where: { id: invoiceId },
        include: {
          customer: true,
          salesOrder: true,
          lines: {
            include: {
              product: true,
              taxRate: true,
              analyticAccount: true,
            },
          },
          payments: true,
        },
      }),
      prisma.companySettings.findFirst(),
    ]);

    if (!invoice) {
      return { success: false, error: "Customer invoice not found" };
    }

    if (!invoice.customer?.email) {
      return { success: false, error: "Customer does not have a registered email" };
    }

    if (invoice.status === DocumentStatus.CANCELLED) {
      return { success: false, error: "Cannot send a cancelled invoice" };
    }

    const pdfBuffer = await generateInvoicePDF({
      ...invoice,
      companySettings,
    } as unknown as InvoiceWithRelations);

    const formattedDue = new Date(invoice.dueDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let deliveryStatus: EmailDeliveryStatus = EmailDeliveryStatus.SENT;
    let deliveryError: string | undefined;

    try {
      await emailService.sendInvoiceWithPDF({
        customerName: invoice.customer.name,
        customerEmail: invoice.customer.email,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        amountDue: Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        dueDate: formattedDue,
        invoiceId: invoice.id,
        pdfBuffer,
      });
    } catch (sendErr) {
      deliveryStatus = EmailDeliveryStatus.FAILED;
      deliveryError = sendErr instanceof Error ? sendErr.message : "Failed to dispatch email";
    }

    const now = new Date();
    const [log] = await prisma.$transaction([
      prisma.invoiceEmailLog.create({
        data: {
          invoiceId: invoice.id,
          recipientEmail: invoice.customer.email,
          recipientName: invoice.customer.name,
          emailType: EmailReminderType.MANUAL,
          subject: `Tax Invoice #${invoice.invoiceNumber} from LedgerOne`,
          status: deliveryStatus,
          errorMessage: deliveryError,
          sentAt: now,
        },
      }),
      prisma.customerInvoice.update({
        where: { id: invoice.id },
        data: {
          lastReminderSentAt: now,
          reminderCount: { increment: 1 },
        },
      }),
    ]);

    revalidatePath(`/invoices/${invoiceId}`);
    revalidatePath("/invoices");

    if (deliveryStatus === EmailDeliveryStatus.FAILED) {
      return { success: false, error: deliveryError || "Email dispatch failed" };
    }

    return {
      success: true,
      message: `Tax Invoice #${invoice.invoiceNumber} emailed to ${invoice.customer.email}`,
      log: {
        id: log.id,
        sentAt: log.sentAt.toISOString(),
        recipientEmail: log.recipientEmail,
        emailType: log.emailType,
        status: log.status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invoice email",
    };
  }
}
