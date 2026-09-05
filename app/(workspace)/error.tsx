"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  React.useEffect(() => {
    // Log exception for telemetry
    console.error("Application runtime exception:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border shadow-xl p-8 text-center space-y-6">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="h-7 w-7" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Something went wrong
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error occurred while processing your request. Our accounting ledgers and data remain safe and secured.
          </p>
          {error?.message && (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-border text-[11px] font-mono text-muted-foreground break-all text-left">
              {error.message}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => reset()}
            className="w-full sm:w-auto text-xs gap-1.5 h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </Button>

          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto text-xs bg-navy hover:bg-navy-hover text-white gap-1.5 h-9 shadow-xs"
            >
              <Home className="h-3.5 w-3.5" />
              Return to Dashboard
            </Button>
          </Link>
        </div>

        {/* Support note */}
        <div className="pt-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            LedgerOne Cloud Financials &bull; Error reference: {error?.digest || "internal-err"}
          </p>
        </div>
      </div>
    </div>
  );
}
