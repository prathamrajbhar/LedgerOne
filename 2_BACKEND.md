# Backend Developer #2 - Implementation Tasks

**Branch Prefix:** `backend2/`  
**Total Tasks:** 12  
**Estimated Time:** 2-3 weeks

---

## ⚠️ Critical Rules (See [GITHUB_RULES.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/GITHUB_RULES.md))

1. **One Task → One Commit → One PR** - Complete a task, test it, commit immediately, open PR, get it merged, THEN move to next task
2. **Never batch multiple tasks** - Each task is a separate commit with proper convention
3. **Branch per task** - `backend2/sales-order-service`, `backend2/razorpay-integration`, etc.
4. **Test before commit** - Run `npm run lint && npm run type-check && npm run test`
5. **Merge before next** - Task N+1 only starts after Task N is merged to main
6. **Follow GitHub Rules** - Adhere strictly to the branch workflows and conventions defined in [GITHUB_RULES.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/GITHUB_RULES.md)

---

## Phase 1: Sales Module (Tasks 1-2)

### Task 1: Sales Order Service

**File:** `lib/services/sales-order.service.ts`

**What to Build:**
```typescript
import { PrismaClient, SalesOrderStatus, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateSalesOrderInput {
  customerId: string;
  orderDate: Date;
  deliveryDate?: Date;
  lines: {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRateId?: string;
  }[];
  notes?: string;
}

export interface UpdateSalesOrderInput {
  id: string;
  customerId?: string;
  orderDate?: Date;
  deliveryDate?: Date;
  lines?: {
    productId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRateId?: string;
  }[];
  notes?: string;
}

export interface ConfirmSalesOrderInput {
  id: string;
}

export interface ListSalesOrdersParams {
  customerId?: string;
  status?: SalesOrderStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export class SalesOrderService {
  async create(input: CreateSalesOrderInput) {
    // Validate
    if (!input.customerId) {
      throw new ValidationError("Customer is required");
    }
    if (!input.lines || input.lines.length === 0) {
      throw new ValidationError("At least one line item is required");
    }

    // Verify customer exists
    const customer = await prisma.contact.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.type !== "CUSTOMER") {
      throw new ValidationError("Selected contact is not a customer");
    }

    // Verify all products exist
    const productIds = input.lines.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ValidationError("One or more products not found");
    }

    // Calculate totals
    let subtotal = new Prisma.Decimal(0);
    let totalTax = new Prisma.Decimal(0);

    const linesWithTotals = await Promise.all(
      input.lines.map(async (line) => {
        const lineSubtotal = new Prisma.Decimal(line.quantity).mul(line.unitPrice);
        let lineTax = new Prisma.Decimal(0);

        if (line.taxRateId) {
          const taxRate = await prisma.taxRate.findUnique({
            where: { id: line.taxRateId },
          });
          if (taxRate) {
            lineTax = lineSubtotal.mul(taxRate.percentage).div(100);
          }
        }

        subtotal = subtotal.add(lineSubtotal);
        totalTax = totalTax.add(lineTax);

        return {
          productId: line.productId,
          description: line.description,
          quantity: line.quantity,
          unitPrice: new Prisma.Decimal(line.unitPrice),
          taxRateId: line.taxRateId,
          subtotal: lineSubtotal,
          taxAmount: lineTax,
          total: lineSubtotal.add(lineTax),
        };
      })
    );

    const total = subtotal.add(totalTax);

    // Generate SO number
    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.salesOrderPrefix || "SO";
    const lastSO = await prisma.salesOrder.findFirst({
      orderBy: { soNumber: "desc" },
    });
    const lastNumber = lastSO ? parseInt(lastSO.soNumber.replace(prefix, "")) : 0;
    const soNumber = `${prefix}${String(lastNumber + 1).padStart(5, "0")}`;

    // Create order
    const salesOrder = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: input.customerId,
        orderDate: input.orderDate,
        deliveryDate: input.deliveryDate,
        subtotal,
        totalTax,
        total,
        status: "DRAFT",
        notes: input.notes,
        lines: {
          create: linesWithTotals,
        },
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
          },
        },
      },
    });

    return salesOrder;
  }

  async update(input: UpdateSalesOrderInput) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: input.id },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status !== "DRAFT") {
      throw new ConflictError("Only draft sales orders can be updated");
    }

    // If updating lines, recalculate totals
    if (input.lines) {
      let subtotal = new Prisma.Decimal(0);
      let totalTax = new Prisma.Decimal(0);

      const linesWithTotals = await Promise.all(
        input.lines.map(async (line) => {
          const lineSubtotal = new Prisma.Decimal(line.quantity).mul(line.unitPrice);
          let lineTax = new Prisma.Decimal(0);

          if (line.taxRateId) {
            const taxRate = await prisma.taxRate.findUnique({
              where: { id: line.taxRateId },
            });
            if (taxRate) {
              lineTax = lineSubtotal.mul(taxRate.percentage).div(100);
            }
          }

          subtotal = subtotal.add(lineSubtotal);
          totalTax = totalTax.add(lineTax);

          return {
            productId: line.productId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: new Prisma.Decimal(line.unitPrice),
            taxRateId: line.taxRateId,
            subtotal: lineSubtotal,
            taxAmount: lineTax,
            total: lineSubtotal.add(lineTax),
          };
        })
      );

      const total = subtotal.add(totalTax);

      // Delete old lines and create new ones
      const updated = await prisma.$transaction(async (tx) => {
        await tx.salesOrderLine.deleteMany({
          where: { salesOrderId: input.id },
        });

        return tx.salesOrder.update({
          where: { id: input.id },
          data: {
            customerId: input.customerId,
            orderDate: input.orderDate,
            deliveryDate: input.deliveryDate,
            subtotal,
            totalTax,
            total,
            notes: input.notes,
            lines: {
              create: linesWithTotals,
            },
          },
          include: {
            customer: true,
            lines: {
              include: {
                product: true,
                taxRate: true,
              },
            },
          },
        });
      });

      return updated;
    }

    // Simple update (no line changes)
    const updated = await prisma.salesOrder.update({
      where: { id: input.id },
      data: {
        customerId: input.customerId,
        orderDate: input.orderDate,
        deliveryDate: input.deliveryDate,
        notes: input.notes,
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
          },
        },
      },
    });

    return updated;
  }

  async confirm(input: ConfirmSalesOrderInput) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id: input.id },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status !== "DRAFT") {
      throw new ConflictError("Only draft sales orders can be confirmed");
    }

    return prisma.salesOrder.update({
      where: { id: input.id },
      data: { status: "CONFIRMED" },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
          },
        },
      },
    });
  }

  async cancel(id: string) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    if (salesOrder.status === "CANCELLED") {
      throw new ConflictError("Sales order is already cancelled");
    }

    return prisma.salesOrder.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }

  async findById(id: string) {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
            taxRate: true,
          },
        },
      },
    });

    if (!salesOrder) {
      throw new NotFoundError("Sales order not found");
    }

    return salesOrder;
  }

  async list(params: ListSalesOrdersParams) {
    const { customerId, status, startDate, endDate, page = 1, limit = 20 } = params;

    const where: Prisma.SalesOrderWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(startDate && { orderDate: { gte: startDate } }),
      ...(endDate && { orderDate: { lte: endDate } }),
    };

    const [salesOrders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
          lines: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { orderDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.salesOrder.count({ where }),
    ]);

    return {
      data: salesOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const salesOrderService = new SalesOrderService();
```

