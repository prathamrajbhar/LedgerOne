"use server";

import { auth } from "@/lib/auth/auth.config";
import { contactService } from "@/lib/services/contact.service";
import { emailService } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";
import { ContactType, DocumentStatus, PaymentStatus } from "@prisma/client";

export interface CopilotActionResult {
  success: boolean;
  action?: string;
  message?: string;
  error?: string;
  contact?: {
    id: string;
    name: string;
    email: string;
    type: string;
  };
  invoiceNumber?: string;
  recipient?: string;
}

export async function executeCopilotAction(
  toolName: string,
  input: Record<string, unknown>
): Promise<CopilotActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in to perform this action." };
  }

  if (toolName === "createContactAction") {
    try {
      const name = String(input.name || "").trim();
      const email = String(input.email || "").trim();
      const type = (input.type as ContactType) || ContactType.CUSTOMER;
      const phone = input.phone ? String(input.phone).trim() : undefined;
      const city = input.city ? String(input.city).trim() : undefined;

      if (!name || !email) {
        return { success: false, error: "Contact name and email are required." };
      }

      const contact = await contactService.create({
        name,
        email,
        type,
        phone,
        city,
      });

      return {
        success: true,
        action: "createContactAction",
        message: `Successfully created ${type.toLowerCase()} '${contact.name}' (${contact.email}).`,
        contact: {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          type: contact.type,
        },
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        action: "createContactAction",
        error: error.message || "Failed to create contact.",
      };
    }
  }

  if (toolName === "sendInvoicePaymentReminder") {
    try {
      const invoiceId = String(input.invoiceId || "").trim();
      if (!invoiceId) {
        return { success: false, error: "Invoice ID or Invoice Number is required." };
      }

      const invoice = await prisma.customerInvoice.findFirst({
        where: {
          OR: [{ id: invoiceId }, { invoiceNumber: invoiceId }],
        },
        include: { customer: true },
      });

      if (!invoice) {
        return { success: false, error: `Invoice '${invoiceId}' was not found.` };
      }
      if (!invoice.customer?.email) {
        return { success: false, error: "Customer does not have a registered email address." };
      }
      if (invoice.status !== DocumentStatus.CONFIRMED) {
        return { success: false, error: "Reminders can only be dispatched for Confirmed invoices." };
      }
      if (invoice.paymentStatus === PaymentStatus.PAID || Number(invoice.amountDue) <= 0) {
        return { success: false, error: "Invoice is already fully paid." };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(invoice.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isOverdue = diffDays < 0;
      const absDays = Math.abs(diffDays);

      const formattedDue = new Date(invoice.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

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

      await prisma.customerInvoice.update({
        where: { id: invoice.id },
        data: {
          reminderCount: { increment: 1 },
          lastReminderSentAt: new Date(),
        },
      });

      return {
        success: true,
        action: "sendInvoicePaymentReminder",
        message: `Payment reminder email successfully dispatched to ${invoice.customer.email} for invoice ${invoice.invoiceNumber}.`,
        invoiceNumber: invoice.invoiceNumber,
        recipient: invoice.customer.email,
      };
    } catch (err) {
      const error = err as Error;
      return {
        success: false,
        action: "sendInvoicePaymentReminder",
        error: error.message || "Failed to dispatch payment reminder.",
      };
    }
  }

  return { success: false, error: `Unknown sensitive action '${toolName}'.` };
}
