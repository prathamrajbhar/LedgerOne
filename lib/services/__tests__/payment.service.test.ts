import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationError, NotFoundError, UnauthorizedError } from "../../utils/errors";

const { mockPrisma } = vi.hoisted(() => {
  const mockObj = {
    vendorBill: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    billPayment: {
      create: vi.fn(),
    },
    customerInvoice: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    invoicePayment: {
      create: vi.fn(),
    },
    paymentGatewayTransaction: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  mockObj.$transaction.mockImplementation((cb: (tx: typeof mockObj) => unknown) => cb(mockObj));
  return { mockPrisma: mockObj };
});

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn(() => mockPrisma),
    PaymentMethod: {
      CASH: "CASH",
      BANK: "BANK",
      GATEWAY: "GATEWAY",
    },
    InvoicePaymentSource: {
      MANUAL: "MANUAL",
      GATEWAY: "GATEWAY",
    },
    PaymentGatewayStatus: {
      INITIATED: "INITIATED",
      SUCCESS: "SUCCESS",
      FAILED: "FAILED",
    },
    Prisma: {
      Decimal: class Decimal {
        val: number;
        constructor(v: number | string) {
          this.val = Number(v);
        }
        greaterThan(n: number | { val: number }) {
          const comp = typeof n === "object" ? n.val : Number(n);
          return this.val > comp;
        }
        add(n: number | { val: number }) {
          const valToAdd = typeof n === "object" ? n.val : Number(n);
          return new Decimal(this.val + valToAdd);
        }
        sub(n: number | { val: number }) {
          const valToSub = typeof n === "object" ? n.val : Number(n);
          return new Decimal(this.val - valToSub);
        }
        isZero() {
          return this.val === 0;
        }
        lessThan(n: number | { val: number }) {
          const comp = typeof n === "object" ? n.val : Number(n);
          return this.val < comp;
        }
        toString() {
          return String(this.val);
        }
        toNumber() {
          return this.val;
        }
      },
    },
  };
});

