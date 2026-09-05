import { NextRequest, NextResponse } from "next/server";
import { razorpayClient } from "@/lib/payments/razorpay-client";
import { paymentService } from "@/lib/services/payment.service";
import { PrismaClient, PaymentGatewayStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const payload = await req.text();

    const isValid = razorpayClient.verifyWebhookSignature({
      signature,
      payload,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(payload);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "order.paid" || eventType === "payment.authorized") {
      const paymentEntity = event.payload?.payment?.entity || event.payload?.order?.entity;
      const orderId = paymentEntity?.order_id || paymentEntity?.id;
      const paymentId = paymentEntity?.id || event.payload?.payment?.entity?.id;
      const paymentMethod = paymentEntity?.method || "GATEWAY";

      if (!orderId) {
        return NextResponse.json({ status: "ignored", reason: "No order_id found" }, { status: 200 });
      }

      // Find gateway transaction by orderId or invoiceId in notes
      let transaction = await prisma.paymentGatewayTransaction.findFirst({
        where: {
          OR: [
            { gatewayOrderId: orderId },
            { id: orderId },
          ],
        },
      });

      const invoiceIdFromNotes = paymentEntity?.notes?.invoiceId;
      if (!transaction && invoiceIdFromNotes) {
        transaction = await prisma.paymentGatewayTransaction.findFirst({
          where: {
            invoiceId: invoiceIdFromNotes,
            status: PaymentGatewayStatus.INITIATED,
          },
        });
      }

      if (transaction) {
        // ========================================================================
        // VALIDATION: Payment ID must be present in webhook
        // ========================================================================
        // The payment ID is the unique identifier from Razorpay for this payment.
        // Without it, we cannot:
        // - Ensure idempotency (prevent duplicate processing)
        // - Track the payment in Razorpay's system
        // - Reconcile with Razorpay reports
        //
        // A missing payment ID indicates either:
        // 1. Malformed webhook from Razorpay (should not happen)
        // 2. Fake/malicious webhook attempt
        // 3. Integration bug in how we're parsing the webhook
        // ========================================================================

        if (!paymentId) {
          console.error(
            "[PAYMENT WEBHOOK] Webhook missing payment ID. This is a critical error.",
            {
              eventType,
              orderId,
              transactionId: transaction.id,
              payloadKeys: Object.keys(event.payload || {}),
            }
          );
          return NextResponse.json(
            {
              error: "Invalid webhook: missing payment ID",
              detail: "Payment ID is required for processing"
            },
            { status: 400 }
          );
        }

        await paymentService.confirmGatewayPayment({
          gatewayTransactionId: transaction.id,
          gatewayPaymentId: paymentId,
          paymentMethod,
          webhookSignature: signature,
        });

        return NextResponse.json({
          status: "success",
          transactionId: transaction.id,
        }, { status: 200 });
      }
    }

    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
