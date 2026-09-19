"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

interface CopilotLauncherProps {
  onOpen: () => void;
}

export function CopilotLauncher({ onOpen }: CopilotLauncherProps) {
  return (
    <button
      onClick={onOpen}
      className="fixed top-1/2 -translate-y-1/2 right-0 z-40 group flex items-center gap-2.5 py-2 pl-3 pr-2.5 rounded-l-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white border-y border-l border-teal/40 hover:border-teal/90 shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_0_24px_rgba(20,184,166,0.35)] translate-x-[calc(100%-42px)] hover:translate-x-0 transition-all duration-300 ease-out cursor-pointer active:scale-95 select-none"
      title="Open LedgerOne Copilot (⌘J / Ctrl+J)"
      aria-label="Open LedgerOne Copilot"
    >
      {/* Glowing AI Sparkle Icon with Live Indicator */}
      <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-teal/15 group-hover:bg-teal/25 text-teal border border-teal/30 group-hover:border-teal/60 transition-all duration-300 shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-teal animate-pulse" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal" />
        </span>
      </div>

      {/* Expanded Label & Hotkey Revealed on Hover */}
      <div className="flex items-center gap-2 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold tracking-tight text-white flex items-center gap-1.5">
            Copilot
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal/20 text-teal border border-teal/30">AI</span>
          </span>
          <span className="text-[10px] text-slate-400">Ask finance & ERP</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-400 bg-slate-800/90 border border-slate-700/80 rounded shadow-xs ml-1">
          ⌘J
        </kbd>
      </div>
    </button>
  );
}