**Commit:**
```bash
git checkout -b backend2/sales-order-service
git add lib/services/sales-order.service.ts
git commit -m "feat(sales): add sales order management service

- Create, update, confirm, cancel sales orders
- Auto-generate SO numbers
- Calculate line totals with tax
- Validate customer and products
- List with filters (customer, status, date range)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Customer Invoice Service

**File:** `lib/services/customer-invoice.service.ts`

**Implementation:**
- Create invoice from Sales Order
- Create standalone invoice
- Confirm invoice → generates Journal Entry #1
- Update only in DRAFT status
- Cancel invoice
- Calculate payment status from InvoicePayment records
- List with filters

**Key Business Rules:**
- Confirming creates journal entry (Debit: Accounts Receivable, Credit: Income Account)
- Payment status computed from linked InvoicePayment records
- Can be paid via Portal (Razorpay) or manual recording

**Commit Convention:**
```bash
git commit -m "feat(sales): add customer invoice service with journal entry generation

- Create invoice from sales order or standalone
- Generate balanced journal entry on confirmation
- Auto-compute payment status (NOT_PAID, PARTIAL, PAID)
- Link to sales order and payment records

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Payment Gateway Integration (Task 3)

### Task 3: Razorpay Client

**File:** `lib/payments/razorpay-client.ts`

