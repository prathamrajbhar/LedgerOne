"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Bot, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { CopilotChat } from "./copilot-chat";

export function CopilotWidget() {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (open && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50">
      {/* Drawer Container */}
      <div
        className={`fixed bottom-[66px] right-3 sm:bottom-[74px] sm:right-5 z-50 w-[calc(100vw-1.5rem)] ${
          isExpanded ? "sm:w-[540px]" : "sm:w-[380px]"
        } h-[500px] sm:h-[560px] max-h-[calc(100vh-90px)] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-all duration-200 ease-out origin-bottom-right ${
          open
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-2.5 bg-navy text-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/15">
              <Bot className="h-3.5 w-3.5 text-teal" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">LedgerOne Copilot</span>
                <span className="inline-flex items-center text-[9px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
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
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="New Chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Expand / Minimize Width Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Collapse View" : "Expand View"}
              className="hidden sm:inline-flex p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={isExpanded ? "Collapse Panel" : "Expand Panel"}
            >
              {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Copilot"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-hidden">
          <CopilotChat resetTrigger={resetCounter} />
        </div>
      </div>

      {/* Launcher Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full shadow-md hover:shadow-lg transition-all duration-200 border cursor-pointer ${
          open
            ? "bg-navy text-white border-navy"
            : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-navy dark:text-white border-slate-200 dark:border-slate-700"
        }`}
        aria-label={open ? "Close Copilot" : "Open Copilot"}
      >
        {open ? (
          <X className="h-5 w-5 text-white transition-transform duration-200" />
        ) : (
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-teal animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
}
