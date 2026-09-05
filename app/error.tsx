"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root application exception:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans antialiased">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">System Error</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              We encountered an issue loading the application. Please reload or click the button below to recover.
            </p>
          </div>

          <Button
            onClick={() => reset()}
            className="text-xs bg-[#16324F] hover:bg-[#0F2338] text-white gap-1.5 h-9 w-full"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reload LedgerOne
          </Button>
        </div>
      </body>
    </html>
  );
}
