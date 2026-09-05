import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const normalized = status ? status.toUpperCase().replace(/\s+/g, "_") : "";

  let variant: "success" | "warning" | "destructive" | "default" | "secondary" | "muted" = "muted";
  let icon: React.ReactNode = null;
  const label = status ? status.replace(/_/g, " ") : "";

  switch (normalized) {
    case "PAID":
    case "RECEIVED":
    case "IN_STOCK":
    case "COMPLETED":
      variant = "success";
      icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-success" />;
      break;

    case "INVOICED":
      variant = "secondary";
      icon = <FileText className="w-3.5 h-3.5 mr-1 text-teal" />;
      break;

    case "PENDING":
    case "NOT_PAID":
    case "LOW_STOCK":
    case "DUE":
      variant = "warning";
      icon = <AlertTriangle className="w-3.5 h-3.5 mr-1 text-warning" />;
      break;

    case "OVERDUE":
    case "CANCELLED":
    case "OUT_OF_STOCK":
    case "FAILED":
      variant = "destructive";
      icon = <XCircle className="w-3.5 h-3.5 mr-1 text-destructive" />;
      break;

    case "CONFIRMED":
    case "ACTIVE":
      variant = "default";
      icon = <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-navy" />;
      break;

    case "PARTIAL":
    case "PARTIALLY_PAID":
      variant = "secondary";
      icon = <Clock className="w-3.5 h-3.5 mr-1 text-teal" />;
      break;

    case "DRAFT":
    default:
      variant = "muted";
      icon = <FileText className="w-3.5 h-3.5 mr-1 text-muted-foreground" />;
      break;
  }

  const formattedLabel = label
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Badge
      variant={variant}
      className={cn(
        "font-medium py-0.5 px-2.5 text-xs inline-flex items-center",
        className
      )}
    >
      {showIcon && icon}
      <span>{formattedLabel}</span>
    </Badge>
  );
}
