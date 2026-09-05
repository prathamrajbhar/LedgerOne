/**
 * Budget Report Service
 * Compares planned budget lines with actual achieved amounts
 */

import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface BudgetReportLineItem {
  id: string;
  budgetName: string;
  analyticAccountName: string;
  type: string;
  planned: Decimal;
  actual: Decimal;
  achievedPercent: Decimal;
  variance: Decimal;
}

export class BudgetReportService {
  async generate(budgetId?: string): Promise<BudgetReportLineItem[]> {
    const where: any = {};
    if (budgetId) {
      where.budgetId = budgetId;
    }

    const lines = await prisma.budgetLine.findMany({
      where,
      include: {
        budget: { select: { name: true, status: true } },
        analyticAccount: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return lines.map((line) => {
      const planned = line.committedAmount;
      const actual = line.achievedAmount;
      const variance = line.amountToAchieve;

      return {
        id: line.id,
        budgetName: line.budget.name,
        analyticAccountName: line.analyticAccount.name,
        type: line.type,
        planned,
        actual,
        achievedPercent: line.achievedPercent,
        variance,
      };
    });
  }
}

export const budgetReportService = new BudgetReportService();
