"use server";

import { revalidatePath } from "next/cache";
import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { paymentService } from "@/lib/services/payment.service";
import { PrismaClient, PaymentMethod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface PortalPaymentResult {
  success: boolean;
  error?: string;
}

export async function processPortalInvoicePaymentAction(input: {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
}): Promise<PortalPaymentResult> {
  try {
    const portalSession = await requireCustomerAccess();

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: input.invoiceId },
    });

    if (!invoice) {
      return { success: false, error: "Invoice not found" };
    }

    if (invoice.customerId !== portalSession.contactId) {
      return { success: false, error: "Unauthorized access to this invoice" };
    }

    if (input.amount <= 0) {
      return { success: false, error: "Payment amount must be greater than zero" };
    }

    if (new Decimal(input.amount).greaterThan(invoice.amountDue)) {
      return { success: false, error: "Payment amount exceeds balance due" };
    }

    await paymentService.recordManualPayment({
      documentId: invoice.id,
      documentType: "INVOICE",
      amount: new Decimal(input.amount),
      paymentMethod: input.paymentMethod,
      paymentDate: new Date(),
      note: input.note || `Paid via Client Portal by ${portalSession.contactName}`,
      userId: portalSession.userId,
    });

    revalidatePath("/portal/invoices");
    revalidatePath("/portal/dashboard");
    revalidatePath(`/portal/invoices/${input.invoiceId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process payment";
    return { success: false, error: message };
  }
}
