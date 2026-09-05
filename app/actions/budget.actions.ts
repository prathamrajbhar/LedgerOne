"use server";

import { revalidatePath } from "next/cache";
import { budgetService, BudgetLineInput } from "@/lib/services/budget.service";
import { requireAuth } from "@/lib/auth/session";
import { Decimal } from "@prisma/client/runtime/library";
import { BudgetStatus, AnalyticAccountType } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface BudgetActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getBudgetsAction(filters?: {
  status?: BudgetStatus;
  search?: string;
}): Promise<BudgetActionResult> {
  try {
    const rawBudgets = await budgetService.list(filters || {});

    const budgets = rawBudgets.map((budget) => {
      const totalCommitted = budget.lines.reduce(
        (sum, line) => sum + Number(line.committedAmount),
        0
      );
      const totalAchieved = budget.lines.reduce(
        (sum, line) => sum + Number(line.achievedAmount),
        0
      );
      const achievementRate =
        totalCommitted > 0 ? (totalAchieved / totalCommitted) * 100 : 0;

      return {
        id: budget.id,
        name: budget.name,
        status: budget.status,
        startDate: budget.startDate.toISOString(),
        endDate: budget.endDate.toISOString(),
        responsible: budget.responsible,
        lineCount: budget.lines.length,
        totalCommitted,
        totalAchieved,
        achievementRate: Math.round(achievementRate * 100) / 100,
        createdAt: budget.createdAt.toISOString(),
      };
    });

    return { success: true, data: budgets };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch budgets";
    return { success: false, error: message };
  }
}

export async function getBudgetByIdAction(id: string): Promise<BudgetActionResult> {
  try {
    const budget = await budgetService.findById(id);

    const serializedLines = budget.lines.map((line) => ({
      id: line.id,
      analyticAccountId: line.analyticAccountId,
      analyticAccountName: line.analyticAccount.name,
      type: line.type,
      committedAmount: Number(line.committedAmount),
      achievedAmount: Number(line.achievedAmount),
      achievedPercent: Number(line.achievedPercent),
      amountToAchieve: Number(line.amountToAchieve),
    }));

    const totalCommitted = serializedLines.reduce((sum, l) => sum + l.committedAmount, 0);
    const totalAchieved = serializedLines.reduce((sum, l) => sum + l.achievedAmount, 0);
    const overallRate = totalCommitted > 0 ? (totalAchieved / totalCommitted) * 100 : 0;

    return {
      success: true,
      data: {
        id: budget.id,
        name: budget.name,
        status: budget.status,
        startDate: budget.startDate.toISOString(),
        endDate: budget.endDate.toISOString(),
        responsible: budget.responsible,
        responsibleId: budget.responsibleId,
        revisionOfId: budget.revisionOfId,
        lines: serializedLines,
        totalCommitted,
        totalAchieved,
        overallRate: Math.round(overallRate * 10) / 10,
        createdAt: budget.createdAt.toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch budget";
    return { success: false, error: message };
  }
}

export async function createBudgetAction(input: {
  name: string;
  startDate: string;
  endDate: string;
  responsibleId: string;
  lines: Array<{
    analyticAccountId: string;
    type: AnalyticAccountType;
    committedAmount: number;
  }>;
}): Promise<BudgetActionResult<{ id: string }>> {
  try {
    const session = await requireAuth();

    const formattedLines: BudgetLineInput[] = input.lines.map((line) => ({
      analyticAccountId: line.analyticAccountId,
      type: line.type,
      committedAmount: new Decimal(line.committedAmount),
    }));

    const budget = await budgetService.create({
      name: input.name,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      responsibleId: input.responsibleId,
      lines: formattedLines,
      userId: session.user.id,
    });

    revalidatePath("/budgets");
    return { success: true, data: { id: budget.id } };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create budget";
    return { success: false, error: message };
  }
}

export async function confirmBudgetAction(id: string): Promise<BudgetActionResult> {
  try {
    await budgetService.confirm(id);
    revalidatePath("/budgets");
    revalidatePath(`/budgets/${id}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to confirm budget";
    return { success: false, error: message };
  }
}

export async function cancelBudgetAction(id: string): Promise<BudgetActionResult> {
  try {
    await budgetService.cancel(id);
    revalidatePath("/budgets");
    revalidatePath(`/budgets/${id}`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to cancel budget";
    return { success: false, error: message };
  }
}

export async function getBudgetFormDataAction(): Promise<BudgetActionResult> {
  try {
    const [users, analytics] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true, role: { in: ["ADMINISTRATOR", "ACCOUNTANT"] } },
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.analyticAccount.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true,
      data: {
        users,
        analytics,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch form options";
    return { success: false, error: message };
  }
}
