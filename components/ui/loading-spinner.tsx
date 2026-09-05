import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 32 }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2
        style={{ width: size, height: size }}
        className={cn("animate-spin text-primary", className)}
      />
    </div>
  );
}
