import { describe, it, expect, vi, beforeEach } from "vitest";
import { ValidationError, NotFoundError, ConflictError } from "../../utils/errors";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      productCategory: {
        findUnique: vi.fn(),
      },
      product: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      purchaseOrderLine: {
        count: vi.fn(),
      },
      salesOrderLine: {
        count: vi.fn(),
      },
      vendorBillLine: {
        count: vi.fn(),
      },
      customerInvoiceLine: {
        count: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@prisma/client", () => {
  class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, { code }: { code: string }) {
      super(message);
      this.code = code;
    }
  }

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    ProductType: {
      GOODS: "GOODS",
      SERVICE: "SERVICE",
      COMBO: "COMBO",
    },
    Prisma: {
      PrismaClientKnownRequestError,
      Decimal: class Decimal {
        val: number;
        constructor(v: number | string) {
          this.val = Number(v);
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

import { productService } from "../product.service";

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should throw ValidationError if name is empty", async () => {
      await expect(
        productService.create({
          name: "   ",
          type: "GOODS",
          categoryId: "cat1",
          salesPrice: 100,
          cost: 50,
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if salesPrice is negative", async () => {
      await expect(
        productService.create({
          name: "Test Table",
          type: "GOODS",
          categoryId: "cat1",
          salesPrice: -10,
          cost: 50,
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if cost is negative", async () => {
      await expect(
        productService.create({
          name: "Test Table",
          type: "GOODS",
          categoryId: "cat1",
          salesPrice: 100,
          cost: -5,
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError if category is not found", async () => {
      mockPrisma.productCategory.findUnique.mockResolvedValue(null);

      await expect(
        productService.create({
          name: "Test Chair",
          type: "GOODS",
          categoryId: "invalid-cat",
          salesPrice: 150,
          cost: 80,
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictError if SKU already exists", async () => {
      mockPrisma.productCategory.findUnique.mockResolvedValue({ id: "cat1", name: "Furniture" });
      mockPrisma.product.findUnique.mockResolvedValue({ id: "p1", sku: "SKU-001" });

      await expect(
        productService.create({
          name: "Test Chair",
          type: "GOODS",
          categoryId: "cat1",
          sku: "SKU-001",
          salesPrice: 150,
          cost: 80,
        })
      ).rejects.toThrow(ConflictError);
    });

    it("should successfully create a product with valid data", async () => {
      mockPrisma.productCategory.findUnique.mockResolvedValue({ id: "cat1", name: "Furniture" });
      mockPrisma.product.findUnique.mockResolvedValue(null);
      const createdProduct = {
        id: "p1",
        name: "Test Chair",
        type: "GOODS",
        categoryId: "cat1",
        sku: "SKU-001",
        salesPrice: 150,
        cost: 80,
        stock: 0,
        reorderPoint: 10,
      };
      mockPrisma.product.create.mockResolvedValue(createdProduct);

      const result = await productService.create({
        name: "Test Chair",
        type: "GOODS",
        categoryId: "cat1",
        sku: "SKU-001",
        salesPrice: 150,
        cost: 80,
      });

      expect(result).toEqual(createdProduct);
      expect(mockPrisma.product.create).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should throw NotFoundError if product does not exist", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(
        productService.update({
          id: "p-non-existent",
          name: "New Name",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if updated name is empty string", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({ id: "p1", name: "Old Name", sku: "SKU-1" });

      await expect(
        productService.update({
          id: "p1",
          name: "   ",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictError if updating to an existing SKU owned by another product", async () => {
      mockPrisma.product.findUnique
        .mockResolvedValueOnce({ id: "p1", sku: "SKU-1" }) // existing product check
        .mockResolvedValueOnce({ id: "p2", sku: "SKU-2" }); // SKU collision check

      await expect(
        productService.update({
          id: "p1",
          sku: "SKU-2",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("should allow updating product with null/empty SKU", async () => {
      const existingProduct = { id: "p1", name: "Chair", sku: "SKU-1" };
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      const updatedProduct = { ...existingProduct, sku: null };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const result = await productService.update({
        id: "p1",
        sku: null,
      });

      expect(result).toEqual(updatedProduct);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "p1" },
          data: expect.objectContaining({ sku: null }),
        })
      );
    });

    it("should allow updating product with salesPrice zero", async () => {
      const existingProduct = { id: "p1", name: "Chair", salesPrice: 100 };
      mockPrisma.product.findUnique.mockResolvedValue(existingProduct);
      mockPrisma.product.update.mockResolvedValue({ ...existingProduct, salesPrice: 0 });

      await productService.update({
        id: "p1",
        salesPrice: 0,
      });

      expect(mockPrisma.product.update).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should throw NotFoundError if product not found", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(productService.findById("p-missing")).rejects.toThrow(NotFoundError);
    });

    it("should return product if found", async () => {
      const product = { id: "p1", name: "Product 1" };
      mockPrisma.product.findUnique.mockResolvedValue(product);

      const result = await productService.findById("p1");
      expect(result).toEqual(product);
    });
  });

  describe("canDelete", () => {
    it("should return true if no linked transaction lines exist", async () => {
      mockPrisma.purchaseOrderLine.count.mockResolvedValue(0);
      mockPrisma.salesOrderLine.count.mockResolvedValue(0);
      mockPrisma.vendorBillLine.count.mockResolvedValue(0);
      mockPrisma.customerInvoiceLine.count.mockResolvedValue(0);

      const canDelete = await productService.canDelete("p1");
      expect(canDelete).toBe(true);
    });

    it("should return false if linked sales order lines exist", async () => {
      mockPrisma.purchaseOrderLine.count.mockResolvedValue(0);
      mockPrisma.salesOrderLine.count.mockResolvedValue(2);
      mockPrisma.vendorBillLine.count.mockResolvedValue(0);
      mockPrisma.customerInvoiceLine.count.mockResolvedValue(0);

      const canDelete = await productService.canDelete("p1");
      expect(canDelete).toBe(false);
    });
  });
});
