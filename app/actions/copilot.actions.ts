"use server";

import { auth } from "@/lib/auth/auth.config";
import { contactService } from "@/lib/services/contact.service";
import { emailService } from "@/lib/email/client";
import { prisma } from "@/lib/prisma";
import { ContactType, DocumentStatus, PaymentStatus } from "@prisma/client";
import { handleCreateInvoiceDraft, handleCreateBillDraft, handleRecordExpense } from "./copilot-drafts";

export interface CopilotActionResult {
  success: boolean;
  action?: string;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export async function executeCopilotAction(
  toolName: string,
  input: Record<string, unknown>
): Promise<CopilotActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please log in to perform this action." };
  }
  const userId = session.user.id;

  // 1. Create Contact
  if (toolName === "createContactAction") {
    try {
      const name = String(input.name || "").trim();
      const email = String(input.email || "").trim();
      const type = (input.type as ContactType) || ContactType.CUSTOMER;
      const phone = input.phone ? String(input.phone).trim() : undefined;
      const city = input.city ? String(input.city).trim() : undefined;

      if (!name || !email) return { success: false, error: "Contact name and email are required." };

      const contact = await contactService.create({ name, email, type, phone, city });
      return {
        success: true,
        action: toolName,
        message: `Created ${type.toLowerCase()} '${contact.name}' (${contact.email}).`,
        contact: { id: contact.id, name: contact.name, email: contact.email, type: contact.type },
      };
    } catch (err) {
      return { success: false, action: toolName, error: (err as Error).message || "Failed to create contact." };
    }
  }

  // 2. Invoice Payment Reminder
  if (toolName === "sendInvoicePaymentReminder") {
    try {
      const invoiceId = String(input.invoiceId || "").trim();
      if (!invoiceId) return { success: false, error: "Invoice ID or Number is required." };

      const invoice = await prisma.customerInvoice.findFirst({
        where: { OR: [{ id: invoiceId }, { invoiceNumber: invoiceId }] },
        include: { customer: true },
      });

      if (!invoice) return { success: false, error: `Invoice '${invoiceId}' not found.` };
      if (!invoice.customer?.email) return { success: false, error: "Customer has no registered email." };
      if (invoice.status !== DocumentStatus.CONFIRMED) return { success: false, error: "Reminders can only be sent for Confirmed invoices." };
      if (invoice.paymentStatus === PaymentStatus.PAID || Number(invoice.amountDue) <= 0) return { success: false, error: "Invoice is already fully paid." };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(invoice.dueDate);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      await emailService.sendInvoicePaymentReminder({
        customerName: invoice.customer.name,
        customerEmail: invoice.customer.email,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        amountDue: Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        dueDate: new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        isOverdue: diffDays < 0,
        daysDiff: Math.abs(diffDays),
        invoiceId: invoice.id,
      });

      await prisma.customerInvoice.update({
        where: { id: invoice.id },
        data: { reminderCount: { increment: 1 }, lastReminderSentAt: new Date() },
      });

      return {
        success: true,
        action: toolName,
        message: `Reminder email dispatched to ${invoice.customer.email} for invoice ${invoice.invoiceNumber}.`,
        invoiceNumber: invoice.invoiceNumber,
      };
    } catch (err) {
      return { success: false, action: toolName, error: (err as Error).message || "Failed to dispatch reminder." };
    }
  }

  // 3. Draft Invoices, Bills, and Expenses
  if (toolName === "createCustomerInvoiceDraftAction") {
    return handleCreateInvoiceDraft(input, userId);
  }
  if (toolName === "createVendorBillDraftAction") {
    return handleCreateBillDraft(input, userId);
  }
  if (toolName === "recordExpenseAction") {
    return handleRecordExpense(input, userId);
  }

  return { success: false, error: `Unknown sensitive action '${toolName}'.` };
}