**What to Build:**
```typescript
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
  private client: Razorpay;

  constructor() {
    this.client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(input: CreateRazorpayOrderInput) {
    const order = await this.client.orders.create({
      amount: input.amount,
      currency: input.currency,
      receipt: input.receipt,
      notes: input.notes,
    });

    return order;
  }

  verifyWebhookSignature(input: VerifyWebhookSignatureInput): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(input.payload)
      .digest("hex");

    return expectedSignature === input.signature;
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    return expectedSignature === signature;
  }

  async fetchPayment(paymentId: string) {
    return this.client.payments.fetch(paymentId);
  }

  async fetchOrder(orderId: string) {
    return this.client.orders.fetch(orderId);
  }
}

export const razorpayClient = new RazorpayClient();
```

**Commit:**
```bash
git checkout -b backend2/razorpay-integration
git add lib/payments/razorpay-client.ts
git commit -m "feat(payments): add Razorpay payment gateway client

- Create payment orders
- Verify webhook signatures
- Verify payment signatures
- Fetch payment and order details

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: Document Generation (Task 4)

### Task 4: PDF Generation Service

**File:** `lib/pdf/invoice-pdf.ts`

**What to Build:**
```typescript
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { CustomerInvoice, Contact, CustomerInvoiceLine, Product } from "@prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCol: {
    padding: 5,
    borderRightWidth: 1,
    borderColor: "#000",
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#000",
  },
});

interface InvoiceWithRelations extends CustomerInvoice {
  customer: Contact;
  lines: (CustomerInvoiceLine & { product: Product })[];
}

export const generateInvoicePDF = async (invoice: InvoiceWithRelations) => {
  const InvoiceDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text>Invoice #: {invoice.invoiceNumber}</Text>
          <Text>Date: {invoice.invoiceDate.toLocaleDateString()}</Text>
          <Text>Due Date: {invoice.dueDate.toLocaleDateString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={{ fontWeight: "bold" }}>Bill To:</Text>
          <Text>{invoice.customer.name}</Text>
          <Text>{invoice.customer.email}</Text>
          <Text>{invoice.customer.phone}</Text>
          {invoice.customer.address && <Text>{invoice.customer.address}</Text>}
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, { width: "40%" }]}>
              <Text>Product</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Quantity</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Unit Price</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Tax</Text>
            </View>
            <View style={[styles.tableCol, { width: "15%" }]}>
              <Text>Total</Text>
            </View>
          </View>

          {invoice.lines.map((line, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "40%" }]}>
                <Text>{line.description}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.quantity}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.unitPrice.toString()}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.taxAmount.toString()}</Text>
              </View>
              <View style={[styles.tableCol, { width: "15%" }]}>
                <Text>{line.total.toString()}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Subtotal: {invoice.subtotal.toString()}</Text>
          <Text>Tax: {invoice.totalTax.toString()}</Text>
          <Text style={{ fontWeight: "bold", fontSize: 12 }}>
            Total: {invoice.total.toString()}
          </Text>
          <Text>Amount Paid: {invoice.amountPaid.toString()}</Text>
          <Text style={{ fontWeight: "bold" }}>
            Amount Due: {invoice.amountDue.toString()}
          </Text>
        </View>

        {invoice.notes && (
          <View style={styles.section}>
            <Text style={{ fontWeight: "bold" }}>Notes:</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );

  const blob = await pdf(InvoiceDocument).toBlob();
  return blob;
};
```

**Also create:** `lib/pdf/bill-pdf.ts` (similar structure for vendor bills)

**Commit:**
```bash
git checkout -b backend2/pdf-generation
git add lib/pdf/
git commit -m "feat(pdf): add PDF generation for invoices and bills

