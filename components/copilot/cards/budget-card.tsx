"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface BudgetCardData {
  budgetCount: number;
  budgets: Array<{
    id: string;
    name: string;
    status: string;
    period: string;
    lines: Array<{
      account: string;
      committed: number;
      achieved: number;
      percent: number;
    }>;
  }>;
}

export function BudgetCard({ data }: { data: BudgetCardData }) {
  const router = useRouter();

  return (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
        <span className="font-bold text-navy dark:text-slate-100 flex items-center gap-1.5 text-xs">
          <PieChart className="w-3.5 h-3.5 text-teal" />
          Budget & Spend Tracking
        </span>
        <Badge variant="outline" className="text-[10px]">
          {data.budgetCount} Active
        </Badge>
      </div>

      {data.budgets.map((b) => (
        <div key={b.id} className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{b.name}</span>
            <span className="text-[10px] text-slate-400">{b.period}</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {b.lines.slice(0, 3).map((l, idx) => {
              const pct = Math.min(100, Math.round(l.percent));
              const isOver = l.percent > 100;

              return (
                <div key={idx} className="space-y-0.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 truncate mr-2">{l.account}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      ₹{l.achieved.toLocaleString("en-IN")} / ₹{l.committed.toLocaleString("en-IN")} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver ? "bg-rose-500" : pct > 80 ? "bg-amber-500" : "bg-teal"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => router.push("/budgets")}
        className="w-full text-xs h-7 gap-1 font-medium cursor-pointer"
      >
        <span>View Full Budget Report</span>
        <ArrowRight className="w-3 h-3" />
      </Button>
    </div>
  );
}
