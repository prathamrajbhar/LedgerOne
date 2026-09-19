"use client";

import * as React from "react";
import { Landmark, ArrowUpRight, ArrowDownLeft, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AccountBalanceSummary } from "@/lib/copilot/accounting-querier";

export interface AccountBalanceCardData {
  accountsCount: number;
  aggregateDebit: number;
  aggregateCredit: number;
  accounts: AccountBalanceSummary[];
}

interface AccountBalanceCardProps {
  data: AccountBalanceCardData;
}

export function AccountBalanceCard({ data }: AccountBalanceCardProps) {
  const accounts = data?.accounts || [];

  return (
    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
              Live Account Balances
            </span>
            <span className="text-[10px] text-slate-500">
              {accounts.length} {accounts.length === 1 ? "account" : "accounts"} retrieved
            </span>
          </div>
        </div>
        <Link
          href="/accounts"
          className="text-[10px] text-teal hover:underline flex items-center gap-0.5 font-medium"
        >
          View Chart
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]"
          >
            <div className="space-y-0.5 max-w-[55%]">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {acc.name}
                </span>
                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-slate-300 dark:border-slate-700">
                  {acc.code}
                </Badge>
              </div>
              <span className="text-[10px] text-slate-400 block">{acc.type}</span>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 block">
                ₹{Math.abs(acc.netBalance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[9px] text-slate-500 flex items-center justify-end gap-0.5">
                {acc.netBalance >= 0 ? (
                  <ArrowDownLeft className="w-2.5 h-2.5 text-emerald-500 inline" />
                ) : (
                  <ArrowUpRight className="w-2.5 h-2.5 text-rose-500 inline" />
                )}
                {acc.normalSide}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Scale className="w-3 h-3 text-slate-400" />
          Aggregate Ledger
        </span>
        <span className="font-mono">
          Dr: ₹{data.aggregateDebit?.toLocaleString("en-IN", { maximumFractionDigits: 0 })} | Cr: ₹{data.aggregateCredit?.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}
