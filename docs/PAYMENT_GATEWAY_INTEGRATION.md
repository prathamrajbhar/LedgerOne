# Payment Gateway Integration Guide

**Status:** PLACEHOLDER IMPLEMENTATION  
**Gateway:** Razorpay (planned)  
**Last Updated:** 2026-09-05

---

## Current State

The payment gateway integration in LedgerOne is currently **NOT FUNCTIONAL**. The codebase contains placeholder implementations that:

- ✅ Create database records for payment transactions
- ✅ Handle the complete payment flow structure (order creation → webhook → confirmation)
- ✅ Auto-generate journal entries for confirmed payments
- ❌ **DO NOT** actually communicate with Razorpay API
- ❌ **DO NOT** process real payments
- ❌ **DO NOT** verify webhook signatures in production

**Warning:** Do not deploy the current implementation to production expecting payment processing to work. Customers will see payment buttons but payments will fail.

---

## Architecture Overview

### Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ Phase A: Order Creation (Customer Portal)                           │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Customer views invoice in Portal                                 │
│ 2. Customer clicks "Pay Now"                                        │
│ 3. Frontend calls createGatewayOrder()                              │
│ 4. [PLACEHOLDER] Backend creates DB record with fake order ID       │
│ 5. [REAL] Backend should call Razorpay API to create real order     │
│ 6. Backend returns order details to frontend                        │
│ 7. Frontend redirects to Razorpay checkout                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Phase B: Payment Confirmation (Webhook)                             │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Customer completes payment on Razorpay                           │
│ 2. Razorpay sends webhook to /api/webhooks/payment                  │
│ 3. [PLACEHOLDER] Webhook signature check skipped if secret not set  │
│ 4. [REAL] Webhook signature MUST be verified in production          │
│ 5. Backend calls confirmGatewayPayment()                            │
│ 6. Backend updates invoice payment status                           │
│ 7. Backend auto-generates Journal Entry #2                          │
│ 8. Backend sends payment confirmation email to customer             │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Responsibility | Status |
|------|----------------|--------|
| `lib/payments/razorpay-client.ts` | Razorpay API wrapper | ✅ Complete |
| `lib/services/payment.service.ts` | Payment business logic | ⚠️ Placeholder |
| `app/api/webhooks/payment/route.ts` | Webhook endpoint | ⚠️ Placeholder |
| `app/(portal)/invoices/[id]/page.tsx` | Customer invoice view | ✅ Complete |

---

## Implementation Steps

### Prerequisites

1. **Razorpay Account**
   - Sign up at https://razorpay.com/
   - Complete KYC verification (required for live mode)
   - Enable required payment methods (UPI, Cards, NetBanking, etc.)

2. **Razorpay Credentials**
   - Test Mode: `rzp_test_xxxxxxxxxx` (for development)
   - Live Mode: `rzp_live_xxxxxxxxxx` (for production)
   - Webhook Secret: Set up in Razorpay Dashboard → Webhooks

3. **Environment Variables**
   ```bash
   # Add to .env.local (development) and production environment
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_key_secret_here
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

---

### Step 1: Enable Order Creation

**File:** `lib/services/payment.service.ts`  
**Function:** `createGatewayOrder()`  
**Lines:** 252-295

#### Current Code (Placeholder)
```typescript
const placeholderOrderId = `ORDER_PLACEHOLDER_${Date.now()}_${invoice.id}`;

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
};
```

#### Real Implementation
```typescript
// Import Razorpay client at top of file
import { razorpayClient } from "../payments/razorpay-client";

