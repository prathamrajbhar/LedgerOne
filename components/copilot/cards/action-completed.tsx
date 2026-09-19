"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSuggestionConfig } from "./action-suggestion-config";

interface ActionCompletedViewProps {
  toolName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  onSelectPrompt?: (prompt: string) => void;
}

export function ActionCompletedView({ toolName, input, output, onSelectPrompt }: ActionCompletedViewProps) {
  const router = useRouter();
  const config = getSuggestionConfig(toolName, input, output);

  return (
    <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2.5 text-[11px]">
      <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <span className="font-semibold block text-xs">Action Completed Successfully</span>
          <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-normal">
            {String(output.message || "Operation completed successfully.")}
          </p>
        </div>
      </div>

      {/* Navigation button */}
      <div className="pt-1 flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(config.navPath)}
          className="h-6 px-2 text-[10px] gap-1 border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 cursor-pointer"
        >
          <ExternalLink className="w-3 h-3" />
          <span>{config.navLabel}</span>
        </Button>
      </div>

      {/* Next suggested prompt pills */}
      {config.prompts.length > 0 && onSelectPrompt && (
        <div className="pt-1.5 border-t border-emerald-200/70 dark:border-emerald-800/70 space-y-1.5">
          <span className="text-[10px] font-medium text-emerald-900 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            Suggested Next Steps:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {config.prompts.map((promptText, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelectPrompt(promptText)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700/80 text-[10px] font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-400 transition-colors cursor-pointer text-left"
              >
                <span>{promptText}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-60 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
