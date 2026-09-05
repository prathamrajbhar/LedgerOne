"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Workspace error boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] p-6 text-center max-w-md mx-auto">
      <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {error.message ||
          "An unexpected error occurred while loading this workspace section. Please try again."}
      </p>
      <Button onClick={reset} className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
