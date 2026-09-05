import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
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
      salesOrder: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
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

import { salesOrderService } from "../sales-order.service";

describe("SalesOrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should throw ValidationError if customerId is missing", async () => {
      await expect(
        salesOrderService.create({
          customerId: "",
          orderDate: new Date(),
          lines: [
            { productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if lines are empty", async () => {
      await expect(
        salesOrderService.create({
          customerId: "c1",
          orderDate: new Date(),
          lines: [],
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError if customer does not exist", async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(
        salesOrderService.create({
          customerId: "c1",
          orderDate: new Date(),
          lines: [
            { productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 },
          ],
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if contact is not a customer", async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({
        id: "c1",
        type: "VENDOR",
      });

      await expect(
        salesOrderService.create({
          customerId: "c1",
          orderDate: new Date(),
          lines: [
            { productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if one or more products do not exist", async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({
        id: "c1",
        type: "CUSTOMER",
      });
      mockPrisma.product.findMany.mockResolvedValue([]);

      await expect(
        salesOrderService.create({
          customerId: "c1",
          orderDate: new Date(),
          lines: [
            { productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100 },
          ],
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should successfully create a sales order in DRAFT status", async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({
        id: "c1",
        type: "CUSTOMER",
      });
      mockPrisma.product.findMany.mockResolvedValue([{ id: "p1" }]);
      mockPrisma.user.findFirst.mockResolvedValue({ id: "u1" });
      mockPrisma.analyticAccount.findFirst.mockResolvedValue({ id: "a1" });
      mockPrisma.taxRate.findMany.mockResolvedValue([]);
      mockPrisma.companySettings.findFirst.mockResolvedValue({ soNumberPrefix: "SO" });
      mockPrisma.salesOrder.count.mockResolvedValue(0);

      const createdSO = {
        id: "so1",
        orderNumber: "SO00001",
        customerId: "c1",
        status: "DRAFT",
        total: 100,
      };

      mockPrisma.salesOrder.create.mockResolvedValue(createdSO);

      const result = await salesOrderService.create({
        customerId: "c1",
        orderDate: new Date(),
        createdById: "u1",
        lines: [
          { productId: "p1", description: "Item 1", quantity: 1, unitPrice: 100, analyticAccountId: "a1" },
        ],
      });

      expect(result).toEqual(createdSO);
      expect(mockPrisma.salesOrder.create).toHaveBeenCalled();
    });
  });

  describe("confirm", () => {
    it("should throw NotFoundError if sales order is not found", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue(null);

      await expect(salesOrderService.confirm({ id: "so1" })).rejects.toThrow(NotFoundError);
    });

    it("should throw ConflictError if sales order is not in DRAFT status", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue({
        id: "so1",
        status: "CONFIRMED",
      });

      await expect(salesOrderService.confirm({ id: "so1" })).rejects.toThrow(ConflictError);
    });

    it("should confirm a draft sales order successfully", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue({
        id: "so1",
        status: "DRAFT",
      });
      mockPrisma.salesOrder.update.mockResolvedValue({
        id: "so1",
        status: "CONFIRMED",
      });

      const result = await salesOrderService.confirm({ id: "so1" });
      expect(result.status).toBe("CONFIRMED");
    });
  });

  describe("cancel", () => {
    it("should throw NotFoundError if sales order is not found", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue(null);

      await expect(salesOrderService.cancel("so1")).rejects.toThrow(NotFoundError);
    });

    it("should cancel a draft or confirmed sales order", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue({
        id: "so1",
        status: "DRAFT",
      });
      mockPrisma.salesOrder.update.mockResolvedValue({
        id: "so1",
        status: "CANCELLED",
      });

      const result = await salesOrderService.cancel("so1");
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("findById", () => {
    it("should throw NotFoundError if sales order does not exist", async () => {
      mockPrisma.salesOrder.findUnique.mockResolvedValue(null);

      await expect(salesOrderService.findById("so1")).rejects.toThrow(NotFoundError);
    });

    it("should return sales order when found", async () => {
      const so = { id: "so1", orderNumber: "SO-001" };
      mockPrisma.salesOrder.findUnique.mockResolvedValue(so);

      const result = await salesOrderService.findById("so1");
      expect(result).toEqual(so);
    });
  });
});
