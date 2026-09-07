"use server";

import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PaymentRecord, UnpaidDocument } from "./payment.actions";

export async function getPaymentsAction(): Promise<{ success: boolean; data?: PaymentRecord[]; error?: string }> {
  try {
    const invoicePayments = await prisma.invoicePayment.findMany({
      include: { invoice: { include: { customer: true } } },
      orderBy: { paymentDate: "desc" },
    });

    const billPayments = await prisma.billPayment.findMany({
      include: { vendorBill: { include: { vendor: true } } },
      orderBy: { paymentDate: "desc" },
    });

    const payments: PaymentRecord[] = [
      ...invoicePayments.map((p) => ({
        id: p.id,
        ref: `PAY-INV-${p.id.slice(-6).toUpperCase()}`,
        party: p.invoice.customer.name,
        method: p.paymentMethod === PaymentMethod.BANK ? "Bank Transfer" : "Cash",
        direction: "INBOUND" as const,
        date: p.paymentDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        account: p.paymentMethod === PaymentMethod.BANK ? "HDFC Bank Current A/c" : "Cash in Hand",
        amount: p.amount.toNumber(),
        documentType: "INVOICE" as const,
        documentNumber: p.invoice.invoiceNumber,
        documentId: p.invoice.id,
      })),
      ...billPayments.map((p) => ({
        id: p.id,
        ref: `PAY-BILL-${p.id.slice(-6).toUpperCase()}`,
        party: p.vendorBill.vendor.name,
        method: p.paymentMethod === PaymentMethod.BANK ? "Bank Transfer" : "Cash",
        direction: "OUTBOUND" as const,
        date: p.paymentDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        account: p.paymentMethod === PaymentMethod.BANK ? "HDFC Bank Current A/c" : "Cash in Hand",
        amount: p.amount.toNumber(),
        documentType: "BILL" as const,
        documentNumber: p.vendorBill.billNumber,
        documentId: p.vendorBill.id,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, data: payments };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch payments" };
  }
}

export async function getUnpaidInvoicesAction(): Promise<{ success: boolean; data?: UnpaidDocument[]; error?: string }> {
  try {
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        status: "CONFIRMED",
        paymentStatus: { in: ["NOT_PAID", "PARTIAL"] },
      },
      include: { customer: true },
      orderBy: { dueDate: "asc" },
    });

    const unpaid: UnpaidDocument[] = invoices.map((inv) => ({
      id: inv.id,
      number: inv.invoiceNumber,
      party: inv.customer.name,
      total: inv.total.toNumber(),
      amountPaid: inv.amountPaid.toNumber(),
      amountDue: inv.amountDue.toNumber(),
      dueDate: inv.dueDate.toLocaleDateString("en-IN"),
    }));

    return { success: true, data: unpaid };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch unpaid invoices" };
  }
}

export async function getUnpaidBillsAction(): Promise<{ success: boolean; data?: UnpaidDocument[]; error?: string }> {
  try {
    const bills = await prisma.vendorBill.findMany({
      where: {
        status: "CONFIRMED",
        paymentStatus: { in: ["NOT_PAID", "PARTIAL"] },
      },
      include: { vendor: true },
      orderBy: { dueDate: "asc" },
    });

    const unpaid: UnpaidDocument[] = bills.map((bill) => ({
      id: bill.id,
      number: bill.billNumber,
      party: bill.vendor.name,
      total: bill.total.toNumber(),
      amountPaid: bill.amountPaid.toNumber(),
      amountDue: bill.amountDue.toNumber(),
      dueDate: bill.dueDate.toLocaleDateString("en-IN"),
    }));

    return { success: true, data: unpaid };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch unpaid bills" };
  }
}
