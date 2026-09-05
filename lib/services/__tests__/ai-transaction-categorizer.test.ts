import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      chartOfAccount: {
        findMany: vi.fn(),
      },
      analyticAccount: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { aiTransactionCategorizerService } from "../ai-transaction-categorizer.service";

describe("AiTransactionCategorizerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if memo is empty", async () => {
    await expect(aiTransactionCategorizerService.categorizeTransaction({ memo: "" })).rejects.toThrow();
  });

  it("should categorize fuel/vehicle transactions to vehicle/fuel expense account", async () => {
    mockPrisma.chartOfAccount.findMany.mockResolvedValue([
      { id: "acc_1", code: "60200", name: "Vehicle & Fuel Expense", type: "EXPENSE" },
      { id: "acc_2", code: "60100", name: "Utilities Expense", type: "EXPENSE" },
    ]);
    mockPrisma.analyticAccount.findMany.mockResolvedValue([
      { id: "an_1", code: "AN01", name: "Showroom Logistics", type: "EXPENSE" },
    ]);

    const result = await aiTransactionCategorizerService.categorizeTransaction({
      memo: "HPCL PETROL PUMP GANDHINAGAR",
      amount: 2850,
    });

    expect(result.accountId).toBe("acc_1");
    expect(result.accountCode).toBe("60200");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  it("should categorize raw materials/timber transactions to CGS/Materials account", async () => {
    mockPrisma.chartOfAccount.findMany.mockResolvedValue([
      { id: "acc_1", code: "50100", name: "Cost of Goods Sold - Materials", type: "EXPENSE" },
      { id: "acc_2", code: "60100", name: "Utilities Expense", type: "EXPENSE" },
    ]);
    mockPrisma.analyticAccount.findMany.mockResolvedValue([
      { id: "an_1", code: "AN01", name: "Timber Processing", type: "EXPENSE" },
    ]);

    const result = await aiTransactionCategorizerService.categorizeTransaction({
      memo: "Sawmill Teak Wood Timber Cutting Charges",
      amount: 8500,
    });

    expect(result.accountId).toBe("acc_1");
    expect(result.accountCode).toBe("50100");
  });
});
