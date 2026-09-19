"use client";

import * as React from "react";
import { Sparkles, BarChart3, Receipt, FileSearch, Scale } from "lucide-react";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export function ChatWelcome({ onSelectPrompt }: ChatWelcomeProps) {
  const quickActions = [
    {
      icon: BarChart3,
      title: "Financial Pulse & KPIs",
      prompt: "What is our current revenue, net profit, and cash balance?",
    },
    {
      icon: Receipt,
      title: "Pending Bills & Overdue Count",
      prompt: "How many pending bills do we have and what is the total amount due?",
    },
    {
      icon: FileSearch,
      title: "Document Inspection",
      prompt: "Inspect invoice INV-2026-4001 details and line items",
    },
    {
      icon: Scale,
      title: "Bank & Cash Ledger Balances",
      prompt: "What is our live balance in the Bank and Cash accounts?",
    },
  ];

  return (
    <div className="py-6 px-3 space-y-4 text-center">
      <div className="w-11 h-11 rounded-2xl bg-teal/10 text-teal flex items-center justify-center mx-auto shadow-xs border border-teal/20">
        <Sparkles className="w-5 h-5" />
      </div>

      <div>
        <h4 className="font-bold text-xs text-slate-900 dark:text-white tracking-tight">
          LedgerOne Copilot
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
          Ask questions, inspect transactions, get exact counts, or trigger actions across the ERP.
        </p>
      </div>

      <div className="space-y-1.5 pt-2 text-left max-w-sm mx-auto">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
          Suggested Actions
        </span>
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(action.prompt)}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/90 dark:hover:bg-slate-800 transition-all flex items-center gap-2.5 group cursor-pointer shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:text-teal group-hover:border-teal/30 transition-colors">
                <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block truncate">
                  {action.title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                  {action.prompt}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
