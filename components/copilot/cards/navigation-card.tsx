"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavigationCardProps {
  input: {
    path: string;
    label: string;
    description?: string;
  };
}

export function NavigationCard({ input }: NavigationCardProps) {
  const router = useRouter();

  return (
    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-teal/30 shadow-xs space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-teal text-[11px] flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" />
          Page Navigation
        </span>
        <Badge variant="outline" className="text-[9px] border-teal/30 text-teal">
          Route
        </Badge>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-300">
        Navigating to: <strong className="text-slate-900 dark:text-white">{input?.label || input?.path}</strong>
      </p>
      {input?.description && (
        <p className="text-[10px] text-slate-500 italic">{input.description}</p>
      )}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => router.push(input?.path)}
        className="w-full text-xs h-7 gap-1 font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        <span>Open {input?.label || "Page"}</span>
        <ArrowRight className="w-3 h-3" />
      </Button>
    </div>
  );
}
