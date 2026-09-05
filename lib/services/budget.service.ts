import { prisma } from "@/lib/prisma";
/**
 * Budget Service
 * Manages budget lifecycle and achievement computation
 */

import { BudgetStatus, AnalyticAccountType, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { ValidationError, NotFoundError } from "../utils/errors";



export interface CreateBudgetInput {
  name: string;
  startDate: Date;
  endDate: Date;
  responsibleId: string;
  lines: BudgetLineInput[];
  userId: string;
}

export interface BudgetLineInput {
  analyticAccountId: string;
  type: AnalyticAccountType;
  committedAmount: Decimal;
}

export interface ReviseBudgetInput {
  budgetId: string;
  name?: string;
  lines: BudgetLineInput[];
  userId: string;
}

export class BudgetService {
  /**
   * Create a new budget (Draft status)
   */
  async create(input: CreateBudgetInput) {
    // Validate dates
    if (input.endDate <= input.startDate) {
      throw new ValidationError("End date must be after start date");
    }

    return prisma.$transaction(async (tx) => {
      const budget = await tx.budget.create({
        data: {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          responsibleId: input.responsibleId,
          status: BudgetStatus.DRAFT,
          lines: {
            create: input.lines.map((line) => ({
              analyticAccountId: line.analyticAccountId,
              type: line.type,
              committedAmount: line.committedAmount,
              achievedAmount: new Decimal(0),
              achievedPercent: new Decimal(0),
              amountToAchieve: line.committedAmount,
            })),
          },
        },
        include: {
          lines: {
            include: {
              analyticAccount: true,
            },
          },
          responsible: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return budget;
    });
  }

  /**
   * Confirm a budget (compute achievement)
   */
  async confirm(budgetId: string) {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: { lines: true },
    });

    if (!budget) {
      throw new NotFoundError("Budget not found");
    }

    if (budget.status !== BudgetStatus.DRAFT) {
      throw new ValidationError("Only draft budgets can be confirmed");
    }

    return prisma.$transaction(async (tx) => {
      // Update budget status
      await tx.budget.update({
        where: { id: budgetId },
        data: { status: BudgetStatus.CONFIRMED },
      });

      // Compute achievement for each line
      for (const line of budget.lines) {
        const achieved = await this.computeAchievement(
          line.analyticAccountId,
          line.type,
          budget.startDate,
          budget.endDate
        );

        const achievedPercent = line.committedAmount.isZero()
          ? new Decimal(0)
          : achieved.div(line.committedAmount).mul(100);

        const amountToAchieve = line.committedAmount.sub(achieved);

        await tx.budgetLine.update({
          where: { id: line.id },
          data: {
            achievedAmount: achieved,
            achievedPercent,
            amountToAchieve,
          },
        });
      }

      return this.findById(budgetId);
    });
  }

  /**
   * Revise a confirmed budget (creates new version)
   */
  async revise(input: ReviseBudgetInput) {
    const original = await prisma.budget.findUnique({
      where: { id: input.budgetId },
      include: { lines: true },
    });

    if (!original) {
      throw new NotFoundError("Budget not found");
    }

    if (original.status !== BudgetStatus.CONFIRMED) {
      throw new ValidationError("Only confirmed budgets can be revised");
    }

    return prisma.$transaction(async (tx) => {
      // Create new budget
      const revised = await tx.budget.create({
        data: {
          name: input.name || `${original.name} (Revised)`,
          startDate: original.startDate,
          endDate: original.endDate,
          responsibleId: original.responsibleId,
          status: BudgetStatus.DRAFT,
          revisionOfId: original.id,
          lines: {
            create: input.lines.map((line) => ({
              analyticAccountId: line.analyticAccountId,
              type: line.type,
              committedAmount: line.committedAmount,
              achievedAmount: new Decimal(0),
              achievedPercent: new Decimal(0),
              amountToAchieve: line.committedAmount,
            })),
          },
        },
        include: {
          lines: {
            include: {
              analyticAccount: true,
            },
          },
        },
      });

      // Link back to original
      await tx.budget.update({
        where: { id: original.id },
        data: { revisedWithId: revised.id },
      });

      return revised;
    });
  }

  /**
   * Cancel a budget
   */
  async cancel(budgetId: string) {
    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: { status: BudgetStatus.CANCELLED },
      include: {
        lines: {
          include: {
            analyticAccount: true,
          },
        },
      },
    });

    return budget;
  }

  /**
   * Find budget by ID
   */
  async findById(budgetId: string) {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
      include: {
        lines: {
          include: {
            analyticAccount: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        revisionOf: true,
        revisedWith: true,
      },
    });

    if (!budget) {
      throw new NotFoundError("Budget not found");
    }

    return budget;
  }

  /**
   * List budgets with filters
   */
  async list(filters: {
    status?: BudgetStatus;
    responsibleId?: string;
    search?: string;
  }) {
    const where: Prisma.BudgetWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.responsibleId) {
      where.responsibleId = filters.responsibleId;
    }

    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive",
      };
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        lines: {
          include: {
            analyticAccount: true,
          },
        },
        responsible: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return budgets;
  }

  // Private helpers

  /**
   * Compute achievement for an analytic account within a period
   */
  private async computeAchievement(
    analyticAccountId: string,
    type: AnalyticAccountType,
    startDate: Date,
    endDate: Date
  ): Promise<Decimal> {
    let total = new Decimal(0);

    if (type === AnalyticAccountType.INCOME) {
      // Sum from Sales Invoice lines
      const invoiceLines = await prisma.customerInvoiceLine.findMany({
        where: {
          analyticAccountId,
          invoice: {
            status: "CONFIRMED",
            invoiceDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        select: {
          lineTotal: true,
        },
      });

      total = invoiceLines.reduce((sum, line) => sum.add(line.lineTotal), new Decimal(0));
    } else if (type === AnalyticAccountType.EXPENSES) {
      // Sum from Vendor Bill lines
      const billLines = await prisma.vendorBillLine.findMany({
        where: {
          analyticAccountId,
          vendorBill: {
            status: "CONFIRMED",
            billDate: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
        select: {
          lineTotal: true,
        },
      });

      total = billLines.reduce((sum, line) => sum.add(line.lineTotal), new Decimal(0));
    }

    return total;
  }
}

export const budgetService = new BudgetService();
