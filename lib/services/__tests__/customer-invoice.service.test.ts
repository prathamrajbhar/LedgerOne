import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      salesOrder: {
        findUnique: vi.fn(),
      },
      contact: {
        findUnique: vi.fn(),
      },
      product: {
        findMany: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
      },
      analyticAccount: {
        findFirst: vi.fn(),
      },
      taxRate: {
        findMany: vi.fn(),
      },
      customerInvoice: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      journal: {
        findFirst: vi.fn(),
      },
      chartOfAccount: {
        findFirst: vi.fn(),
      },
      companySettings: {
        findFirst: vi.fn(),
      },
    },
  };
});

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn(() => mockPrisma),
    DocumentStatus: {
      DRAFT: "DRAFT",
      CONFIRMED: "CONFIRMED",
      CANCELLED: "CANCELLED",
    },
    PaymentStatus: {
      NOT_PAID: "NOT_PAID",
      PARTIAL: "PARTIAL",
      PAID: "PAID",
    },
    JournalEntrySource: {
      CUSTOMER_INVOICE: "CUSTOMER_INVOICE",
    },
    JournalType: {
      SALE: "SALE",
    },
    AccountType: {
      ASSET: "ASSET",
      INCOME: "INCOME",
    },
    Prisma: {
      Decimal: class Decimal {
        val: number;
        constructor(v: number | string) {
          this.val = Number(v);
        }
        mul(n: number | { val: number }) {
          const mult = typeof n === "object" ? n.val : Number(n);
          return new Decimal(this.val * mult);
        }
        add(n: number | { val: number }) {
          const valToAdd = typeof n === "object" ? n.val : Number(n);
          return new Decimal(this.val + valToAdd);
        }
        sub(n: number | { val: number }) {
          const valToSub = typeof n === "object" ? n.val : Number(n);
          return new Decimal(this.val - valToSub);
        }
        div(n: number | { val: number }) {
          const valToDiv = typeof n === "object" ? n.val : Number(n);
          return new Decimal(this.val / valToDiv);
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

vi.mock("../journal-entry.service", () => {
  return {
    journalEntryService: {
      autoGenerate: vi.fn().mockResolvedValue({ id: "je1" }),
    },
  };
});

import { customerInvoiceService } from "../customer-invoice.service";

describe("CustomerInvoiceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFromSalesOrder", () => {
    it("should throw NotFoundError if sales order is not found", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue(null);

      await expect(customerInvoiceService.createFromSalesOrder("so1")).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError if sales order is not CONFIRMED", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue({
        id: "so1",
        status: "DRAFT",
      });

      await expect(customerInvoiceService.createFromSalesOrder("so1")).rejects.toThrow(ConflictError);
    });
  });

  describe("createStandalone", () => {
    it("should throw ValidationError if customerId is missing", async () => {
      await expect(
        customerInvoiceService.createStandalone({
          customerId: "",
          invoiceDate: new Date(),
          dueDate: new Date(),
          lines: [{ productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 }],
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError if customer is not found", async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(
        customerInvoiceService.createStandalone({
          customerId: "c1",
          invoiceDate: new Date(),
          dueDate: new Date(),
          lines: [{ productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 }],
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if contact is not a customer", async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({
        id: "c1",
        type: "VENDOR",
      });

      await expect(
        customerInvoiceService.createStandalone({
          customerId: "c1",
          invoiceDate: new Date(),
          dueDate: new Date(),
          lines: [{ productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 }],
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("confirm", () => {
    it("should throw NotFoundError if invoice is not found", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue(null);

      await expect(customerInvoiceService.confirm("inv1")).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError if invoice is not in DRAFT status", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        status: "CONFIRMED",
      });

      await expect(customerInvoiceService.confirm("inv1")).rejects.toThrow(ConflictError);
    });
  });

  describe("cancel", () => {
    it("should throw NotFoundError if invoice does not exist", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue(null);

      await expect(customerInvoiceService.cancel("inv1")).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError if invoice is already cancelled", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        status: "CANCELLED",
        paymentStatus: "NOT_PAID",
      });

      await expect(customerInvoiceService.cancel("inv1")).rejects.toThrow(ConflictError);
    });

    it("should cancel draft or unpaid confirmed invoice", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue({
        id: "inv1",
        status: "DRAFT",
        paymentStatus: "NOT_PAID",
      });
      mockPrisma.customerInvoice.update.mockResolvedValue({
        id: "inv1",
        status: "CANCELLED",
      });

      const result = await customerInvoiceService.cancel("inv1");
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("findById", () => {
    it("should throw NotFoundError if invoice is not found", async () => {
      mockPrisma.customerInvoice.findUnique.mockResolvedValue(null);

      await expect(customerInvoiceService.findById("inv1")).rejects.toThrow(NotFoundError);
    });

    it("should return customer invoice when found", async () => {
      const inv = { id: "inv1", invoiceNumber: "INV-001" };
      mockPrisma.customerInvoice.findUnique.mockResolvedValue(inv);

      const result = await customerInvoiceService.findById("inv1");
      expect(result).toEqual(inv);
    });
  });
});
