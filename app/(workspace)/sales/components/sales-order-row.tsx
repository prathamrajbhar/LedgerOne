"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Eye } from "lucide-react";
import type { SalesOrderItem } from "./sales-orders-table";

interface SalesOrderRowProps {
  order: SalesOrderItem;
  actionLoading: string | null;
  onConfirmOrder: (id: string) => void;
  onCreateInvoice: (id: string) => void;
}

export function SalesOrderRow({
  order: so,
  actionLoading,
  onConfirmOrder,
  onCreateInvoice,
}: SalesOrderRowProps) {
  const router = useRouter();
  const isInvoiced = so.status === "INVOICED" || (so.invoices && so.invoices.length > 0);

  const formatDate = (d: string | Date) => {
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <tr
      onClick={() => router.push(`/sales/${so.id}`)}
      className="hover:bg-primary-light/30 cursor-pointer transition-colors"
    >
      <td className="py-3.5 px-4 font-mono font-bold text-navy">
        <Link href={`/sales/${so.id}`} className="hover:underline">
          {so.soNumber}
        </Link>
      </td>
      <td className="py-3.5 px-4 font-semibold text-foreground">
        {so.customer?.name || "N/A"}
      </td>
      <td className="py-3.5 px-4 text-muted-foreground">{formatDate(so.orderDate)}</td>
      <td className="py-3.5 px-4 text-center text-muted-foreground">{so.lines?.length || 0}</td>
      <td className="py-3.5 px-4 text-right font-bold text-foreground">
        ₹{Number(so.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>
      <td className="py-3.5 px-4 text-center">
        <StatusBadge status={isInvoiced ? "INVOICED" : so.status} />
      </td>
      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-2">
          <Link
            href={`/sales/${so.id}`}
            className="inline-flex items-center gap-1 text-xs text-navy font-medium hover:underline px-2 py-1 rounded-md hover:bg-navy/5"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
          {so.status === "DRAFT" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onConfirmOrder(so.id)}
              disabled={actionLoading === so.id}
              className="gap-1.5"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {actionLoading === so.id ? "Confirming..." : "Confirm"}
            </Button>
          )}
          {so.status === "CONFIRMED" && !isInvoiced && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCreateInvoice(so.id)}
              disabled={actionLoading === so.id}
              className="gap-1.5 text-navy border-navy hover:bg-navy hover:text-white"
            >
              <FileText className="h-3.5 w-3.5" />
              {actionLoading === so.id ? "Creating..." : "Create Invoice"}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