// Inside createGatewayOrder() function:
try {
  // Call Razorpay API to create order
  const razorpayOrder = await razorpayClient.createOrder({
    amount: input.amount.toNumber() * 100, // Convert to paise (smallest unit)
    currency: 'INR',
    receipt: `INV-${invoice.invoiceNumber}`,
    notes: {
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      invoiceNumber: invoice.invoiceNumber,
    },
  });

  // Create gateway transaction record with real order ID
  const transaction = await prisma.paymentGatewayTransaction.create({
    data: {
      invoiceId: invoice.id,
      gatewayOrderId: razorpayOrder.id, // Real Razorpay order ID
      amount: input.amount,
      status: PaymentGatewayStatus.INITIATED,
    },
  });

  return {
    transactionId: transaction.id,
    gatewayOrderId: transaction.gatewayOrderId,
    amount: transaction.amount,
    checkoutUrl: razorpayOrder.short_url, // For hosted checkout
    // OR return these for custom checkout UI:
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: razorpayOrder.id,
  };
} catch (error) {
  console.error("[PAYMENT GATEWAY] Failed to create Razorpay order:", error);
  
  // Provide meaningful error to user
  if (error.error?.code === 'BAD_REQUEST_ERROR') {
    throw new ValidationError("Invalid payment amount or currency");
  } else if (error.error?.code === 'GATEWAY_ERROR') {
    throw new PaymentGatewayError("Payment gateway temporarily unavailable. Please try again.");
  } else {
    throw new PaymentGatewayError("Failed to initiate payment. Please contact support.");
  }
}
```

#### Testing
```bash
# Test with Razorpay test credentials
curl -X POST http://localhost:3000/api/portal/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "invoice-id-here",
    "amount": 1000.00
  }'

