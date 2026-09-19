"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { X, Bot, RotateCcw, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { CopilotLauncher } from "./copilot-launcher";
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

  // Global hotkey to toggle Copilot (Cmd+J / Ctrl+J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpen, onClose]);

  if (!mounted) return null;

  return (
    <>
      {!isOpen && <CopilotLauncher onOpen={onOpen} />}

      {isOpen && (
        <aside
          style={{ width: typeof window !== "undefined" && window.innerWidth < 640 ? "100vw" : `${width}px` }}
          className={`h-screen flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 fixed sm:relative top-0 right-0 z-50 sm:z-20 w-full sm:w-auto max-w-full sm:max-w-[90vw] ${
            !isDragging ? "transition-[width] duration-200 ease-out" : ""
          }`}
        >
          {/* Draggable Left Resize Handle (Desktop only) */}
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={() => setWidth(DEFAULT_WIDTH)}
            title="Drag to resize width (Double-click to reset)"
            className="hidden sm:flex absolute -left-1.5 top-0 bottom-0 w-3 cursor-col-resize z-30 group items-center justify-center hover:bg-teal/20 transition-colors"
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
              <button
                onClick={() => setResetCounter((c) => c + 1)}
                title="Start New Chat"
                className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="New Chat"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={handleToggleExpand}
                title={isExpanded ? "Collapse View (410px)" : "Expand View (600px)"}
                className="hidden sm:inline-flex p-1 rounded text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={isExpanded ? "Collapse Panel" : "Expand Panel"}
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={onClose}
                title="Close Copilot (⌘J)"
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