- Generate customer invoice PDFs with @react-pdf/renderer
- Generate vendor bill PDFs
- Structured layout with company header, line items, totals

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: AI Assistant (Task 5)

### Task 5: Help Assistant Chatbot

**File:** `lib/chatbot/help-assistant.ts`

**What to Build:**
```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FAQ_CONTEXT = `
You are the LedgerOne Help Assistant. You help users understand how to use the accounting system.

Key Features:
1. Purchase Cycle: Create Purchase Orders → Vendor Bills → Record Payments
2. Sales Cycle: Create Sales Orders → Customer Invoices → Receive Payments
3. Journal Entries: Auto-generated from transactions, or create manual entries
4. Budgets: Set budget targets, track achievement in real-time
5. Reports: Balance Sheet, P&L, Budget Reports

Common Questions:
- "How do I create a vendor bill?" → Go to Purchase > Vendor Bills > New Bill
- "How do I record a payment?" → Open the bill/invoice and click "Record Payment"
- "Why is my journal entry not posting?" → Check that Debit = Credit
- "How do customers pay invoices?" → They log into the Portal and pay via Razorpay

IMPORTANT: You NEVER access financial data. You only provide guidance on using the product.
`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatInput {
  messages: ChatMessage[];
}

export class HelpAssistantService {
  async chat(input: ChatInput) {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: FAQ_CONTEXT,
      messages: input.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const assistantMessage = response.content[0];
    if (assistantMessage.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return {
      role: "assistant" as const,
      content: assistantMessage.text,
    };
  }
}

export const helpAssistantService = new HelpAssistantService();
```

**Commit:**
```bash
git checkout -b backend2/help-assistant
git add lib/chatbot/
git commit -m "feat(chatbot): add help assistant with Anthropic Claude API

- FAQ-based product guidance chatbot
- Session-based conversation history
- Isolated from financial data (read-only guidance only)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Reporting (Task 6)

### Task 6: Profit & Loss Report Service

**File:** `lib/services/reports/profit-loss.service.ts`

**Implementation:**
- Aggregate Journal Entry Lines by Income and Expense accounts
- Calculate total income
- Calculate total expenses
- Net Profit = Income - Expenses
- Filter by date range
- Group by account for drill-down

**Commit:**
```bash
git commit -m "feat(reporting): add profit and loss report service

- Calculate total income from sales journal entries
- Calculate total expenses from purchase journal entries
- Compute net profit (income - expenses)
- Filter by date range

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 6: File Storage (Task 7)

### Task 7: S3 File Upload Service

**File:** `lib/storage/s3-client.ts`

