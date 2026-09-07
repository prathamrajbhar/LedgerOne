"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowLeft,
  Download,
  Printer,
  DollarSign,
  Ban,
  Check,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { DocumentStatus } from "@prisma/client";
import { SerializedInvoiceData } from "../types";

interface InvoiceHeaderProps {
  invoice: SerializedInvoiceData;
  displayStatus: string;
  downloading: boolean;
  confirming: boolean;
  cancelling: boolean;
  sendingEmail?: boolean;
  sendingReminder?: boolean;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onConfirmInvoice: () => void;
  onOpenPaymentModal: () => void;
  onCancelInvoice: () => void;
  onSendEmail?: () => void;
  onSendReminder?: () => void;
}

export function InvoiceHeader({
  invoice,
  displayStatus,
  downloading,
  confirming,
  cancelling,
  sendingEmail = false,
  sendingReminder = false,
  onDownloadPDF,
  onPrint,
  onConfirmInvoice,
  onOpenPaymentModal,
  onCancelInvoice,
  onSendEmail,
  onSendReminder,
}: InvoiceHeaderProps) {
  const isConfirmed = invoice.status === DocumentStatus.CONFIRMED;
  const isDraft = invoice.status === DocumentStatus.DRAFT;
  const isCancelled = invoice.status === DocumentStatus.CANCELLED;
  const hasDue = invoice.amountDue > 0;

  return (
    <div className="space-y-3">
      <Link
        href="/invoices"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Invoices
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Invoice #{invoice.invoiceNumber}
            </h1>
            <StatusBadge status={displayStatus} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Customer Sales Invoice • Issued on{" "}
            {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
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
            onClick={onDownloadPDF}
            disabled={downloading}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Download PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>

          {isDraft && (
            <Button
              size="sm"
              onClick={onConfirmInvoice}
              disabled={confirming}
              className="h-8 text-xs bg-navy hover:bg-navy/90 text-white font-medium gap-1.5 cursor-pointer"
            >
              {confirming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Confirm Invoice
            </Button>
          )}

          {onSendEmail && !isCancelled && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendEmail}
              disabled={sendingEmail}
              className="h-8 text-xs gap-1.5 cursor-pointer text-navy hover:bg-slate-50"
              title="Send tax invoice with PDF attachment to customer"
            >
              {sendingEmail ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              Send Invoice Email
            </Button>
          )}

          {onSendReminder && isConfirmed && hasDue && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendReminder}
              disabled={sendingReminder}
              className="h-8 text-xs gap-1.5 cursor-pointer text-amber-700 hover:bg-amber-50/50 border-amber-200"
              title="Send payment reminder to customer"
            >
              {sendingReminder ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Send Reminder
            </Button>
          )}

          {isConfirmed && hasDue && (
            <Button
              size="sm"
              onClick={onOpenPaymentModal}
              className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-medium gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Record Payment
            </Button>
          )}

          {!isCancelled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelInvoice}
              disabled={cancelling}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
            >
              {cancelling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Ban className="w-3.5 h-3.5" />
              )}
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
