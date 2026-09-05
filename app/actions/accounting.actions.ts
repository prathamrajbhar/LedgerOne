"use server";

import { journalEntryService } from "@/lib/services/journal-entry.service";
import { profitLossReportService, GenerateProfitLossParams } from "@/lib/services/reports/profit-loss.service";
import { balanceSheetService, BalanceSheetParams } from "@/lib/services/reports/balance-sheet.service";
import { Decimal } from "@prisma/client/runtime/library";
import { JournalEntryStatus, JournalEntrySource } from "@prisma/client";

export interface CreateJournalEntryActionInput {
  journalId: string;
  accountingDate: Date;
  lines: {
    accountId: string;
    partnerId?: string;
    debit: number;
    credit: number;
  }[];
  userId: string;
}

export async function createManualJournalEntryAction(input: CreateJournalEntryActionInput) {
  try {
    const formattedLines = input.lines.map((line) => ({
      accountId: line.accountId,
      partnerId: line.partnerId,
      debit: new Decimal(line.debit),
      credit: new Decimal(line.credit),
    }));

    const entry = await journalEntryService.createManual({
      journalId: input.journalId,
      accountingDate: input.accountingDate,
      lines: formattedLines,
      userId: input.userId,
    });

    return { success: true, data: entry };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to create manual journal entry" };
  }
}

export async function postJournalEntryAction(id: string) {
  try {
    const entry = await journalEntryService.post(id);
    return { success: true, data: entry };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to post journal entry" };
  }
}

export async function resetJournalEntryToDraftAction(id: string) {
  try {
    const entry = await journalEntryService.resetToDraft(id);
    return { success: true, data: entry };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to reset journal entry to draft" };
  }
}

export async function generateProfitLossReportAction(params: GenerateProfitLossParams) {
  try {
    const report = await profitLossReportService.generateReport(params);
    return { success: true, data: report };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to generate Profit & Loss report" };
  }
}

export async function generateBalanceSheetAction(params: BalanceSheetParams) {
  try {
    const report = await balanceSheetService.generate(params);
    return { success: true, data: report };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to generate Balance Sheet report" };
  }
}

export interface GetJournalEntriesFilters {
  search?: string;
  status?: JournalEntryStatus;
  source?: JournalEntrySource;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
}

export async function getJournalEntriesAction(filters?: GetJournalEntriesFilters) {
  try {
    const result = await journalEntryService.list(filters || {});
    return { success: true, data: result };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch journal entries" };
  }
}

export async function getJournalEntryByIdAction(id: string) {
  try {
    const entry = await journalEntryService.getById(id);
    return { success: true, data: entry };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch journal entry details" };
  }
}
