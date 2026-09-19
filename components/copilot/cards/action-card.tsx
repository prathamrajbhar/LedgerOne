"use client";

import * as React from "react";
import { useState } from "react";
import { ShieldCheck, Check, X, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { executeCopilotAction } from "@/app/actions/copilot.actions";
import { ActionPreview } from "./action-preview";
import { ActionCompletedView } from "./action-completed";

interface ActionCardProps {
  toolName: string;
  toolCallId: string;
  input: Record<string, unknown>;
  state: string;
  output?: Record<string, unknown>;
  onAddToolResult: (params: { tool: string; toolCallId: string; state: "output-available"; output: Record<string, unknown> }) => void;
  onSelectPrompt?: (prompt: string) => void;
}

export function ActionCard({ toolName, toolCallId, input, state, output, onAddToolResult, onSelectPrompt }: ActionCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  if (state === "output-available" && output) {
    if (output.cancelled) {
      return (
        <div className="p-2.5 rounded-lg border text-[11px] flex items-start gap-2 bg-slate-100 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          <XCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Action Cancelled</span>
            <span>{String(output.message || "Operation declined by user.")}</span>
          </div>
        </div>
      );
    }

    if (output.success) {
      return (
        <ActionCompletedView
          toolName={toolName}
          input={input}
          output={output}
          onSelectPrompt={onSelectPrompt}
        />
      );
    }

    return (
      <div className="p-2.5 rounded-lg border text-[11px] flex items-start gap-2 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300">
        <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block">Action Failed</span>
          <span>{String(output.error || output.message || "Unknown error occurred.")}</span>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    try {
      const execution = await executeCopilotAction(toolName, input);
      onAddToolResult({
        tool: toolName,
        toolCallId,
        state: "output-available",
        output: execution as Record<string, unknown>,
      });
    } catch (err) {
      onAddToolResult({
        tool: toolName,
        toolCallId,
        state: "output-available",
        output: { success: false, error: (err as Error).message },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = () => {
    if (isExecuting) return;
    onAddToolResult({
      tool: toolName,
      toolCallId,
      state: "output-available",
      output: { success: false, cancelled: true, message: "Action was cancelled by user." },
    });
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          Action Approval Required
        </span>
        <Badge variant="outline" className="text-[9px] border-amber-400 text-amber-700 dark:text-amber-300">
          Sensitive
        </Badge>
      </div>

      <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded">
        <ActionPreview toolName={toolName} input={input} />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          disabled={isExecuting}
          onClick={handleApprove}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 gap-1 font-medium cursor-pointer"
        >
          {isExecuting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </>
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isExecuting}
          onClick={handleCancel}
          className="flex-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs h-7 gap-1 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </Button>
      </div>
    </div>
  );
}