# Expected response:
{
  "transactionId": "uuid",
  "gatewayOrderId": "order_xxx", // Real Razorpay order ID
  "amount": 1000.00,
  "checkoutUrl": "https://razorpay.com/checkout/xxx"
}
```

---

### Step 2: Enable Webhook Signature Verification

**File:** `lib/services/payment.service.ts`  
**Function:** `confirmGatewayPayment()`  
**Lines:** 304-335

#### Current Code (Placeholder)
```typescript
if (process.env.RAZORPAY_WEBHOOK_SECRET) {
  // Signature verification is configured - enforce it
  const razorpayClient = await import("../payments/razorpay-client").then(m => m.razorpayClient);
  const isValid = razorpayClient.verifyWebhookSignature({
    signature: input.webhookSignature,
    payload: JSON.stringify(input), // WRONG: should be raw webhook body
  });

  if (!isValid) {
    throw new PaymentGatewayError("Invalid webhook signature");
  }
} else {
  console.warn("[PAYMENT GATEWAY] Webhook signature NOT verified (development mode)");
}
```

#### Real Implementation

**Problem:** The current implementation passes `JSON.stringify(input)` instead of the raw webhook body. Razorpay signature verification requires the **exact raw body** that was sent.

**Fix in `app/api/webhooks/payment/route.ts`:**

```typescript
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    // Get raw body (this is correct - already implemented)
    const payload = await req.text();

    // Verify signature (this is correct - already implemented)
    const isValid = razorpayClient.verifyWebhookSignature({
      signature,
      payload, // Raw body, not JSON
    });

    if (!isValid) {
      console.error("[PAYMENT WEBHOOK] Invalid signature - possible security threat");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(payload);
    // ... rest of webhook processing
  } catch (error) {
    console.error("[PAYMENT WEBHOOK] Processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
```

**Fix in `payment.service.ts`:**

The service method receives `webhookSignature` but doesn't need to verify it again (already done in route handler). However, for defense-in-depth, you can keep the check:

```typescript
async confirmGatewayPayment(input: ConfirmGatewayPaymentInput & { webhookPayload?: string }) {
  // If raw payload is provided, verify signature
  if (input.webhookPayload && process.env.RAZORPAY_WEBHOOK_SECRET) {
    const razorpayClient = await import("../payments/razorpay-client").then(m => m.razorpayClient);
    const isValid = razorpayClient.verifyWebhookSignature({
      signature: input.webhookSignature,
      payload: input.webhookPayload, // Raw payload, not JSON
    });

    if (!isValid) {
      console.error("[PAYMENT GATEWAY] Invalid webhook signature in service layer");
      throw new PaymentGatewayError("Invalid webhook signature");
    }
  }
  
  // ... rest of payment confirmation logic
}
```

#### Testing
```bash
# Configure webhook secret
echo "RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here" >> .env.local

# Restart server
npm run dev

# Test with Razorpay webhook simulator
# OR use ngrok to expose local server for real webhook testing
npx ngrok http 3000
# Configure webhook URL in Razorpay Dashboard:
# https://your-ngrok-url.ngrok.io/api/webhooks/payment
```

---

### Step 3: Remove Fake Payment ID Fallback

**File:** `app/api/webhooks/payment/route.ts`  
**Lines:** 60-72

#### Status: ✅ ALREADY FIXED

The fake payment ID fallback (`|| \`PAY_${Date.now()}\``) has been removed and replaced with validation that rejects webhooks missing a payment ID.

```typescript
if (!paymentId) {
  console.error("[PAYMENT WEBHOOK] Webhook missing payment ID", {
    eventType,
    orderId,
    transactionId: transaction.id,
  });
  return NextResponse.json(
    { error: "Invalid webhook: missing payment ID" },
    { status: 400 }
  );
}
```

**No further action required for this step.**

---

### Step 4: Configure Webhook in Razorpay Dashboard

1. Log in to Razorpay Dashboard
2. Go to Settings → Webhooks
3. Click "Create Webhook"
4. Configure:
   ```
   Webhook URL: https://yourdomain.com/api/webhooks/payment
   Active Events:
     ☑ payment.authorized
     ☑ payment.captured
     ☑ payment.failed
     ☑ order.paid
   Secret: [auto-generated - copy this to RAZORPAY_WEBHOOK_SECRET]
   ```
5. Save webhook
6. Copy secret to environment variables

---

### Step 5: Frontend Integration

**File:** `app/(portal)/invoices/[id]/page.tsx` (or wherever payment button is)

#### Hosted Checkout (Simpler)
```typescript
async function handlePayment() {
  const response = await fetch('/api/portal/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceId: invoice.id,
      amount: invoice.amountDue,
    }),
  });

  const { checkoutUrl } = await response.json();
  
  // Redirect to Razorpay hosted checkout
  window.location.href = checkoutUrl;
}
```

#### Custom Checkout (More Control)
```typescript
async function handlePayment() {
  const response = await fetch('/api/portal/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      invoiceId: invoice.id,
      amount: invoice.amountDue,
    }),
  });

  const { orderId, keyId, amount } = await response.json();

  // Initialize Razorpay checkout
  const options = {
    key: keyId,
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    order_id: orderId,
    name: 'LedgerOne',
    description: `Payment for Invoice ${invoice.invoiceNumber}`,
    handler: function (response) {
      // Payment successful - webhook will handle confirmation
      // Show success message and redirect
      alert('Payment successful! You will receive a confirmation email.');
      window.location.href = `/portal/invoices/${invoice.id}`;
    },
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
    theme: {
      color: '#3B82F6',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
```

**Note:** Add Razorpay script to `app/layout.tsx`:
```tsx
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## Security Considerations

### Critical Security Rules

1. **Never Trust Client-Side Payment Confirmation**
   - The Razorpay checkout redirects users back to your site after payment
   - This redirect can be faked by a malicious user
   - **ALWAYS** wait for webhook confirmation before marking payment as successful
   - The webhook is the single source of truth

2. **Always Verify Webhook Signatures**
   - Webhook signature verification is **MANDATORY** in production
   - Without it, anyone can send fake webhook requests to confirm fake payments
   - Use `razorpayClient.verifyWebhookSignature()` on every webhook

3. **Implement Idempotency**
   - ✅ Already implemented: checks `transaction.gatewayPaymentId` before processing
   - Prevents duplicate payment records if webhook is delivered multiple times
   - Razorpay may send the same webhook multiple times for reliability

4. **Validate Payment Amounts**
   - ✅ Already implemented: validates payment amount doesn't exceed invoice due
   - Prevents overpayment attacks
   - Always check against database, never trust client input

5. **Use HTTPS Only**
   - Webhooks must be delivered over HTTPS
   - Razorpay will reject HTTP webhook URLs in production

6. **Secure Webhook Endpoint**
   - The webhook endpoint is **public** (no authentication)
   - This is intentional - Razorpay can't send auth tokens
   - Security comes from signature verification, not endpoint protection

7. **Rotate Secrets Regularly**
   - Rotate `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` periodically
   - Especially after any security incident or team member departure

8. **Log All Payment Events**
   - ✅ Already implemented: console logs for all payment operations
   - In production, use proper logging service (Sentry, LogRocket, etc.)
   - Log signature verification failures - they indicate attacks

### Environment Variable Security

```bash
# Development (.env.local)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=test_webhook_secret_xxxxxxxxxxxx

# Production (secure environment variables, never commit)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=live_secret_xxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=live_webhook_secret_xxxxxxxxxxxx
```

**Never:**
- Commit secrets to git (use `.env.example` with placeholder values)
- Expose secrets in client-side code
- Log secrets in console/logs
- Share production secrets via insecure channels (email, Slack, etc.)

---

## Testing Checklist

### Development Testing (Test Mode)

- [ ] **Environment Setup**
  - [ ] `RAZORPAY_KEY_ID` set to test key (`rzp_test_xxx`)
  - [ ] `RAZORPAY_KEY_SECRET` set to test secret
  - [ ] `RAZORPAY_WEBHOOK_SECRET` set to test webhook secret
  - [ ] Webhook URL configured in Razorpay Dashboard (use ngrok for local testing)

- [ ] **Order Creation**
  - [ ] Create payment order returns real Razorpay order ID (starts with `order_`)
  - [ ] Order ID is stored in `PaymentGatewayTransaction` table
  - [ ] Order amount matches invoice due amount
  - [ ] Transaction status is `INITIATED`
  - [ ] Customer can only create orders for their own invoices

- [ ] **Payment Flow**
  - [ ] Razorpay checkout loads correctly
  - [ ] Test payment with Razorpay test cards (see Razorpay docs)
  - [ ] Payment success redirects back to portal
  - [ ] Webhook is received within 5 seconds

- [ ] **Webhook Processing**
  - [ ] Webhook signature is verified successfully
  - [ ] Payment ID is extracted from webhook payload
  - [ ] Transaction status is updated to `SUCCESS`
  - [ ] Invoice `amountPaid` and `amountDue` are updated correctly
  - [ ] Invoice `paymentStatus` is updated correctly (NOT_PAID → PARTIAL → PAID)
  - [ ] `InvoicePayment` record is created with `source=GATEWAY`
  - [ ] Journal Entry #2 is auto-generated (Bank Dr / Debtors Cr)
  - [ ] Payment confirmation email is sent to customer

- [ ] **Idempotency**
  - [ ] Sending same webhook twice doesn't create duplicate payments
  - [ ] Second webhook returns 200 but doesn't process payment again

- [ ] **Error Handling**
  - [ ] Invalid webhook signature is rejected (400 error)
  - [ ] Missing payment ID is rejected (400 error)
  - [ ] Transaction not found returns appropriate error
  - [ ] Payment amount exceeding due amount is rejected
  - [ ] Razorpay API errors are handled gracefully

### Production Testing (Live Mode)

⚠️ **IMPORTANT:** Test thoroughly in test mode before deploying to production.

- [ ] **Pre-Deployment**
  - [ ] All development tests pass
  - [ ] Code reviewed by at least two team members
  - [ ] Security audit completed
  - [ ] Razorpay account KYC verified
  - [ ] Production credentials configured in secure environment
  - [ ] Webhook URL uses HTTPS
  - [ ] Monitoring and alerting configured

- [ ] **Deployment**
  - [ ] Deploy to staging first
  - [ ] Test complete flow in staging with test credentials
  - [ ] Update environment variables to production credentials
  - [ ] Deploy to production

- [ ] **Post-Deployment**
  - [ ] Create test payment with real (small amount) transaction
  - [ ] Verify payment is processed correctly
  - [ ] Verify webhook is received and processed
  - [ ] Verify journal entries are created correctly
  - [ ] Verify email confirmation is sent
  - [ ] Monitor logs for any errors
  - [ ] Test with multiple payment methods (UPI, Card, NetBanking)

- [ ] **Ongoing Monitoring**
  - [ ] Set up alerts for webhook signature failures
  - [ ] Set up alerts for payment processing errors
  - [ ] Monitor payment success rate
  - [ ] Reconcile Razorpay reports with database daily

---

## Troubleshooting

### Order Creation Fails

**Symptom:** `createGatewayOrder()` throws error

**Common Causes:**
1. **Invalid credentials:** Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
2. **Wrong environment:** Using live keys in test mode or vice versa
3. **Network error:** Check internet connectivity
4. **Amount validation:** Razorpay requires amount in smallest currency unit (paise)

**Solution:**
```bash
# Verify credentials
echo $RAZORPAY_KEY_ID
# Should start with rzp_test_ (dev) or rzp_live_ (prod)

# Test Razorpay API directly
curl -u rzp_test_xxx:test_secret_xxx \
  -X POST https://api.razorpay.com/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"currency":"INR","receipt":"test"}'
```

### Webhook Not Received

**Symptom:** Payment completes but invoice not updated

**Common Causes:**
1. **Webhook URL not configured in Razorpay Dashboard**
2. **Webhook URL is HTTP instead of HTTPS**
3. **Firewall blocking incoming webhooks**
4. **Webhook URL is localhost (not reachable from internet)**

**Solution:**
```bash
# For local testing, use ngrok
npx ngrok http 3000

# Configure webhook URL in Razorpay Dashboard:
# https://your-id.ngrok.io/api/webhooks/payment

# Check webhook logs in Razorpay Dashboard
# Settings → Webhooks → [Your Webhook] → Logs
```

### Webhook Signature Verification Fails

**Symptom:** Webhook returns 400 "Invalid webhook signature"

**Common Causes:**
1. **Wrong `RAZORPAY_WEBHOOK_SECRET`:** Doesn't match Razorpay Dashboard
2. **Payload modification:** Request body was modified before verification
3. **Wrong signature extraction:** Using wrong header name

**Solution:**
```bash
# Verify webhook secret matches Razorpay Dashboard
# Settings → Webhooks → [Your Webhook] → Show Secret

# Update .env
RAZORPAY_WEBHOOK_SECRET=correct_secret_from_dashboard

# Restart server
npm run dev
```

### Payment Processed But Journal Entry Not Created

**Symptom:** Payment status updated but no accounting entry

**Common Causes:**
1. **Bank journal not configured:** `type=BANK` journal doesn't exist
2. **Debtors account not configured:** `debtorsAccountId` not set in company settings
3. **Transaction failed silently:** Check server logs

**Solution:**
```bash
# Verify company settings
npm run db:studio
# Check CompanySettings table → debtorsAccountId is set

# Verify Bank journal exists
# Check Journal table → at least one with type=BANK

# Check server logs for errors
# Look for "Journal Entry creation failed" messages
```

### Duplicate Payments Created

**Symptom:** Same payment processed twice

**Common Causes:**
1. **Idempotency check not working:** `gatewayPaymentId` comparison failing
2. **Webhook sent multiple times by Razorpay**
3. **Race condition:** Multiple webhooks processed simultaneously

**Solution:**
- ✅ Already implemented: idempotency check in `confirmGatewayPayment()`
- Check logs to confirm second webhook returns early without creating payment
- If duplicates still occur, add database unique constraint on `gatewayPaymentId`

---

## Migration Plan

When ready to deploy real integration:

### Phase 1: Code Changes
1. ✅ Update `createGatewayOrder()` with real Razorpay API call
2. ✅ Update `confirmGatewayPayment()` with proper signature verification
3. ✅ Remove all placeholder logs and warnings
4. Run full test suite
5. Code review

### Phase 2: Configuration
1. Configure Razorpay webhook in Dashboard
2. Set production environment variables
3. Test in staging environment
4. Verify all security measures

### Phase 3: Deployment
1. Deploy to production
2. Test with small real payment
3. Monitor for 24 hours
4. Enable for all customers

### Phase 4: Monitoring
1. Set up payment success rate monitoring
2. Set up webhook failure alerting
3. Daily reconciliation with Razorpay reports
4. Monthly security audit

---

## Reference Links

- [Razorpay Orders API](https://razorpay.com/docs/api/orders/)
- [Razorpay Webhooks](https://razorpay.com/docs/webhooks/)
- [Razorpay Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
- [Razorpay Signature Verification](https://razorpay.com/docs/webhooks/validate-test/)

---

## Support

For issues with this integration:
1. Check troubleshooting section above
2. Review Razorpay documentation
3. Check Razorpay webhook logs in Dashboard
4. Contact team lead or open GitHub issue
5. For Razorpay-specific issues, contact Razorpay support

---

**Last Updated:** 2026-09-05  
**Maintained By:** LedgerOne Backend Team  
**Review Cycle:** Monthly or after any security incident
