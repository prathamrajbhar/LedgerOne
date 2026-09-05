import { PrismaClient, JournalEntryStatus, AccountType, Prisma } from "@prisma/client";
import { ValidationError } from "../../utils/errors";

const prisma = new PrismaClient();

export interface AccountBalanceSummary {
  accountId: string;
  name: string;
  type: AccountType;
  debit: Prisma.Decimal;
  credit: Prisma.Decimal;
  balance: Prisma.Decimal;
}

export interface ProfitLossReport {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  incomeAccounts: AccountBalanceSummary[];
  expenseAccounts: AccountBalanceSummary[];
  totalIncome: Prisma.Decimal;
  totalExpenses: Prisma.Decimal;
  netProfit: Prisma.Decimal;
}

export interface GenerateProfitLossParams {
  startDate: Date;
  endDate: Date;
}

export class ProfitLossReportService {
  async generateReport(params: GenerateProfitLossParams): Promise<ProfitLossReport> {
    const { startDate, endDate } = params;

    if (!startDate || !endDate) {
      throw new ValidationError("startDate and endDate are required");
    }

    if (startDate > endDate) {
      throw new ValidationError("startDate cannot be after endDate");
    }

    // Fetch all posted journal entry lines within the date range
    const entryLines = await prisma.journalEntryLine.findMany({
      where: {
        journalEntry: {
          status: JournalEntryStatus.POSTED,
          accountingDate: {
            gte: startDate,
            lte: endDate,
          },
        },
        account: {
          type: {
            in: [AccountType.INCOME, AccountType.EXPENSES, AccountType.OTHER_EXPENSES],
          },
        },
      },
      include: {
        account: true,
      },
    });

    // Map by accountId
    const accountMap = new Map<string, AccountBalanceSummary>();

    for (const line of entryLines) {
      const acc = line.account;
      let existing = accountMap.get(acc.id);

      if (!existing) {
        existing = {
          accountId: acc.id,
          name: acc.name,
          type: acc.type,
          debit: new Prisma.Decimal(0),
          credit: new Prisma.Decimal(0),
          balance: new Prisma.Decimal(0),
        };
        accountMap.set(acc.id, existing);
      }

      existing.debit = existing.debit.add(line.debit);
      existing.credit = existing.credit.add(line.credit);
    }

    const incomeAccounts: AccountBalanceSummary[] = [];
    const expenseAccounts: AccountBalanceSummary[] = [];
    let totalIncome = new Prisma.Decimal(0);
    let totalExpenses = new Prisma.Decimal(0);

    for (const summary of accountMap.values()) {
      if (summary.type === AccountType.INCOME) {
        // Income = credit - debit
        summary.balance = summary.credit.sub(summary.debit);
        incomeAccounts.push(summary);
        totalIncome = totalIncome.add(summary.balance);
      } else {
        // Expense / Other Expense = debit - credit
        summary.balance = summary.debit.sub(summary.credit);
        expenseAccounts.push(summary);
        totalExpenses = totalExpenses.add(summary.balance);
      }
    }

    const netProfit = totalIncome.sub(totalExpenses);

    return {
      dateRange: {
        startDate,
        endDate,
      },
      incomeAccounts,
      expenseAccounts,
      totalIncome,
      totalExpenses,
      netProfit,
    };
  }
}

export const profitLossReportService = new ProfitLossReportService();
