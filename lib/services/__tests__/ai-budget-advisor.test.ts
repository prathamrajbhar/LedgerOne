import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      budgetLine: {
        findFirst: vi.fn(),
      },
      budget: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@prisma/client", () => ({
  BudgetStatus: {
    DRAFT: "DRAFT",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
  },
}));

import { aiBudgetAdvisorService } from "../ai-budget-advisor.service";

describe("AiBudgetAdvisorService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkBudgetImpact", () => {
    it("should return SAFE if no analyticAccountId or proposedAmount is <= 0", async () => {
      const res = await aiBudgetAdvisorService.checkBudgetImpact("", 100);
      expect(res.hasBudget).toBe(false);
      expect(res.status).toBe("SAFE");
    });

    it("should return SAFE if no active budget line is found", async () => {
      mockPrisma.budgetLine.findFirst.mockResolvedValue(null);
      const res = await aiBudgetAdvisorService.checkBudgetImpact("an_1", 500);
      expect(res.hasBudget).toBe(false);
      expect(res.status).toBe("SAFE");
    });

    it("should detect EXCEEDED status when proposed total exceeds committed budget", async () => {
      mockPrisma.budgetLine.findFirst.mockResolvedValue({
        analyticAccountId: "an_1",
        committedAmount: 10000,
        achievedAmount: 8500,
        analyticAccount: { name: "Timber Purchases" },
        budget: { id: "b_1", name: "Q3 Operational Budget" },
      });

      const res = await aiBudgetAdvisorService.checkBudgetImpact("an_1", 3000);
      expect(res.hasBudget).toBe(true);
      expect(res.status).toBe("EXCEEDED");
      expect(res.newTotalSpent).toBe(11500);
      expect(res.newPercentConsumed).toBe(115);
      expect(res.warningMessage).toContain("breach");
    });

    it("should detect WARNING status when proposed total reaches >= 80% capacity", async () => {
      mockPrisma.budgetLine.findFirst.mockResolvedValue({
        analyticAccountId: "an_1",
        committedAmount: 10000,
        achievedAmount: 6000,
        analyticAccount: { name: "Showroom Logistics" },
        budget: { id: "b_1", name: "Annual Budget" },
      });

      const res = await aiBudgetAdvisorService.checkBudgetImpact("an_1", 2500);
      expect(res.hasBudget).toBe(true);
      expect(res.status).toBe("WARNING");
      expect(res.newPercentConsumed).toBe(85);
      expect(res.warningMessage).toContain("Caution");
    });
  });

  describe("getBudgetHealthSummary", () => {
    it("should collect high risk alerts for budgets operating >= 80%", async () => {
      mockPrisma.budget.findMany.mockResolvedValue([
        {
          id: "b_1",
          name: "Q3 Sales & Operations",
          lines: [
            {
              analyticAccountId: "an_1",
              committedAmount: 50000,
              achievedAmount: 45000,
              analyticAccount: { name: "Raw Materials" },
            },
            {
              analyticAccountId: "an_2",
              committedAmount: 20000,
              achievedAmount: 5000,
              analyticAccount: { name: "Office Supplies" },
            },
          ],
        },
      ]);

      const summary = await aiBudgetAdvisorService.getBudgetHealthSummary();
      expect(summary.totalActiveBudgets).toBe(1);
      expect(summary.highRiskAlerts.length).toBe(1);
      expect(summary.highRiskAlerts[0].analyticAccountName).toBe("Raw Materials");
      expect(summary.highRiskAlerts[0].status).toBe("WARNING");
    });
  });
});