import { paymentService } from "../payment.service";
import { Prisma, PaymentMethod } from "@prisma/client";

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("recordManualPayment - VendorBill", () => {
    it("should throw NotFoundError if VendorBill is not found", async () => {
      mockPrisma.vendorBill.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.recordManualPayment({
          documentId: "bill1",
          documentType: "BILL",
          amount: new Prisma.Decimal(100),
          paymentMethod: PaymentMethod.BANK,
          paymentDate: new Date(),
          userId: "u1",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if payment amount exceeds amount due", async () => {
      mockPrisma.vendorBill.findUnique.mockResolvedValue({
        id: "bill1",
        total: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(0),
        amountDue: new Prisma.Decimal(50),
      });

      await expect(
        paymentService.recordManualPayment({
          documentId: "bill1",
          documentType: "BILL",
          amount: new Prisma.Decimal(100),
          paymentMethod: PaymentMethod.BANK,
          paymentDate: new Date(),
          userId: "u1",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should successfully record bill payment and update bill", async () => {
      mockPrisma.vendorBill.findUnique.mockResolvedValue({
        id: "bill1",
        total: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(0),
        amountDue: new Prisma.Decimal(100),
      });

      const paymentRecord = { id: "bp1", amount: 100 };
      mockPrisma.billPayment.create.mockResolvedValue(paymentRecord);
      mockPrisma.vendorBill.update.mockResolvedValue({ id: "bill1", paymentStatus: "PAID" });

      const result = await paymentService.recordManualPayment({
        documentId: "bill1",
        documentType: "BILL",
        amount: new Prisma.Decimal(100),
        paymentMethod: PaymentMethod.BANK,
        paymentDate: new Date(),
        userId: "u1",
      });

      expect(result).toEqual(paymentRecord);
      expect(mockPrisma.billPayment.create).toHaveBeenCalled();
      expect(mockPrisma.vendorBill.update).toHaveBeenCalled();
    });
  });

  describe("recordManualPayment - CustomerInvoice", () => {
    it("should throw NotFoundError if CustomerInvoice is not found", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.recordManualPayment({
          documentId: "inv1",
          documentType: "INVOICE",
          amount: new Prisma.Decimal(100),
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date(),
          userId: "u1",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if payment amount exceeds amount due", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        total: new Prisma.Decimal(200),
        amountPaid: new Prisma.Decimal(150),
        amountDue: new Prisma.Decimal(50),
      });

      await expect(
        paymentService.recordManualPayment({
          documentId: "inv1",
          documentType: "INVOICE",
          amount: new Prisma.Decimal(100),
          paymentMethod: PaymentMethod.CASH,
          paymentDate: new Date(),
          userId: "u1",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should successfully record invoice payment", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        total: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(0),
        amountDue: new Prisma.Decimal(100),
      });

      const paymentRecord = { id: "ip1", amount: 100 };
      mockPrisma.invoicePayment.create.mockResolvedValue(paymentRecord);
      mockPrisma.customerInvoice.update.mockResolvedValue({ id: "inv1", paymentStatus: "PAID" });

      const result = await paymentService.recordManualPayment({
        documentId: "inv1",
        documentType: "INVOICE",
        amount: new Prisma.Decimal(100),
        paymentMethod: PaymentMethod.CASH,
        paymentDate: new Date(),
        userId: "u1",
      });

      expect(result).toEqual(paymentRecord);
      expect(mockPrisma.invoicePayment.create).toHaveBeenCalled();
    });
  });

  describe("createGatewayOrder", () => {
    it("should throw NotFoundError if invoice is not found", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.createGatewayOrder({
          invoiceId: "inv1",
          amount: new Prisma.Decimal(100),
          contactId: "c1",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw UnauthorizedError if invoice belongs to a different contact", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        customerId: "c2",
        amountDue: new Prisma.Decimal(100),
      });

      await expect(
        paymentService.createGatewayOrder({
          invoiceId: "inv1",
          amount: new Prisma.Decimal(100),
          contactId: "c1",
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw ValidationError if gateway amount exceeds amount due", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        customerId: "c1",
        amountDue: new Prisma.Decimal(50),
      });

      await expect(
        paymentService.createGatewayOrder({
          invoiceId: "inv1",
          amount: new Prisma.Decimal(100),
          contactId: "c1",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should create gateway order transaction successfully", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        customerId: "c1",
        amountDue: new Prisma.Decimal(100),
      });

      mockPrisma.paymentGatewayTransaction.create.mockResolvedValue({
        id: "tx1",
        gatewayOrderId: "ORDER_123",
        amount: new Prisma.Decimal(100),
      });

      const result = await paymentService.createGatewayOrder({
        invoiceId: "inv1",
        amount: new Prisma.Decimal(100),
        contactId: "c1",
      });

      expect(result.transactionId).toBe("tx1");
      expect(result.gatewayOrderId).toBe("ORDER_123");
    });
  });

  describe("confirmGatewayPayment", () => {
    it("should throw NotFoundError if transaction is not found", async () => {
      mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.confirmGatewayPayment({
          gatewayTransactionId: "tx1",
          gatewayPaymentId: "pay1",
          paymentMethod: "upi",
          webhookSignature: "sig",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should return existing transaction if already processed (idempotency)", async () => {
      const existingTx = {
        id: "tx1",
        gatewayPaymentId: "pay1",
        status: "SUCCESS",
      };
      mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue(existingTx);

      const result = await paymentService.confirmGatewayPayment({
        gatewayTransactionId: "tx1",
        gatewayPaymentId: "pay1",
        paymentMethod: "upi",
        webhookSignature: "sig",
      });

      expect(result).toEqual(existingTx);
      expect(mockPrisma.invoicePayment.create).not.toHaveBeenCalled();
    });

    it("should process payment confirmation and update invoice", async () => {
      const invoice = {
        id: "inv1",
        total: new Prisma.Decimal(100),
        amountPaid: new Prisma.Decimal(0),
      };

      mockPrisma.paymentGatewayTransaction.findUnique.mockResolvedValue({
        id: "tx1",
        invoiceId: "inv1",
        amount: new Prisma.Decimal(100),
        gatewayPaymentId: null,
        invoice,
      });

      const paymentRecord = { id: "ip1", amount: new Prisma.Decimal(100) };
      mockPrisma.paymentGatewayTransaction.update.mockResolvedValue({});
      mockPrisma.invoicePayment.create.mockResolvedValue(paymentRecord);
      mockPrisma.customerInvoice.update.mockResolvedValue({});

      const result = await paymentService.confirmGatewayPayment({
        gatewayTransactionId: "tx1",
        gatewayPaymentId: "pay1",
        paymentMethod: "upi",
        webhookSignature: "sig",
      });

      expect(result).toEqual(paymentRecord);
      expect(mockPrisma.invoicePayment.create).toHaveBeenCalled();
      expect(mockPrisma.customerInvoice.update).toHaveBeenCalled();
    });
  });

  describe("handleGatewayFailure", () => {
    it("should update transaction status to FAILED", async () => {
      mockPrisma.paymentGatewayTransaction.update.mockResolvedValue({ id: "tx1", status: "FAILED" });

      await paymentService.handleGatewayFailure("tx1", "Payment declined by user");

      expect(mockPrisma.paymentGatewayTransaction.update).toHaveBeenCalledWith({
        where: { id: "tx1" },
        data: {
          status: "FAILED",
          failureReason: "Payment declined by user",
        },
      });
    });
  });
});
