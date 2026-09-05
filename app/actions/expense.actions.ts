"use server";

import { JournalEntrySource } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ExpenseRecord {
  id: string;
  code: string;
  description: string;
  expenseAccount: string;
  analyticAccount: string | null;
  date: string;
  amount: number;
  paymentMethod: string;
}

export async function getExpensesAction() {
  try {
    // Fetch manual journal entries (expenses are manual entries with expense accounts)
    const entries = await prisma.journalEntry.findMany({
      where: {
        source: JournalEntrySource.MANUAL,
        status: "POSTED",
      },
      include: {
        journal: true,
        lines: {
          include: {
            account: true,
            partner: true,
          },
        },
      },
      orderBy: {
        accountingDate: "desc",
      },
    });

    // Filter for expense entries (entries with expense account debits)
    const expenseEntries = entries.filter((entry) =>
      entry.lines.some(
        (line) =>
          line.debit.greaterThan(0) &&
          (line.account.type === "EXPENSES" || line.account.type === "OTHER_EXPENSES")
      )
    );

    const expenses: ExpenseRecord[] = expenseEntries.map((entry) => {
      const expenseLine = entry.lines.find(
        (line) =>
          line.debit.greaterThan(0) &&
          (line.account.type === "EXPENSES" || line.account.type === "OTHER_EXPENSES")
      );

      return {
        id: entry.id,
        code: entry.entryNumber,
        description: expenseLine?.account.name || "Expense Entry",
        expenseAccount: expenseLine?.account.name || "N/A",
        analyticAccount: expenseLine?.partner?.name || null,
        date: entry.accountingDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        amount: expenseLine?.debit.toNumber() || 0,
        paymentMethod: entry.journal.type === "BANK" ? "Bank Transfer" : "Cash Payment",
      };
    });

    return { success: true, data: expenses };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch expenses" };
  }
}

export interface ExpenseAccount {
  id: string;
  name: string;
  type: string;
}

export async function getExpenseAccountsAction() {
  try {
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        type: {
          in: ["EXPENSES", "OTHER_EXPENSES"],
        },
        isArchived: false,
      },
      orderBy: {
        name: "asc",
      },
    });

    const expenseAccounts: ExpenseAccount[] = accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
    }));

    return { success: true, data: expenseAccounts };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch expense accounts" };
  }
}

export interface AnalyticAccountOption {
  id: string;
  name: string;
  type: string;
}

export async function getAnalyticAccountsAction() {
  try {
    const accounts = await prisma.analyticAccount.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const analyticAccounts: AnalyticAccountOption[] = accounts.map((acc) => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
    }));

    return { success: true, data: analyticAccounts };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch analytic accounts" };
  }
}

export interface JournalOption {
  id: string;
  name: string;
  type: string;
  defaultAccountId: string;
  defaultAccountName: string;
}

export async function getBankCashJournalsAction() {
  try {
    const journals = await prisma.journal.findMany({
      where: {
        type: {
          in: ["BANK", "CASH"],
        },
      },
      include: {
        defaultAccount: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    const journalOptions: JournalOption[] = journals.map((j) => ({
      id: j.id,
      name: j.name,
      type: j.type,
      defaultAccountId: j.defaultAccountId,
      defaultAccountName: j.defaultAccount.name,
    }));

    return { success: true, data: journalOptions };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch journals" };
  }
}