**Implementation:**
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET!;
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.client.send(command);

    return {
      key,
      url: `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }

  async getSignedDownloadUrl(key: string, expiresIn: number = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn });
  }
}

export const s3Service = new S3Service();
```

**Commit:**
```bash
git commit -m "feat(storage): add S3 file upload service

- Upload files to AWS S3
- Generate signed download URLs
- Support for invoice PDFs and attachments

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 7: API Routes (Tasks 8-9)

### Task 8: Payment Gateway Webhook Handler

**File:** `app/api/webhooks/payment/route.ts`

**Implementation:**
```typescript
import { NextRequest, NextResponse } from "next/server";
import { razorpayClient } from "@/lib/payments/razorpay-client";
import { paymentService } from "@/lib/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = razorpayClient.verifyWebhookSignature({
      signature,
      payload: body,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const event = payload.event;

    // Handle payment.captured event
    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;

      await paymentService.confirmGatewayPayment({
        gatewayPaymentId: payment.id,
        gatewayOrderId: payment.order_id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        status: payment.status,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
```

**Commit:**
```bash
git checkout -b backend2/payment-webhook
git add app/api/webhooks/
git commit -m "feat(payments): add Razorpay webhook handler for payment confirmation

- Verify webhook signatures
- Handle payment.captured events
- Idempotent payment processing
- Auto-create payment records and journal entries

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Server Actions

**Files:** 
- `app/actions/purchase.actions.ts`
- `app/actions/sales.actions.ts`
- `app/actions/accounting.actions.ts`

**Implementation:**
Server Actions for creating/updating Purchase Orders, Vendor Bills, Sales Orders, Customer Invoices, Journal Entries. Each action:
- Validates inputs with Zod
- Checks authentication and authorization
- Calls appropriate service
- Returns success/error response

**Commit:**
```bash
git checkout -b backend2/server-actions
git add app/actions/
git commit -m "feat(actions): add server actions for purchase, sales, and accounting

- Purchase order and vendor bill actions
- Sales order and customer invoice actions
- Journal entry actions
- Input validation with Zod
- Role-based authorization

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 8: Testing (Tasks 10-12)

### Task 10: Sales Module Unit Tests

**File:** `lib/services/__tests__/sales-order.service.test.ts`

**File:** `lib/services/__tests__/customer-invoice.service.test.ts`

**Test Coverage:**
- Sales order creation and confirmation
- Line item total calculations
- Payment status computation
- Invoice journal entry generation

**Commit:**
```bash
git commit -m "test(sales): add unit tests for sales order and invoice services

- Test sales order creation and line calculations
- Test invoice journal entry generation
- Test payment status computation
- 80%+ coverage achieved

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 11: Payment Gateway Tests

**File:** `lib/services/__tests__/payment.service.test.ts`

**Test Coverage:**
- Gateway order creation
- Webhook signature verification
- Idempotency checks
- Payment recording and journal entry

**Commit:**
```bash
git commit -m "test(payments): add unit tests for payment gateway integration

- Test Razorpay order creation
- Test webhook signature verification
- Test idempotency (duplicate payment rejection)
- Test journal entry generation on payment

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 12: E2E API Tests

**File:** `e2e/api/sales-flow.spec.ts`

**Test Scenarios:**
- Complete sales flow: SO → Invoice → Payment
- Portal payment via gateway webhook
- Invoice PDF generation

**Commit:**
```bash
git commit -m "test(e2e): add end-to-end tests for sales and payment flows

- Test complete sales cycle (SO to payment)
- Test portal payment with webhook
- Test PDF generation

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

**Your Task Completion Order:**
1. Sales Order Service
2. Customer Invoice Service
3. Razorpay Client
4. PDF Generation
5. Help Assistant
6. P&L Report
7. S3 File Upload
8. Payment Webhook Handler
9. Server Actions
10. Sales Module Tests
11. Payment Gateway Tests
12. E2E API Tests

**Your Workflow:**
1. Pull latest main
2. Create branch: `git checkout -b backend2/<task-name>`
3. Implement the task
4. Test: `npm run lint && npm run type-check`
5. Commit with proper convention
6. Push and open PR
7. Wait for merge
8. Repeat

**Never skip ahead. One task at a time. Commit immediately after each.**

---

**Questions?** Check CLAUDE.md for detailed guidelines.
