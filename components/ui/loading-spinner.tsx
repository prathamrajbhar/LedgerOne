import * as React from "react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | number;
}) {
  const sizeClass =
    typeof size === "string"
      ? {
          sm: "h-4 w-4 border-2",
          md: "h-8 w-8 border-2",
          lg: "h-12 w-12 border-3",
        }[size]
      : "";

  return (
    <div className="flex items-center justify-center p-4">
      <div
        style={typeof size === "number" ? { width: size, height: size } : undefined}
        className={cn(
          "animate-spin rounded-full border-solid border-navy/20 border-t-navy border-2",
          sizeClass,
          className
        )}
      />
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted-foreground/10",
        className
      )}
      {...props}
    />
  );
}
