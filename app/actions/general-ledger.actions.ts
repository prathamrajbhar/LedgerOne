"use server";

import { generalLedgerService, GeneralLedgerParams } from "@/lib/services/general-ledger.service";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get general ledger for a specific account
 */
export async function getGeneralLedgerAction(params: GeneralLedgerParams): Promise<ActionResult> {
  try {
    const ledger = await generalLedgerService.getAccountLedger(params);

    // Convert Decimal to number for client consumption
    const serializedLedger = {
      account: ledger.account,
      lines: ledger.lines.map((line) => ({
        ...line,
        debit: Number(line.debit),
        credit: Number(line.credit),
        balance: Number(line.balance),
      })),
      summary: {
        totalDebit: Number(ledger.summary.totalDebit),
        totalCredit: Number(ledger.summary.totalCredit),
        balance: Number(ledger.summary.balance),
        lineCount: ledger.summary.lineCount,
      },
    };

    return {
      success: true,
      data: serializedLedger,
    };
  } catch (error) {
    console.error("Error fetching general ledger:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch general ledger";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get account balance as of a specific date
 */
export async function getAccountBalanceAction(accountId: string, asOfDate?: Date): Promise<ActionResult> {
  try {
    const balance = await generalLedgerService.getAccountBalance(accountId, asOfDate);

    // Convert Decimal to number for client consumption
    const serializedBalance = {
      ...balance,
      balance: Number(balance.balance),
      totalDebit: Number(balance.totalDebit),
      totalCredit: Number(balance.totalCredit),
    };

    return {
      success: true,
      data: serializedBalance,
    };
  } catch (error) {
    console.error("Error fetching account balance:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch account balance";
    return {
      success: false,
      error: message,
    };
  }
}
