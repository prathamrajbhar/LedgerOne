"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Bot, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { CopilotChat } from "./copilot-chat";

export function CopilotWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Backdrop overlay for mobile / focus */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-[1px] z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Right Edge Half-Hidden Floating Launcher Tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-40 flex items-center justify-start pl-2.5 w-12 h-13 rounded-l-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-r-0 border-teal/40 dark:border-teal/50 shadow-xl hover:shadow-2xl translate-x-5 hover:translate-x-0 transition-all duration-300 ease-out group cursor-pointer"
          title="Open LedgerOne Copilot"
          aria-label="Open LedgerOne Copilot"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-teal/10 group-hover:bg-teal/20 text-teal transition-colors">
            <Sparkles className="w-5 h-5 text-teal animate-pulse group-hover:scale-110 transition-transform duration-200" />
          </div>
        </button>
      )}

      {/* Full-Height Right Sidebar Drawer */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 right-0 bottom-0 z-50 h-screen flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ease-in-out ${
          open ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        } ${isExpanded ? "w-full sm:w-[580px]" : "w-full sm:w-[420px]"}`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-navy text-white shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/15">
              <Bot className="h-4 w-4 text-teal" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">LedgerOne Copilot</span>
                <span className="inline-flex items-center text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  Agentic
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* New Chat Reset Button */}
            <button
              onClick={() => setResetCounter((c) => c + 1)}
              title="Start New Chat"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="New Chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Expand / Minimize Width Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse View (420px)" : "Expand View (580px)"}
              className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={isExpanded ? "Collapse Panel" : "Expand Panel"}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              title="Close Copilot"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Copilot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Body - Takes full remaining height */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <CopilotChat resetTrigger={resetCounter} />
        </div>
      </aside>
    </>
  );
}
