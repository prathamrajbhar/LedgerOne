import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-navy-light text-navy border border-navy/10",
        secondary:
          "bg-teal-light text-teal border border-teal/10",
        success:
          "bg-success-light text-success border border-success/20",
        warning:
          "bg-warning-light text-warning border border-warning/20",
        destructive:
          "bg-destructive-light text-destructive border border-destructive/20",
        info:
          "bg-info-light text-info border border-info/20",
        outline:
          "text-foreground border border-border bg-white",
        muted:
          "bg-muted text-muted-foreground border border-border/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
