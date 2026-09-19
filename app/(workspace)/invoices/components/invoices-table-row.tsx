"use client";

import * as React from "react";
import { Download, Loader2, DollarSign, Eye, Check, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DocumentStatus } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { InvoiceWithRelations } from "../invoices-types";

interface InvoicesTableRowProps {
  invoice: InvoiceWithRelations;
  displayStatus: string;
  confirmingInvoiceId: string | null;
  downloadingId: string | null;
  onViewInvoice: (invoice: InvoiceWithRelations) => void;
  onConfirmInvoice: (invoiceId: string) => void;
  onOpenPayment: (invoice: InvoiceWithRelations) => void;
  onDownloadPDF: (invoice: InvoiceWithRelations) => void;
}

export function InvoicesTableRow({
  invoice,
  displayStatus,
  confirmingInvoiceId,
  downloadingId,
  onViewInvoice,
  onConfirmInvoice,
  onOpenPayment,
  onDownloadPDF,
}: InvoicesTableRowProps) {
  const isDraft = invoice.status === DocumentStatus.DRAFT;
  const isConfirmed = invoice.status === DocumentStatus.CONFIRMED;
  const hasDue = Number(invoice.amountDue) > 0;

  return (
    <tr
      className="hover:bg-[#F8FAFC]/90 transition-colors group cursor-pointer"
      onClick={() => onViewInvoice(invoice)}
    >
      <td className="py-3.5 px-4 font-bold text-navy">
        <div className="flex items-center gap-1.5">
          <span>{invoice.invoiceNumber}</span>
          {invoice.salesOrder && (
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              SO: {invoice.salesOrder.soNumber}
            </span>
          )}
        </div>
      </td>

      <td className="py-3.5 px-4 font-semibold text-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-teal/10 text-teal flex items-center justify-center text-[10px] font-bold">
            {invoice.customer?.name ? invoice.customer.name.charAt(0).toUpperCase() : "C"}
          </div>
          <span>{invoice.customer?.name}</span>
        </div>
      </td>

      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      <td className="py-3.5 px-4 text-right font-medium text-foreground">
        ₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">
        ₹{Number(invoice.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      <td className="py-3.5 px-4 text-right font-semibold">
        {hasDue ? (
          <span className="text-amber-600">
            ₹{Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-muted-foreground">₹0.00</span>
        )}
      </td>

      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={displayStatus} />
      </td>

      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-navy hover:bg-slate-100 rounded-lg cursor-pointer"
                title="Invoice Options"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 bg-white border border-border shadow-dropdown rounded-xl p-1 text-xs">
              <DropdownMenuItem
                onClick={() => onViewInvoice(invoice)}
                className="gap-2 cursor-pointer text-foreground hover:text-navy hover:bg-slate-50"
              >
                <Eye className="w-3.5 h-3.5 text-navy" />
                <span>View Invoice Details</span>
              </DropdownMenuItem>

              {isDraft && (
                <DropdownMenuItem
                  disabled={confirmingInvoiceId === invoice.id}
                  onClick={() => onConfirmInvoice(invoice.id)}
                  className="gap-2 cursor-pointer text-emerald-600 hover:bg-emerald-50"
                >
                  {confirmingInvoiceId === invoice.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>Confirm & Post Journal</span>
                </DropdownMenuItem>
              )}

              {isConfirmed && hasDue && (
                <DropdownMenuItem
                  onClick={() => onOpenPayment(invoice)}
                  className="gap-2 cursor-pointer text-teal hover:bg-teal/5 font-medium"
                >
                  <DollarSign className="w-3.5 h-3.5 text-teal" />
                  <span>Record Customer Payment</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                disabled={downloadingId === invoice.id}
                onClick={() => onDownloadPDF(invoice)}
                className="gap-2 cursor-pointer text-foreground hover:bg-slate-50"
              >
                {downloadingId === invoice.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                <span>Download PDF Invoice</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
