"use server";

import { paymentService, RecordManualPaymentInput } from "@/lib/services/payment.service";
import { PaymentMethod } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { requireAuth } from "@/lib/auth/session";
import { dispatchPaymentReceiptNotification } from "./payment-dispatch.actions";
import {
  getPaymentsAction as fetchPayments,
  getUnpaidInvoicesAction as fetchUnpaidInvoices,
  getUnpaidBillsAction as fetchUnpaidBills,
} from "./payment-query.actions";

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
  documentId: string;
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

export async function getPaymentsAction() {
  return fetchPayments();
}

export async function getUnpaidInvoicesAction() {
  return fetchUnpaidInvoices();
}

export async function getUnpaidBillsAction() {
  return fetchUnpaidBills();
}

export interface RecordPaymentActionInput {
  documentId: string;
  documentType: "BILL" | "INVOICE";
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  note?: string;
  userId?: string;
}

export async function recordPaymentAction(input: RecordPaymentActionInput) {
  try {
    let effectiveUserId = input.userId;
    if (!effectiveUserId) {
      const session = await requireAuth();
      effectiveUserId = session.user.id;
    }

    const paymentInput: RecordManualPaymentInput = {
      documentId: input.documentId,
      documentType: input.documentType,
      amount: new Decimal(input.amount),
      paymentMethod: input.paymentMethod,
      paymentDate: input.paymentDate,
      note: input.note,
      userId: effectiveUserId,
    };

    const payment = await paymentService.recordManualPayment(paymentInput);

    // Fire-and-forget notification dispatch (doesn't block payment if email service is down)
    dispatchPaymentReceiptNotification({
      documentId: input.documentId,
      documentType: input.documentType,
      amount: input.amount,
      paymentDate: input.paymentDate,
      paymentMethod: input.paymentMethod,
    }).catch(() => {
      // Notification dispatch failure logged internally
    });

    return { success: true, data: payment };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to record payment" };
  }
}
