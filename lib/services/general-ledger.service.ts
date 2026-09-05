import { prisma } from "@/lib/prisma";
import { AccountType, JournalEntryStatus } from "@prisma/client";

export interface GeneralLedgerParams {
  accountId: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: "ALL" | "POSTED" | "DRAFT";
}

export interface GeneralLedgerLineItem {
  id: string;
  date: Date;
  entryNumber: string;
  entryId: string;
  partner?: {
    id: string;
    name: string;
  };
  debit: number;
  credit: number;
  balance: number;
  status: string;
  journalName: string;
  journalCode: string;
}

export interface AccountLedgerResult {
  account: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
  };
  lines: GeneralLedgerLineItem[];
  summary: {
    totalDebit: number;
    totalCredit: number;
    balance: number;
    lineCount: number;
  };
}

export class GeneralLedgerService {
  /**
   * Get general ledger lines and running balance for a given account
   */
  async getAccountLedger(params: GeneralLedgerParams): Promise<AccountLedgerResult> {
    const { accountId, startDate, endDate, status = "ALL" } = params;

    // 1. Fetch account details
    const account = await prisma.chartOfAccount.findUnique({
      where: { id: accountId },
      select: { id: true, code: true, name: true, type: true },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Normal debit balance types (Assets, Expenses, Other Expenses)
    const isDebitNormal =
      account.type === AccountType.ASSET ||
      account.type === AccountType.EXPENSES ||
      account.type === AccountType.OTHER_EXPENSES;

    // Date filters
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (startDate) {
      dateFilter.gte = typeof startDate === "string" ? new Date(startDate) : startDate;
    }
    if (endDate) {
      dateFilter.lte = typeof endDate === "string" ? new Date(endDate) : endDate;
    }

    // Status filter
    const statusFilter: { in?: JournalEntryStatus[] } = {};
    if (status === "POSTED") {
      statusFilter.in = [JournalEntryStatus.POSTED];
    } else if (status === "DRAFT") {
      statusFilter.in = [JournalEntryStatus.DRAFT];
    }

    // 2. Fetch journal lines for this account
    const lines = await prisma.journalEntryLine.findMany({
      where: {
        accountId,
        journalEntry: {
          ...(Object.keys(dateFilter).length > 0 && { accountingDate: dateFilter }),
          ...(statusFilter.in && { status: { in: statusFilter.in } }),
        },
      },
      include: {
        partner: {
          select: { id: true, name: true },
        },
        journalEntry: {
          select: {
            id: true,
            entryNumber: true,
            accountingDate: true,
            status: true,
            journal: {
              select: { name: true, code: true },
            },
          },
        },
      },
      orderBy: {
        journalEntry: {
          accountingDate: "asc",
        },
      },
    });

    // 3. Compute running balance
    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    const formattedLines: GeneralLedgerLineItem[] = lines.map((line) => {
      const debit = Number(line.debit);
      const credit = Number(line.credit);

      totalDebit += debit;
      totalCredit += credit;

      if (isDebitNormal) {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }

      return {
        id: line.id,
        date: line.journalEntry.accountingDate,
        entryNumber: line.journalEntry.entryNumber,
        entryId: line.journalEntry.id,
        partner: line.partner || undefined,
        debit,
        credit,
        balance: runningBalance,
        status: line.journalEntry.status,
        journalName: line.journalEntry.journal.name,
        journalCode: line.journalEntry.journal.code,
      };
    });

    return {
      account,
      lines: formattedLines,
      summary: {
        totalDebit,
        totalCredit,
        balance: runningBalance,
        lineCount: formattedLines.length,
      },
    };
  }

  /**
   * Get total balance of an account as of a specific date
   */
  async getAccountBalance(accountId: string, asOfDate?: Date | string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id: accountId },
      select: { id: true, type: true },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    const dateFilter = asOfDate
      ? { lte: typeof asOfDate === "string" ? new Date(asOfDate) : asOfDate }
      : undefined;

    const aggregate = await prisma.journalEntryLine.aggregate({
      where: {
        accountId,
        ...(dateFilter && {
          journalEntry: {
            accountingDate: dateFilter,
            status: JournalEntryStatus.POSTED,
          },
        }),
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const totalDebit = Number(aggregate._sum.debit || 0);
    const totalCredit = Number(aggregate._sum.credit || 0);

    const isDebitNormal =
      account.type === AccountType.ASSET ||
      account.type === AccountType.EXPENSES ||
      account.type === AccountType.OTHER_EXPENSES;

    const balance = isDebitNormal ? totalDebit - totalCredit : totalCredit - totalDebit;

    return {
      accountId,
      balance,
      totalDebit,
      totalCredit,
      asOfDate: asOfDate ? (typeof asOfDate === "string" ? new Date(asOfDate) : asOfDate) : new Date(),
    };
  }
}

export const generalLedgerService = new GeneralLedgerService();
