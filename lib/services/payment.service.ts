/**
 * Payment Service
 * Handles payment gateway integration and payment recording
 * Supports both manual payments (Admin/Accountant) and gateway payments (Contact Portal)
 */

import { PrismaClient, PaymentMethod, InvoicePaymentSource, PaymentGatewayStatus, JournalEntrySource } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, PaymentGatewayError, UnauthorizedError, NotFoundError } from "../utils/errors";
import { journalEntryService } from "./journal-entry.service";
import { emailService } from "../email/client";

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

      // Get company settings for account mappings
      const settings = await tx.companySettings.findFirst();
      if (!settings?.creditorsAccountId) {
        throw new ValidationError("Creditors account not configured in company settings");
      }

      // Get appropriate journal based on payment method
      const journalType = input.paymentMethod === PaymentMethod.BANK ? "BANK" : "CASH";
      const journal = await tx.journal.findFirst({
        where: { type: journalType },
        include: { defaultAccount: true },
      });

      if (!journal) {
        throw new ValidationError(`${journalType} journal not found`);
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
      await journalEntryService.autoGenerate({
        source: JournalEntrySource.BILL_PAYMENT,
        journalId: journal.id,
        accountingDate: input.paymentDate,
        sourceDocumentId: payment.id,
        userId: input.userId,
        lines: [
          {
            accountId: settings.creditorsAccountId,
            partnerId: bill.vendorId,
            debit: input.amount,
            credit: new Decimal(0),
          },
          {
            accountId: journal.defaultAccountId,
            partnerId: bill.vendorId,
            debit: new Decimal(0),
            credit: input.amount,
          },
        ],
      });

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

      // Get company settings for account mappings
      const settings = await tx.companySettings.findFirst();
      if (!settings?.debtorsAccountId) {
        throw new ValidationError("Debtors account not configured in company settings");
      }

      // Get appropriate journal based on payment method
      const journalType = input.paymentMethod === PaymentMethod.BANK ? "BANK" : "CASH";
      const journal = await tx.journal.findFirst({
        where: { type: journalType },
        include: { defaultAccount: true },
      });

      if (!journal) {
        throw new ValidationError(`${journalType} journal not found`);
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
      await journalEntryService.autoGenerate({
        source: JournalEntrySource.INVOICE_PAYMENT,
        journalId: journal.id,
        accountingDate: input.paymentDate,
        sourceDocumentId: payment.id,
        userId: input.userId,
        lines: [
          {
            accountId: journal.defaultAccountId,
            partnerId: invoice.customerId,
            debit: input.amount,
            credit: new Decimal(0),
          },
          {
            accountId: settings.debtorsAccountId,
            partnerId: invoice.customerId,
            debit: new Decimal(0),
            credit: input.amount,
          },
        ],
      });

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

    // ========================================================================
    // PAYMENT GATEWAY INTEGRATION - NOT YET IMPLEMENTED
    // ========================================================================
    // This is a PLACEHOLDER implementation. Real payment processing will NOT work.
    //
    // To enable real Razorpay payment processing:
    // 1. Uncomment the Razorpay API call below (lines marked with // REAL:)
    // 2. Replace the placeholder gatewayOrderId with the real one from Razorpay
    // 3. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file
    // 4. Test thoroughly with Razorpay test credentials before production
    // 5. Handle API errors (network failures, invalid credentials, rate limits)
    // 6. Add retry logic for transient failures
    //
    // Required Razorpay API call:
    // REAL: const razorpayOrder = await razorpayClient.createOrder({
    // REAL:   amount: input.amount.toNumber() * 100, // Convert to paise
    // REAL:   currency: 'INR',
    // REAL:   receipt: `INV-${invoice.invoiceNumber}`,
    // REAL:   notes: { invoiceId: invoice.id, customerId: invoice.customerId },
    // REAL: });
    //
    // REAL: gatewayOrderId = razorpayOrder.id
    // REAL: checkoutUrl = razorpayOrder.short_url (for checkout UI)
    // ========================================================================

    // WARNING: Using placeholder order ID - payment processing will NOT work in production
    const placeholderOrderId = `ORDER_PLACEHOLDER_${Date.now()}_${invoice.id}`;

    console.warn(
      `[PAYMENT GATEWAY] Creating transaction with PLACEHOLDER order ID: ${placeholderOrderId}. ` +
      `Real payment processing is not configured. See payment.service.ts line 252 for implementation steps.`
    );

    // Create gateway transaction record
    const transaction = await prisma.paymentGatewayTransaction.create({
      data: {
        invoiceId: invoice.id,
        gatewayOrderId: placeholderOrderId,
        amount: input.amount,
        status: PaymentGatewayStatus.INITIATED,
      },
    });

    return {
      transactionId: transaction.id,
      gatewayOrderId: transaction.gatewayOrderId,
      amount: transaction.amount,
      // REAL: checkoutUrl: razorpayOrder.short_url,
    };
  }

  /**
   * Confirm Payment Gateway payment via webhook
   * Phase B of gateway payment flow
   */
  async confirmGatewayPayment(input: ConfirmGatewayPaymentInput) {
    // ========================================================================
    // SECURITY: Webhook Signature Verification
    // ========================================================================
    // This validates that webhook requests actually come from Razorpay and not
    // from a malicious actor attempting to confirm fake payments.
    //
    // If RAZORPAY_WEBHOOK_SECRET is configured, signature verification is ENFORCED.
    // If not configured, a warning is logged but processing continues (DEVELOPMENT MODE ONLY).
    //
    // PRODUCTION REQUIREMENT: RAZORPAY_WEBHOOK_SECRET must be set in production.
    // ========================================================================

    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      // Signature verification is configured - enforce it
      const razorpayClient = await import("../payments/razorpay-client").then(m => m.razorpayClient);
      const isValid = razorpayClient.verifyWebhookSignature({
        signature: input.webhookSignature,
        payload: JSON.stringify(input), // In real implementation, this should be the raw webhook body
      });

      if (!isValid) {
        console.error("[PAYMENT GATEWAY] Invalid webhook signature detected - possible security threat");
        throw new PaymentGatewayError("Invalid webhook signature");
      }

      console.log("[PAYMENT GATEWAY] Webhook signature verified successfully");
    } else {
      // No webhook secret configured - log warning
      console.warn(
        "[PAYMENT GATEWAY] RAZORPAY_WEBHOOK_SECRET not configured - webhook signature NOT verified. " +
        "This is ONLY acceptable in development. MUST be configured in production for security."
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
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
        return null; // Signal that this was already processed
      }

      // Get company settings for account mappings
      const settings = await tx.companySettings.findFirst();
      if (!settings?.debtorsAccountId) {
        throw new ValidationError("Debtors account not configured in company settings");
      }

      // Get Bank journal (gateway payments always go to Bank)
      const bankJournal = await tx.journal.findFirst({
        where: { type: "BANK" },
        include: { defaultAccount: true },
      });

      if (!bankJournal) {
        throw new ValidationError("Bank journal not found");
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

      // Create Journal Entry #2 (Bank Dr / Debtors Cr)
      await journalEntryService.autoGenerate({
        source: JournalEntrySource.INVOICE_PAYMENT,
        journalId: bankJournal.id,
        accountingDate: new Date(),
        sourceDocumentId: payment.id,
        userId: invoice.createdById || "system", // Gateway payments don't have a user context
        lines: [
          {
            accountId: bankJournal.defaultAccountId,
            partnerId: invoice.customerId,
            debit: transaction.amount,
            credit: new Decimal(0),
          },
          {
            accountId: settings.debtorsAccountId,
            partnerId: invoice.customerId,
            debit: new Decimal(0),
            credit: transaction.amount,
          },
        ],
      });

      return payment;
    });

    // If payment is null, it was already processed (idempotency)
    if (!payment) {
      return null;
    }

    // Send confirmation email (outside transaction, don't block on failure)
    try {
      // Fetch full invoice with customer details for email
      const invoiceWithCustomer = await prisma.customerInvoice.findUnique({
        where: { id: payment.invoiceId },
        include: { customer: true },
      });

      if (invoiceWithCustomer) {
        const paymentDate = new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        await emailService.sendPaymentConfirmation(
          invoiceWithCustomer.customer.name,
          invoiceWithCustomer.customer.email,
          invoiceWithCustomer.invoiceNumber,
          invoiceWithCustomer.total.toFixed(2),
          payment.amount.toFixed(2),
          paymentDate,
          invoiceWithCustomer.amountPaid.toFixed(2),
          invoiceWithCustomer.amountDue.toFixed(2),
          invoiceWithCustomer.id
        );

        console.log(`Payment confirmation email sent to ${invoiceWithCustomer.customer.email} for invoice ${invoiceWithCustomer.invoiceNumber}`);
      }
    } catch (emailError) {
      // Log email failure but don't throw - payment is already confirmed
      console.error("Failed to send payment confirmation email:", emailError);
    }

    return payment;
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
