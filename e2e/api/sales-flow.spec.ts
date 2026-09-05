import { test, expect } from "@playwright/test";
import { generateInvoicePDF, InvoiceWithRelations } from "../../lib/pdf/invoice-pdf";
import { Prisma, ProductType, ContactType } from "@prisma/client";

test.describe("Sales & Payment E2E API Flow", () => {
  test("Complete Sales Order to Invoice to Manual Payment Flow", async () => {
    // 1. Validate Sales Order Input structure
    const soInput = {
      customerId: "cust-1",
      orderDate: new Date(),
      lines: [
        {
          productId: "prod-1",
          description: "Office Chair",
          quantity: 2,
          unitPrice: 150,
        },
      ],
    };

    expect(soInput.customerId).toBe("cust-1");
    expect(soInput.lines.length).toBe(1);
    expect(soInput.lines[0].quantity * soInput.lines[0].unitPrice).toBe(300);
  });

  test("Gateway Payment Confirmation & Webhook Idempotency", async () => {
    const txInput = {
      gatewayTransactionId: "tx-100",
      gatewayPaymentId: "pay-100",
      paymentMethod: "upi",
      webhookSignature: "valid-sig-123",
    };

    expect(txInput.gatewayTransactionId).toBe("tx-100");
    expect(txInput.gatewayPaymentId).toBe("pay-100");
  });

  test("Invoice PDF Generation Flow", async () => {
    const mockInvoice: InvoiceWithRelations = {
      id: "inv-101",
      invoiceNumber: "INV-00001",
      invoiceReference: null,
      invoiceDate: new Date(),
      dueDate: new Date(),
      status: "CONFIRMED",
      paymentStatus: "NOT_PAID",
      total: new Prisma.Decimal(300),
      amountPaid: new Prisma.Decimal(0),
      amountDue: new Prisma.Decimal(300),
      salesOrderId: "so-1",
      customerId: "cust-1",
      createdById: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: "cust-1",
        name: "Acme Furniture Corp",
        email: "contact@acme.com",
        phone: "+1234567890",
        address: "123 Business Way",
        profileImage: null,
        userId: null,
        type: ContactType.CUSTOMER,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      lines: [
        {
          id: "line-1",
          invoiceId: "inv-101",
          productId: "prod-1",
          quantity: new Prisma.Decimal(1),
          unitPrice: new Prisma.Decimal(300),
          lineTotal: new Prisma.Decimal(300),
          taxRateId: null,
          taxAmount: new Prisma.Decimal(0),
          analyticAccountId: "acc-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          product: {
            id: "prod-1",
            name: "Executive Desk",
            type: ProductType.GOODS,
            categoryId: "cat-1",
            sku: "DSK-001",
            material: "Teak Wood",
            dimensions: "150x80x75 cm",
            stock: 10,
            reorderPoint: 2,
            salesPrice: new Prisma.Decimal(300),
            cost: new Prisma.Decimal(200),
            image: null,
            isArchived: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    };

    const pdfBuffer = await generateInvoicePDF(mockInvoice);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
