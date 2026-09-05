/**
 * Payment Service
 * Handles payment gateway integration and payment recording
 * Supports both manual payments (Admin/Accountant) and gateway payments (Contact Portal)
 */

import { PrismaClient, PaymentMethod, InvoicePaymentSource, PaymentGatewayStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, PaymentGatewayError, UnauthorizedError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface RecordManualPaymentInput {
  documentId: string; // VendorBill or CustomerInvoice ID
  documentType: "BILL" | "INVOICE";
  amount: Decimal;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  note?: string;
  userId: string;
}

export interface CreateGatewayOrderInput {
  invoiceId: string;
  amount: Decimal;
  contactId: string; // From session, for security check
}

export interface ConfirmGatewayPaymentInput {
  gatewayTransactionId: string;
  gatewayPaymentId: string;
  paymentMethod: string;
  webhookSignature: string;
}

export class PaymentService {
  /**
   * Record manual payment (Admin/Accountant only)
   * Creates payment record + Journal Entry #2 (payment-triggered entry)
   */
  async recordManualPayment(input: RecordManualPaymentInput) {
    if (input.documentType === "BILL") {
      return this.recordBillPayment(input);
    } else {
      return this.recordInvoicePayment(input);
    }
  }

  private async recordBillPayment(input: RecordManualPaymentInput) {
    return prisma.$transaction(async (tx) => {
      // Get vendor bill
      const bill = await tx.vendorBill.findUnique({
        where: { id: input.documentId },
      });

      if (!bill) {
        throw new NotFoundError("Vendor Bill not found");
      }

      if (input.amount.greaterThan(bill.amountDue)) {
        throw new ValidationError("Payment amount exceeds amount due");
      }

      // Create payment record
      const payment = await tx.billPayment.create({
        data: {
          vendorBillId: bill.id,
          amount: input.amount,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          note: input.note,
        },
      });

      // Update bill amounts
      const newAmountPaid = bill.amountPaid.add(input.amount);
      const newAmountDue = bill.total.sub(newAmountPaid);
      const newPaymentStatus = newAmountDue.isZero()
        ? "PAID"
        : newAmountDue.lessThan(bill.total)
        ? "PARTIAL"
        : "NOT_PAID";

      await tx.vendorBill.update({
        where: { id: bill.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus,
        },
      });

      // Create Journal Entry #2 (Creditors Dr / Cash-Bank Cr)
      // TODO: Implement JournalEntryService.createPaymentEntry
      // This will be created in the accounting service

      return payment;
    });
  }

  private async recordInvoicePayment(input: RecordManualPaymentInput) {
    return prisma.$transaction(async (tx) => {
      // Get invoice
      const invoice = await tx.customerInvoice.findUnique({
        where: { id: input.documentId },
      });

      if (!invoice) {
        throw new NotFoundError("Customer Invoice not found");
      }

      if (input.amount.greaterThan(invoice.amountDue)) {
        throw new ValidationError("Payment amount exceeds amount due");
      }

      // Create payment record
      const payment = await tx.invoicePayment.create({
        data: {
          invoiceId: invoice.id,
          amount: input.amount,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          source: InvoicePaymentSource.MANUAL,
          note: input.note,
        },
      });

      // Update invoice amounts
      const newAmountPaid = invoice.amountPaid.add(input.amount);
      const newAmountDue = invoice.total.sub(newAmountPaid);
      const newPaymentStatus = newAmountDue.isZero()
        ? "PAID"
        : newAmountDue.lessThan(invoice.total)
        ? "PARTIAL"
        : "NOT_PAID";

      await tx.customerInvoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus,
        },
      });

      // Create Journal Entry #2 (Cash/Bank Dr / Debtors Cr)
      // TODO: Implement JournalEntryService.createPaymentEntry

      return payment;
    });
  }

  /**
   * Create Payment Gateway order (Contact Portal)
   * Phase A of gateway payment flow
   */
  async createGatewayOrder(input: CreateGatewayOrderInput) {
    // Verify invoice belongs to this contact (security)
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: input.invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    if (invoice.customerId !== input.contactId) {
      throw new UnauthorizedError("Unauthorized access to this invoice");
    }

    if (input.amount.greaterThan(invoice.amountDue)) {
      throw new ValidationError("Payment amount exceeds amount due");
    }

    // Create gateway transaction record
    const transaction = await prisma.paymentGatewayTransaction.create({
      data: {
        invoiceId: invoice.id,
        gatewayOrderId: `ORDER_${Date.now()}_${invoice.id}`, // Placeholder
        amount: input.amount,
        status: PaymentGatewayStatus.INITIATED,
      },
    });

    // TODO: Call Razorpay API to create actual order
    // const razorpayOrder = await razorpay.orders.create({...})

    return {
      transactionId: transaction.id,
      gatewayOrderId: transaction.gatewayOrderId,
      amount: transaction.amount,
      // checkoutUrl: razorpayOrder.checkoutUrl,
    };
  }

  /**
   * Confirm Payment Gateway payment via webhook
   * Phase B of gateway payment flow
   */
  async confirmGatewayPayment(input: ConfirmGatewayPaymentInput) {
    // TODO: Verify webhook signature
    // if (!this.verifyRazorpaySignature(input.webhookSignature)) {
    //   throw new PaymentGatewayError("Invalid webhook signature");
    // }

    return prisma.$transaction(async (tx) => {
      // Get transaction
      const transaction = await tx.paymentGatewayTransaction.findUnique({
        where: { id: input.gatewayTransactionId },
        include: { invoice: true },
      });

      if (!transaction) {
        throw new NotFoundError("Transaction not found");
      }

      // Idempotency check
      if (transaction.gatewayPaymentId === input.gatewayPaymentId) {
        // Already processed
        return transaction;
      }

      // Update transaction
      await tx.paymentGatewayTransaction.update({
        where: { id: transaction.id },
        data: {
          gatewayPaymentId: input.gatewayPaymentId,
          status: PaymentGatewayStatus.SUCCESS,
          paymentMethod: input.paymentMethod,
          webhookVerifiedAt: new Date(),
        },
      });

      // Create invoice payment
      const payment = await tx.invoicePayment.create({
        data: {
          invoiceId: transaction.invoiceId,
          amount: transaction.amount,
          paymentDate: new Date(),
          paymentMethod: PaymentMethod.BANK, // Gateway payments go to Bank
          source: InvoicePaymentSource.GATEWAY,
          gatewayTransactionId: transaction.id,
        },
      });

      // Update invoice
      const invoice = transaction.invoice;
      const newAmountPaid = invoice.amountPaid.add(transaction.amount);
      const newAmountDue = invoice.total.sub(newAmountPaid);
      const newPaymentStatus = newAmountDue.isZero()
        ? "PAID"
        : newAmountDue.lessThan(invoice.total)
        ? "PARTIAL"
        : "NOT_PAID";

      await tx.customerInvoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus,
        },
      });

      // Create Journal Entry #2
      // TODO: Implement JournalEntryService.createPaymentEntry

      // TODO: Send confirmation email via Resend

      return payment;
    });
  }

  /**
   * Handle failed gateway payment
   */
  async handleGatewayFailure(transactionId: string, reason: string) {
    await prisma.paymentGatewayTransaction.update({
      where: { id: transactionId },
      data: {
        status: PaymentGatewayStatus.FAILED,
        failureReason: reason,
      },
    });
  }
}

export const paymentService = new PaymentService();
