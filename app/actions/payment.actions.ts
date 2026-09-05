"use server";

import { paymentService, RecordManualPaymentInput } from "@/lib/services/payment.service";
import { PrismaClient, PaymentMethod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface PaymentRecord {
  id: string;
  ref: string;
  party: string;
  method: string;
  direction: "INBOUND" | "OUTBOUND";
  date: string;
  account: string;
  amount: number;
  documentType: "INVOICE" | "BILL";
  documentNumber: string;
}

export async function getPaymentsAction() {
  try {
    // Fetch invoice payments
    const invoicePayments = await prisma.invoicePayment.findMany({
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    // Fetch bill payments
    const billPayments = await prisma.billPayment.findMany({
      include: {
        vendorBill: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: {
        paymentDate: "desc",
      },
    });

    // Transform to unified format
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
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, data: payments };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch payments" };
  }
}

export interface UnpaidDocument {
  id: string;
  number: string;
  party: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  dueDate: string;
}

export async function getUnpaidInvoicesAction() {
  try {
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        status: "CONFIRMED",
        paymentStatus: {
          in: ["NOT_PAID", "PARTIAL"],
        },
      },
      include: {
        customer: true,
      },
      orderBy: {
        dueDate: "asc",
      },
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

export async function getUnpaidBillsAction() {
  try {
    const bills = await prisma.vendorBill.findMany({
      where: {
        status: "CONFIRMED",
        paymentStatus: {
          in: ["NOT_PAID", "PARTIAL"],
        },
      },
      include: {
        vendor: true,
      },
      orderBy: {
        dueDate: "asc",
      },
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

export interface RecordPaymentActionInput {
  documentId: string;
  documentType: "BILL" | "INVOICE";
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  note?: string;
  userId: string;
}

export async function recordPaymentAction(input: RecordPaymentActionInput) {
  try {
    const paymentInput: RecordManualPaymentInput = {
      documentId: input.documentId,
      documentType: input.documentType,
      amount: new Decimal(input.amount),
      paymentMethod: input.paymentMethod,
      paymentDate: input.paymentDate,
      note: input.note,
      userId: input.userId,
    };

    const payment = await paymentService.recordManualPayment(paymentInput);

    return { success: true, data: payment };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to record payment" };
  }
}
