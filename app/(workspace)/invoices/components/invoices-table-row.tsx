"use client";

import * as React from "react";
import { Download, Loader2, DollarSign, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DocumentStatus } from "@prisma/client";
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
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewInvoice(invoice)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-navy hover:bg-navy/5 cursor-pointer"
            title="View Invoice Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {isDraft && (
            <Button
              variant="ghost"
              size="sm"
              disabled={confirmingInvoiceId === invoice.id}
              onClick={() => onConfirmInvoice(invoice.id)}
              className="h-7 px-2 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1 cursor-pointer"
              title="Confirm Invoice"
            >
              {confirmingInvoiceId === invoice.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Confirm
                </>
              )}
            </Button>
          )}

          {isConfirmed && hasDue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenPayment(invoice)}
              className="h-7 px-2 text-[11px] font-medium text-teal hover:text-teal/90 hover:bg-teal/10 gap-1 cursor-pointer"
              title="Record Payment"
            >
              <DollarSign className="w-3 h-3" />
              Pay
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            disabled={downloadingId === invoice.id}
            onClick={() => onDownloadPDF(invoice)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Download PDF"
          >
            {downloadingId === invoice.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
