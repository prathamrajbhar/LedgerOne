"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/client";
import { requireAuth } from "@/lib/auth/session";
import {
  DocumentStatus,
  EmailDeliveryStatus,
  EmailReminderType,
  PaymentStatus,
} from "@prisma/client";

export async function sendInvoicePaymentReminderAction(invoiceId: string) {
  try {
    await requireAuth();

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) return { success: false, error: "Invoice not found" };
    if (!invoice.customer?.email) {
      return { success: false, error: "Customer does not have an email address" };
    }
    if (invoice.status !== DocumentStatus.CONFIRMED) {
      return { success: false, error: "Only confirmed invoices can have reminders sent" };
    }
    if (invoice.paymentStatus === PaymentStatus.PAID || Number(invoice.amountDue) <= 0) {
      return { success: false, error: "Invoice is already fully paid" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(invoice.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = diffDays < 0;
    const absDays = Math.abs(diffDays);

    const emailType = isOverdue ? EmailReminderType.OVERDUE : absDays <= 3 ? EmailReminderType.DUE_SOON : EmailReminderType.MANUAL;
    const formattedDue = new Date(invoice.dueDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    let deliveryStatus: EmailDeliveryStatus = EmailDeliveryStatus.SENT;
    let deliveryError: string | undefined;

    try {
      await emailService.sendInvoicePaymentReminder({
        customerName: invoice.customer.name,
        customerEmail: invoice.customer.email,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        amountDue: Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        dueDate: formattedDue,
        isOverdue,
        daysDiff: absDays,
        invoiceId: invoice.id,
      });
    } catch (err) {
      deliveryStatus = EmailDeliveryStatus.FAILED;
      deliveryError = err instanceof Error ? err.message : "Failed to dispatch email";
    }

    const now = new Date();
    const [log] = await prisma.$transaction([
      prisma.invoiceEmailLog.create({
        data: {
          invoiceId: invoice.id,
          recipientEmail: invoice.customer.email,
          recipientName: invoice.customer.name,
          emailType,
          subject: `${isOverdue ? "[OVERDUE NOTICE]" : "[PAYMENT REMINDER]"} Invoice #${invoice.invoiceNumber}`,
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
      return { success: false, error: deliveryError || "Failed to dispatch email" };
    }

    return {
      success: true,
      message: `Payment reminder sent to ${invoice.customer.email}`,
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
      error: error instanceof Error ? error.message : "Failed to send reminder",
    };
  }
}
