/**
 * Profit & Loss Report Service
 * Computes Income, Expenses, and Net Profit
 */

import { PrismaClient, AccountType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface ProfitAndLossReport {
  revenues: { id: string; name: string; code?: string; amount: Decimal }[];
  totalRevenue: Decimal;
  expenses: { id: string; name: string; code?: string; amount: Decimal }[];
  totalExpenses: Decimal;
  netProfit: Decimal;
}

export class ProfitAndLossService {
  async generate(startDate?: Date, endDate?: Date): Promise<ProfitAndLossReport> {
    const dateFilter: any = {
      journalEntry: {
        status: "POSTED" as const,
      },
    };

    if (startDate || endDate) {
      dateFilter.journalEntry.accountingDate = {};
      if (startDate) dateFilter.journalEntry.accountingDate.gte = startDate;
      if (endDate) dateFilter.journalEntry.accountingDate.lte = endDate;
    }

    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        isArchived: false,
        type: {
          in: [
            AccountType.INCOME,
            AccountType.EXPENSES,
            AccountType.OTHER_EXPENSES,
          ],
        },
      },
      include: {
        journalEntryLines: {
          where: dateFilter,
          select: {
            debit: true,
            credit: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const revenues: { id: string; name: string; code?: string; amount: Decimal }[] =
      [];
    const expenses: { id: string; name: string; code?: string; amount: Decimal }[] =
      [];

    let totalRevenue = new Decimal(0);
    let totalExpenses = new Decimal(0);

    for (const acc of accounts) {
      let d = new Decimal(0);
      let c = new Decimal(0);

      for (const line of acc.journalEntryLines) {
        d = d.add(line.debit);
        c = c.add(line.credit);
      }

      if (acc.type === AccountType.INCOME) {
        // Normal credit balance
        const amount = c.sub(d);
        revenues.push({ id: acc.id, name: acc.name, amount });
        totalRevenue = totalRevenue.add(amount);
      } else {
        // Normal debit balance
        const amount = d.sub(c);
        expenses.push({ id: acc.id, name: acc.name, amount });
        totalExpenses = totalExpenses.add(amount);
      }
    }

    const netProfit = totalRevenue.sub(totalExpenses);

    return {
      revenues,
      totalRevenue,
      expenses,
      totalExpenses,
      netProfit,
    };
  }
}

export const profitAndLossService = new ProfitAndLossService();
