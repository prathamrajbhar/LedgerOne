"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const safeMax = max > 0 ? max : 100;
    const clamped = Math.min(Math.max(((value || 0) / safeMax) * 100, 0), 100);
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-teal transition-all duration-300 ease-in-out",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - clamped}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
