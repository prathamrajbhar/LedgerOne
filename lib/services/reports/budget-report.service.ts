import { PrismaClient, BudgetStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface BudgetReportLine {
  budgetId: string;
  budgetName: string;
  analyticAccountId: string;
  analyticAccountName: string;
  type: string;
  committedAmount: Decimal;
  achievedAmount: Decimal;
  achievedPercent: Decimal;
  variance: Decimal;
  status: string;
}

export class BudgetReportService {
  async generate(budgetId?: string): Promise<BudgetReportLine[]> {
    const where: any = {
      status: { in: [BudgetStatus.CONFIRMED, BudgetStatus.DRAFT] },
    };
    if (budgetId) {
      where.id = budgetId;
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        lines: {
          include: {
            analyticAccount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const reportLines: BudgetReportLine[] = [];

    for (const budget of budgets) {
      for (const line of budget.lines) {
        const variance = line.committedAmount.sub(line.achievedAmount);
        reportLines.push({
          budgetId: budget.id,
          budgetName: budget.name,
          analyticAccountId: line.analyticAccountId,
          analyticAccountName: line.analyticAccount.name,
          type: line.type,
          committedAmount: line.committedAmount,
          achievedAmount: line.achievedAmount,
          achievedPercent: line.achievedPercent,
          variance,
          status: budget.status,
        });
      }
    }

    return reportLines;
  }
}

export const budgetReportService = new BudgetReportService();
