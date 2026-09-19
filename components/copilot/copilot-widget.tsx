"use client";

import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Bot, RotateCcw, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { CopilotChat } from "./copilot-chat";

export interface CopilotWidgetProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const STORAGE_WIDTH_KEY = "ledgerone_copilot_panel_width";
const DEFAULT_WIDTH = 410;
const MIN_WIDTH = 340;

export function CopilotWidget({ isOpen, onOpen, onClose }: CopilotWidgetProps) {
  const [mounted, setMounted] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const isExpanded = width >= 560;

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_WIDTH_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH) setWidth(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Drag-to-resize handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxWidth = Math.min(850, window.innerWidth * 0.65);
      const newWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, window.innerWidth - e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(STORAGE_WIDTH_KEY, width.toString());
      } catch {
        // ignore
      }
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, width]);

  // Toggle quick expand
  const handleToggleExpand = () => {
    const nextWidth = isExpanded ? DEFAULT_WIDTH : 600;
    setWidth(nextWidth);
    try {
      localStorage.setItem(STORAGE_WIDTH_KEY, nextWidth.toString());
    } catch {
      // ignore
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Right Edge Half-Hidden Floating Launcher Tab when Closed */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed top-1/2 -translate-y-1/2 right-0 z-40 flex items-center justify-start pl-2 w-11 h-13 rounded-l-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-r-0 border-teal/40 dark:border-teal/50 shadow-xl hover:shadow-2xl translate-x-5 hover:translate-x-0 transition-all duration-300 ease-out group cursor-pointer"
          title="Open LedgerOne Copilot"
          aria-label="Open LedgerOne Copilot"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-teal/10 group-hover:bg-teal/20 text-teal transition-colors">
            <Sparkles className="w-4 h-4 text-teal animate-pulse group-hover:scale-110 transition-transform duration-200" />
          </div>
        </button>
      )}

      {/* Docked Side-by-Side Right Sidebar with Draggable Resize Handle */}
      {isOpen && (
        <aside
          style={{ width: `${width}px` }}
          className={`h-screen flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 fixed sm:relative top-0 right-0 z-50 sm:z-20 max-w-[90vw] ${
            !isDragging ? "transition-[width] duration-200 ease-out" : ""
          }`}
        >
          {/* Draggable Left Resize Handle */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
            title="Drag to resize width (Double-click to reset)"
            className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 group flex items-center justify-center hover:bg-teal/20 transition-colors"
          >
            <div className="w-1 h-8 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-teal transition-colors flex items-center justify-center">
              <GripVertical className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover:opacity-100" />
            </div>
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-white shrink-0 border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-teal/15 flex items-center justify-center border border-teal/25">
                <Bot className="h-3.5 w-3.5 text-teal" />
              </div>
              <span className="text-xs font-semibold text-white tracking-tight">LedgerOne Copilot</span>
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
                onClick={handleToggleExpand}
                title={isExpanded ? "Collapse View (410px)" : "Expand View (600px)"}
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
