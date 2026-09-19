"use client";

import * as React from "react";
import { Sparkles, BarChart3, Receipt, FileSearch, Scale } from "lucide-react";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export function ChatWelcome({ onSelectPrompt }: ChatWelcomeProps) {
  const suggestions = [
    {
      icon: BarChart3,
      label: "Financial Pulse & KPIs",
      prompt: "What is our current revenue, net profit, and cash balance?",
    },
    {
      icon: Receipt,
      label: "Pending Bills & Due Dates",
      prompt: "How many pending bills do we have and what is the total amount due?",
    },
    {
      icon: Scale,
      label: "Bank & Cash Balances",
      prompt: "What is our live balance in the Bank and Cash accounts?",
    },
    {
      icon: FileSearch,
      label: "Inspect Document (INV-2026-4001)",
      prompt: "Inspect invoice INV-2026-4001 details and line items",
    },
  ];

  return (
    <div className="py-8 px-2 space-y-5 text-center">
      <div className="space-y-1.5">
        <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center mx-auto">
          <Sparkles className="w-5 h-5" />
        </div>
        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
          How can I help you today?
        </h4>
        <p className="text-[11px] text-slate-500 max-w-[260px] mx-auto">
          Ask questions, inspect records, or execute ERP operations.
        </p>
      </div>

      <div className="space-y-1.5 text-left max-w-sm mx-auto pt-1">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2.5 group cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal shrink-0 transition-colors" />
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
