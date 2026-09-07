import { describe, it, expect, vi, beforeEach } from "vitest";
import { BalanceSheetService } from "../reports/balance-sheet.service";
import { AccountType } from "@prisma/client";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      journalEntryLine: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("BalanceSheetService", () => {
  let service: BalanceSheetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BalanceSheetService();
  });

  it("should balance when assets equal liabilities plus equity including net profit", async () => {
    mockPrisma.journalEntryLine.findMany.mockResolvedValue([
      // Cash asset: Debit 1000
      {
        accountId: "acc-bank",
        debit: 1000,
        credit: 0,
        account: { id: "acc-bank", name: "ICICI Bank", type: AccountType.BANK },
      },
      // Capital: Credit 500
      {
        accountId: "acc-cap",
        debit: 0,
        credit: 500,
        account: { id: "acc-cap", name: "Share Capital", type: AccountType.CAPITAL },
      },
      // Liability (Accounts Payable): Credit 200
      {
        accountId: "acc-ap",
        debit: 0,
        credit: 200,
        account: { id: "acc-ap", name: "Accounts Payable", type: AccountType.LIABILITY },
      },
      // Sales Income: Credit 400
      {
        accountId: "acc-inc",
        debit: 0,
        credit: 400,
        account: { id: "acc-inc", name: "Sales Revenue", type: AccountType.INCOME },
      },
      // Operating Expense: Debit 100
      {
        accountId: "acc-exp",
        debit: 100,
        credit: 0,
        account: { id: "acc-exp", name: "Rent Expense", type: AccountType.EXPENSES },
      },
    ]);

    const report = await service.generate();

    // Assets: 1000 (ICICI Bank)
    expect(report.assets.total).toBe(1000);
    // Liabilities: 200 (Accounts Payable)
    expect(report.liabilities.total).toBe(200);
    // Net profit = Income (400) - Expense (100) = 300
    // Equity: Capital (500) + Retained Earnings (300) = 800
    expect(report.equity.total).toBe(800);

    // Balance check: Assets (1000) === Liabilities (200) + Equity (800)
    expect(report.balanceCheck.assetsTotal).toBe(1000);
    expect(report.balanceCheck.liabilitiesAndEquityTotal).toBe(1000);
    expect(report.balanceCheck.isBalanced).toBe(true);
  });

  it("should return balanced report when no journal entry lines exist", async () => {
    mockPrisma.journalEntryLine.findMany.mockResolvedValue([]);

    const report = await service.generate();

    expect(report.assets.total).toBe(0);
    expect(report.liabilities.total).toBe(0);
    expect(report.equity.total).toBe(0);
    expect(report.balanceCheck.isBalanced).toBe(true);
  });
});
