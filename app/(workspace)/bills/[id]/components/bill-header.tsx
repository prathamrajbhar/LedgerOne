"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  DollarSign,
  Ban,
  Check,
  Loader2,
} from "lucide-react";
import { DocumentStatus } from "@prisma/client";
import { SerializedBillData } from "../types";

interface BillHeaderProps {
  bill: SerializedBillData;
  displayStatus: string;
  downloading: boolean;
  confirming: boolean;
  sendingReminder: boolean;
  cancelling: boolean;
  onDownloadPDF: () => void;
  onPrint: () => void;
  onConfirmBill: () => void;
  onSendReminder: () => void;
  onOpenPaymentModal: () => void;
  onCancelBill: () => void;
}

export function BillHeader({
  bill,
  displayStatus,
  downloading,
  confirming,
  sendingReminder,
  cancelling,
  onDownloadPDF,
  onPrint,
  onConfirmBill,
  onSendReminder,
  onOpenPaymentModal,
  onCancelBill,
}: BillHeaderProps) {
  const isConfirmed = bill.status === DocumentStatus.CONFIRMED;
  const isDraft = bill.status === DocumentStatus.DRAFT;
  const isCancelled = bill.status === DocumentStatus.CANCELLED;
  const hasDue = bill.amountDue > 0;

  return (
    <div className="space-y-3">
      <Link
        href="/bills"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Vendor Bills
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Bill #{bill.billNumber}
            </h1>
            <StatusBadge status={displayStatus} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Vendor Procurement Bill • Issued on{" "}
            {new Date(bill.billDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadPDF}
            disabled={downloading}
            className="h-8 text-xs gap-1.5"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Download PDF
          </Button>

          {/* Print */}
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="h-8 text-xs gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Button>

          {/* Post / Confirm Bill */}
          {isDraft && (
            <Button
              size="sm"
              disabled={confirming}
              onClick={onConfirmBill}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
            >
              {confirming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Post Bill
            </Button>
          )}

          {/* Send Reminder Email */}
          {isConfirmed && hasDue && bill.vendor?.email && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={sendingReminder}
              onClick={onSendReminder}
              className="h-8 text-xs border-amber-300 text-amber-800 bg-amber-50/60 hover:bg-amber-100 gap-1.5 font-medium shadow-2xs"
              title={
                bill.lastReminderSentAt
                  ? `Last reminder dispatched on: ${new Date(bill.lastReminderSentAt).toLocaleString("en-IN")}`
                  : "Send payment reminder email to vendor"
              }
            >
              {sendingReminder ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Mail className="w-3.5 h-3.5 text-amber-600" />
              )}
              Send Reminder
            </Button>
          )}

          {/* Record Payment */}
          {isConfirmed && hasDue && (
            <Button
              size="sm"
              onClick={onOpenPaymentModal}
              className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-semibold gap-1.5 shadow-2xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Record Payment
            </Button>
          )}

          {/* Cancel Bill */}
          {!isCancelled && bill.payments.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={cancelling}
              onClick={onCancelBill}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
            >
              {cancelling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Ban className="w-3.5 h-3.5" />
              )}
              Cancel Bill
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
