"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, FileText, Printer, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { SerializedSalesOrder } from "../types";

interface SoHeaderProps {
  order: SerializedSalesOrder;
  confirming: boolean;
  creatingInvoice: boolean;
  cancelling: boolean;
  onConfirm: () => void;
  onCreateInvoice: () => void;
  onCancel: () => void;
}

export function SoHeader({
  order,
  confirming,
  creatingInvoice,
  cancelling,
  onConfirm,
  onCreateInvoice,
  onCancel,
}: SoHeaderProps) {
  const isInvoiced = order.invoices && order.invoices.length > 0;
  const isDraft = order.status === "DRAFT";
  const isConfirmed = order.status === "CONFIRMED";

  return (
    <div className="space-y-3">
      <Link
        href="/sales"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Sales Orders
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Sales Order #{order.soNumber}
            </h1>
            <StatusBadge status={isInvoiced ? "INVOICED" : order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Booked for <span className="font-medium text-foreground">{order.customer.name}</span> • Ordered on{" "}
            {new Date(order.orderDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Order
          </Button>

          {isDraft && (
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={confirming}
              className="h-8 text-xs bg-navy hover:bg-navy-hover text-white font-medium gap-1.5 cursor-pointer"
            >
              {confirming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Confirm Order
            </Button>
          )}

          {isConfirmed && !isInvoiced && (
            <Button
              size="sm"
              onClick={onCreateInvoice}
              disabled={creatingInvoice}
              className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer"
            >
              {creatingInvoice ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              Create Invoice
            </Button>
          )}

          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={cancelling}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20 gap-1.5 cursor-pointer"
            >
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              Cancel Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
