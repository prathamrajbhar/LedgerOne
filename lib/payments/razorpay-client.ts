import Razorpay from "razorpay";
import crypto from "crypto";

export interface CreateRazorpayOrderInput {
  amount: number; // in smallest currency unit (paise for INR)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifyWebhookSignatureInput {
  signature: string;
  payload: string;
}

export class RazorpayClient {
  private client: Razorpay | null = null;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      this.client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
  }

  private getClient(): Razorpay {
    if (!this.client) {
      const keyId = process.env.RAZORPAY_KEY_ID || "dummy_key_id";
      const keySecret = process.env.RAZORPAY_KEY_SECRET || "dummy_key_secret";
      this.client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return this.client;
  }

  async createOrder(input: CreateRazorpayOrderInput) {
    const client = this.getClient();
    const order = await client.orders.create({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });

    return order;
  }

  verifyWebhookSignature(input: VerifyWebhookSignatureInput): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!secret) return false;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(input.payload)
      .digest("hex");

    return expectedSignature === input.signature;
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) return false;

    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    return expectedSignature === signature;
  }

  async fetchPayment(paymentId: string) {
    const client = this.getClient();
    return client.payments.fetch(paymentId);
  }

  async fetchOrder(orderId: string) {
    const client = this.getClient();
    return client.orders.fetch(orderId);
  }
}

export const razorpayClient = new RazorpayClient();
