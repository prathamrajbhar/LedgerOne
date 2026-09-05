"use server";

import { revalidatePath } from "next/cache";
import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { paymentService } from "@/lib/services/payment.service";
import { PaymentMethod, PaymentGatewayStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import { razorpayClient } from "@/lib/payments/razorpay-client";

export interface PortalPaymentResult {
  success: boolean;
  error?: string;
}

export interface CreateRazorpayOrderResult {
  success: boolean;
  error?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  customerName?: string;
  customerEmail?: string;
  invoiceNumber?: string;
}

/**
 * Creates an authorized Razorpay order for online checkout
 */
export async function createPortalRazorpayOrderAction(input: {
  invoiceId: string;
  amount: number;
}): Promise<CreateRazorpayOrderResult> {
  try {
    const portalSession = await requireCustomerAccess();

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: input.invoiceId },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
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

    const keyId = process.env.RAZORPAY_KEY_ID || "";
    if (!keyId) {
      return { success: false, error: "Razorpay gateway key is not configured" };
    }

    // Call payment service to initialize transaction & Razorpay order
    const onlinePaymentInit = await paymentService.createGatewayOrder({
      invoiceId: invoice.id,
      amount: new Decimal(input.amount),
      contactId: portalSession.contactId,
    });

    return {
      success: true,
      orderId: onlinePaymentInit.gatewayOrderId,
      amount: Math.round(input.amount * 100), // In paise
      currency: "INR",
      keyId,
      customerName: invoice.customer?.name || portalSession.contactName,
      customerEmail: invoice.customer?.email || "",
      invoiceNumber: invoice.invoiceNumber,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to initiate Razorpay order";
    return { success: false, error: message };
  }
}

/**
 * Verifies Razorpay payment signature & confirms double-entry journal entry
 */
export async function verifyPortalRazorpayPaymentAction(input: {
  invoiceId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  amount: number;
}): Promise<PortalPaymentResult> {
  try {
    const portalSession = await requireCustomerAccess();

    // Verify HMAC-SHA256 signature
    const isValid = razorpayClient.verifyPaymentSignature(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature
    );

    if (!isValid) {
      return { success: false, error: "Invalid Razorpay payment signature" };
    }

    // Find the transaction record
    const transaction = await prisma.paymentGatewayTransaction.findFirst({
      where: {
        invoiceId: input.invoiceId,
        gatewayOrderId: input.razorpayOrderId,
      },
    });

    if (!transaction) {
      return { success: false, error: "Payment transaction record not found" };
    }

    // Confirm gateway payment and generate double-entry voucher
    await paymentService.confirmGatewayPayment({
      gatewayTransactionId: transaction.id,
      gatewayPaymentId: input.razorpayPaymentId,
      paymentMethod: "UPI_NETBANKING",
      webhookSignature: `rzp_sig_verified_${input.razorpaySignature}`,
    });

    revalidatePath("/portal/invoices");
    revalidatePath("/portal/dashboard");
    revalidatePath("/portal/payments");
    revalidatePath(`/portal/invoices/${input.invoiceId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return { success: false, error: message };
  }
}

/**
 * Standard offline / direct payment processing
 */
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
    revalidatePath("/portal/payments");
    revalidatePath(`/portal/invoices/${input.invoiceId}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to process payment";
    return { success: false, error: message };
  }
}
