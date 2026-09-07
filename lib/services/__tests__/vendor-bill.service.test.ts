import { describe, it, expect, vi, beforeEach } from "vitest";
import { VendorBillService } from "../vendor-bill.service";
import { NotFoundError, ValidationError } from "../../utils/errors";
import { DocumentStatus, PaymentStatus, ProductType } from "@prisma/client";

const { mockPrisma } = vi.hoisted(() => {
  const transactionMock = vi.fn();
  const mock = {
    $transaction: transactionMock,
    purchaseOrder: {
      findUnique: vi.fn(),
    },
    vendorBill: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    companySettings: {
      findFirst: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
    journal: {
      findFirst: vi.fn(),
    },
    chartOfAccount: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    journalEntry: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  };

  transactionMock.mockImplementation((callback: unknown) =>
    typeof callback === "function"
      ? (callback as (tx: unknown) => unknown)(mock)
      : Promise.all(callback as Promise<unknown>[])
  );

  return { mockPrisma: mock };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("VendorBillService", () => {
  let service: VendorBillService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new VendorBillService();
  });

  describe("createFromPurchaseOrder", () => {
    it("should throw NotFoundError if purchase order does not exist", async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue(null);

      await expect(service.createFromPurchaseOrder("non-existent-po")).rejects.toThrow(
        NotFoundError
      );
    });

    it("should throw ValidationError if purchase order is not confirmed", async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue({
        id: "po-1",
        status: DocumentStatus.DRAFT,
        lines: [],
      });

      await expect(service.createFromPurchaseOrder("po-1")).rejects.toThrow(
        ValidationError
      );
    });

    it("should create vendor bill from confirmed purchase order", async () => {
      mockPrisma.purchaseOrder.findUnique.mockResolvedValue({
        id: "po-1",
        vendorId: "v-1",
        createdById: "u-1",
        total: 500,
        status: DocumentStatus.CONFIRMED,
        lines: [
          {
            productId: "prod-1",
            analyticAccountId: "aa-1",
            quantity: 5,
            unitPrice: 100,
            lineTotal: 500,
            product: { id: "prod-1", name: "Wooden Chair" },
            analyticAccount: { id: "aa-1", name: "Direct Materials" },
          },
        ],
      });

      mockPrisma.companySettings.findFirst.mockResolvedValue({
        billNumberPrefix: "BILL",
      });
      mockPrisma.vendorBill.findFirst.mockResolvedValue(null);

      const mockCreatedBill = {
        id: "bill-1",
        billNumber: "BILL00001",
        purchaseOrderId: "po-1",
        vendorId: "v-1",
        status: DocumentStatus.DRAFT,
        paymentStatus: PaymentStatus.NOT_PAID,
      };
      mockPrisma.vendorBill.create.mockResolvedValue(mockCreatedBill);

      const result = await service.createFromPurchaseOrder("po-1", "u-1");
      expect(result).toEqual(mockCreatedBill);
      expect(mockPrisma.vendorBill.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            purchaseOrderId: "po-1",
            vendorId: "v-1",
            total: 500,
          }),
        })
      );
    });
  });

  describe("confirm and inventory movement", () => {
    it("should increment product stock for GOODS when bill is confirmed", async () => {
      const mockBill = {
        id: "bill-1",
        billNumber: "BILL00001",
        status: DocumentStatus.DRAFT,
        vendorId: "v-1",
        total: 500,
        billDate: new Date(),
        lines: [
          {
            productId: "prod-goods",
            quantity: 10,
            product: {
              id: "prod-goods",
              type: ProductType.GOODS,
              stock: 5,
            },
          },
        ],
      };

      mockPrisma.vendorBill.findUnique.mockResolvedValue(mockBill);
      mockPrisma.journal.findFirst.mockResolvedValue({ id: "j-pur" });
      mockPrisma.chartOfAccount.findFirst
        .mockResolvedValueOnce({ id: "acc-exp" })
        .mockResolvedValueOnce({ id: "acc-ap" });
      mockPrisma.chartOfAccount.findUnique.mockResolvedValue({
        id: "acc-ap",
        type: "LIABILITY",
      });
      mockPrisma.companySettings.findFirst.mockResolvedValue({
        jeNumberPrefix: "JE",
        creditorsAccountId: "acc-ap",
      });
      mockPrisma.journalEntry.findFirst.mockResolvedValue(null);
      mockPrisma.journalEntry.create.mockResolvedValue({ id: "je-1" });
      mockPrisma.vendorBill.update.mockResolvedValue({
        ...mockBill,
        status: DocumentStatus.CONFIRMED,
      });

      await service.confirm("bill-1");

      // Verify product stock incremented by 10
      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: "prod-goods" },
        data: { stock: { increment: 10 } },
      });
    });
  });
});
