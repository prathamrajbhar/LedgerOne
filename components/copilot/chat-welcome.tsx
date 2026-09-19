"use client";

import * as React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface ChatWelcomeProps {
  onSelectPrompt: (prompt: string) => void;
}

export function ChatWelcome({ onSelectPrompt }: ChatWelcomeProps) {
  const suggestedQueries = [
    "How many pending bills do we have and what is the total?",
    "What is our net profit & overdue invoices count?",
    "Show me line items for invoice INV-2026-4009",
    "Are we on track with our Q3 budgets?",
    "Take me to the customer invoices page",
  ];

  return (
    <div className="py-5 px-2 space-y-3.5 text-center">
      <div className="w-10 h-10 rounded-2xl bg-teal/10 text-teal flex items-center justify-center mx-auto shadow-inner">
        <Sparkles className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
          LedgerOne Autonomous Copilot
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs mx-auto leading-relaxed">
          Ask questions, inspect transactions, get exact counts, or trigger actions across the ERP.
        </p>
      </div>

      <div className="space-y-1 pt-1 text-left max-w-sm mx-auto">
        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1">
          Suggested Queries
        </span>
        {suggestedQueries.map((query, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(query)}
            className="w-full text-left text-[11px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-between group cursor-pointer"
          >
            <span className="text-slate-700 dark:text-slate-200 truncate mr-2">{query}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
