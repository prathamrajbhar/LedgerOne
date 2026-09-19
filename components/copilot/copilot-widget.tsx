"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Bot, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { CopilotChat } from "./copilot-chat";

export interface CopilotWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function CopilotWidget({
  isOpen,
  onOpen,
  onClose,
  isExpanded,
  onToggleExpand,
}: CopilotWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <>
      {/* Right Edge Half-Hidden Floating Launcher Tab when Closed */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-40 flex items-center justify-start pl-2 w-11 h-13 rounded-l-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-r-0 border-teal/40 dark:border-teal/50 shadow-xl hover:shadow-2xl translate-x-5 hover:translate-x-0 transition-all duration-300 ease-out group cursor-pointer"
          title="Open LedgerOne Copilot (Docked)"
          aria-label="Open LedgerOne Copilot"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-teal/10 group-hover:bg-teal/20 text-teal transition-colors">
            <Sparkles className="w-4 h-4 text-teal animate-pulse group-hover:scale-110 transition-transform duration-200" />
          </div>
        </button>
      )}

      {/* Docked Side-by-Side Right Sidebar (No Overlap on Desktop) */}
      {isOpen && (
        <aside
          ref={sidebarRef}
          className={`h-screen flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 transition-all duration-300 ease-in-out fixed sm:relative top-0 right-0 z-50 sm:z-20 ${
            isExpanded ? "w-full sm:w-[540px]" : "w-full sm:w-[390px] lg:w-[410px]"
          }`}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-3 bg-navy text-white shrink-0 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center border border-white/15">
                <Bot className="h-3.5 w-3.5 text-teal" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">LedgerOne Copilot</span>
                <span className="inline-flex items-center text-[9px] font-semibold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  Agentic
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Reset Thread */}
              <button
                onClick={() => setResetCounter((c) => c + 1)}
                title="Start New Chat"
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="New Chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Toggle Width */}
              <button
                onClick={onToggleExpand}
                title={isExpanded ? "Collapse View (400px)" : "Expand View (540px)"}
                className="hidden sm:inline-flex p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={isExpanded ? "Collapse Panel" : "Expand Panel"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>

              {/* Close / Undock */}
              <button
                onClick={onClose}
                title="Close Copilot"
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Copilot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Full Height Chat Body */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CopilotChat resetTrigger={resetCounter} />
          </div>
        </aside>
      )}
    </>
  );
}
