"use server";

import { prisma } from "@/lib/prisma";
import { recordPaymentAction } from "./payment.actions";
import { PaymentMethod } from "@prisma/client";
import { CopilotActionResult } from "./copilot.actions";

export async function handleRecordPayment(
  input: Record<string, unknown>,
  userId: string
): Promise<CopilotActionResult> {
  try {
    const docNumber = String(input.documentNumber || "").trim();
    const amount = Number(input.amount || 0);
    const rawMethod = String(input.paymentMethod || "").toUpperCase();
    const paymentMethod: PaymentMethod = rawMethod.includes("CASH") ? PaymentMethod.CASH : PaymentMethod.BANK;
    const note = input.note ? String(input.note).trim() : `Copilot recorded payment for ${docNumber}`;

    if (!docNumber) return { success: false, error: "Document number or ID is required." };
    if (amount <= 0) return { success: false, error: "Payment amount must be greater than zero." };

    // 1. Check Customer Invoice
    const invoice = await prisma.customerInvoice.findFirst({
      where: { OR: [{ id: docNumber }, { invoiceNumber: docNumber }] },
      include: { customer: { select: { name: true } } },
    });

    if (invoice) {
      const res = await recordPaymentAction({
        documentId: invoice.id,
        documentType: "INVOICE",
        amount,
        paymentMethod,
        paymentDate: new Date(),
        note,
        userId,
      });

      if (!res.success) return { success: false, error: res.error || "Failed to record invoice payment." };

      return {
        success: true,
        action: "recordPaymentAction",
        message: `Inbound payment of ₹${amount.toLocaleString("en-IN")} recorded for Invoice ${invoice.invoiceNumber} (${invoice.customer?.name || "Customer"}).`,
        documentNumber: invoice.invoiceNumber,
        documentType: "INVOICE",
        amount,
        paymentMethod,
      };
    }

    // 2. Check Vendor Bill
    const bill = await prisma.vendorBill.findFirst({
      where: { OR: [{ id: docNumber }, { billNumber: docNumber }] },
      include: { vendor: { select: { name: true } } },
    });

    if (bill) {
      const res = await recordPaymentAction({
        documentId: bill.id,
        documentType: "BILL",
        amount,
        paymentMethod,
        paymentDate: new Date(),
        note,
        userId,
      });

      if (!res.success) return { success: false, error: res.error || "Failed to record bill payment." };

      return {
        success: true,
        action: "recordPaymentAction",
        message: `Outbound payment of ₹${amount.toLocaleString("en-IN")} recorded for Vendor Bill ${bill.billNumber} (${bill.vendor?.name || "Vendor"}).`,
        documentNumber: bill.billNumber,
        documentType: "BILL",
        amount,
        paymentMethod,
      };
    }

    return { success: false, error: `Document '${docNumber}' was not found in Invoices or Vendor Bills.` };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to process payment." };
  }
}
