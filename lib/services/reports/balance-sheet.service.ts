/**
 * Balance Sheet Service
 * Computes deterministic Assets, Liabilities, and Equity balances
 */

import { PrismaClient, AccountType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

export interface AccountBalanceItem {
  id: string;
  name: string;
  code?: string;
  balance: Decimal;
}

export interface BalanceSheetReport {
  assets: AccountBalanceItem[];
  totalAssets: Decimal;
  liabilities: AccountBalanceItem[];
  totalLiabilities: Decimal;
  equity: AccountBalanceItem[];
  totalEquity: Decimal;
  isBalanced: boolean;
}

export class BalanceSheetService {
  async generate(asOfDate?: Date): Promise<BalanceSheetReport> {
    const dateFilter = asOfDate
      ? { journalEntry: { accountingDate: { lte: asOfDate }, status: "POSTED" as const } }
      : { journalEntry: { status: "POSTED" as const } };

    // Fetch accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where: { isArchived: false },
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

    const assets: AccountBalanceItem[] = [];
    const liabilities: AccountBalanceItem[] = [];
    const equity: AccountBalanceItem[] = [];

    let totalAssets = new Decimal(0);
    let totalLiabilities = new Decimal(0);
    let totalEquity = new Decimal(0);

    for (const acc of accounts) {
      let debitSum = new Decimal(0);
      let creditSum = new Decimal(0);

      for (const line of acc.journalEntryLines) {
        debitSum = debitSum.add(line.debit);
        creditSum = creditSum.add(line.credit);
      }

      // Assets: Normal debit balance (Debit - Credit)
      // Bank / Cash are asset types
      if (
        acc.type === AccountType.ASSET ||
        acc.type === AccountType.BANK ||
        acc.type === AccountType.CASH
      ) {
        const balance = debitSum.sub(creditSum);
        assets.push({ id: acc.id, name: acc.name, balance });
        totalAssets = totalAssets.add(balance);
      }
      // Liabilities: Normal credit balance (Credit - Debit)
      else if (acc.type === AccountType.LIABILITY) {
        const balance = creditSum.sub(debitSum);
        liabilities.push({ id: acc.id, name: acc.name, balance });
        totalLiabilities = totalLiabilities.add(balance);
      }
      // Equity / Capital: Normal credit balance (Credit - Debit)
      else if (acc.type === AccountType.CAPITAL) {
        const balance = creditSum.sub(debitSum);
        equity.push({ id: acc.id, name: acc.name, balance });
        totalEquity = totalEquity.add(balance);
      }
    }

    // Retained earnings calculation (Income - Expenses)
    let netIncome = new Decimal(0);
    for (const acc of accounts) {
      if (
        acc.type === AccountType.INCOME ||
        acc.type === AccountType.EXPENSES ||
        acc.type === AccountType.OTHER_EXPENSES
      ) {
        let d = new Decimal(0);
        let c = new Decimal(0);
        for (const line of acc.journalEntryLines) {
          d = d.add(line.debit);
          c = c.add(line.credit);
        }
        if (acc.type === AccountType.INCOME) {
          netIncome = netIncome.add(c.sub(d));
        } else {
          netIncome = netIncome.sub(d.sub(c));
        }
      }
    }

    if (!netIncome.isZero()) {
      equity.push({
        id: "retained-earnings",
        name: "Current Year Earnings",
        code: "3999",
        balance: netIncome,
      });
      totalEquity = totalEquity.add(netIncome);
    }

    const isBalanced = totalAssets.equals(totalLiabilities.add(totalEquity));

    return {
      assets,
      totalAssets,
      liabilities,
      totalLiabilities,
      equity,
      totalEquity,
      isBalanced,
    };
  }
}

export const balanceSheetService = new BalanceSheetService();
