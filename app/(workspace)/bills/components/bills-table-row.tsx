"use client";

import * as React from "react";
import {
  Download,
  DollarSign,
  Eye,
  Check,
  Mail,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DocumentStatus } from "@prisma/client";
import type { VendorBillWithRelations } from "../bills-types";

interface BillsTableRowProps {
  bill: VendorBillWithRelations;
  displayStatus: string;
  confirmingBillId: string | null;
  cancellingBillId: string | null;
  downloadingId: string | null;
  sendingReminderId: string | null;
  onOpenDetails: (bill: VendorBillWithRelations) => void;
  onConfirmBill: (billId: string) => void;
  onCancelBill: (billId: string) => void;
  onOpenPayment: (bill: VendorBillWithRelations) => void;
  onSendReminder: (billId: string) => void;
  onDownloadPDF: (bill: VendorBillWithRelations) => void;
}

export function BillsTableRow({
  bill,
  displayStatus,
  confirmingBillId,
  cancellingBillId,
  downloadingId,
  sendingReminderId,
  onOpenDetails,
  onConfirmBill,
  onCancelBill,
  onOpenPayment,
  onSendReminder,
  onDownloadPDF,
}: BillsTableRowProps) {
  const isDraft = bill.status === DocumentStatus.DRAFT;
  const isConfirmed = bill.status === DocumentStatus.CONFIRMED;
  const hasDue = Number(bill.amountDue) > 0;

  return (
    <tr
      className="hover:bg-[#F8FAFC]/90 transition-colors group cursor-pointer"
      onClick={() => onOpenDetails(bill)}
    >
      {/* Bill # */}
      <td className="py-3.5 px-4 font-bold text-navy">
        <div className="flex items-center gap-1.5">
          <span>{bill.billNumber}</span>
          {bill.purchaseOrder && (
            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              PO: {bill.purchaseOrder.poNumber}
            </span>
          )}
        </div>
      </td>

      {/* Vendor */}
      <td className="py-3.5 px-4 font-semibold text-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-navy/10 text-navy flex items-center justify-center text-[10px] font-bold">
            {bill.vendor?.name ? bill.vendor.name.charAt(0).toUpperCase() : "V"}
          </div>
          <span>{bill.vendor?.name}</span>
        </div>
      </td>

      {/* Bill Date */}
      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(bill.billDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      {/* Due Date */}
      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(bill.dueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>

      {/* Amount */}
      <td className="py-3.5 px-4 text-right font-medium text-foreground">
        ₹{Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      {/* Paid */}
      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">
        ₹{Number(bill.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </td>

      {/* Balance */}
      <td className="py-3.5 px-4 text-right font-semibold">
        {hasDue ? (
          <span className="text-amber-600">
            ₹{Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-muted-foreground">₹0.00</span>
        )}
      </td>

      {/* Status */}
      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={displayStatus} />
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDetails(bill)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-navy hover:bg-navy/5"
            title="View Bill Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {isDraft && (
            <Button
              variant="ghost"
              size="sm"
              disabled={confirmingBillId === bill.id}
              onClick={() => onConfirmBill(bill.id)}
              className="h-7 px-2 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
              title="Post Bill & Record to Creditors"
            >
              {confirmingBillId === bill.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  Post
                </>
              )}
            </Button>
          )}

          {isConfirmed && hasDue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenPayment(bill)}
              className="h-7 px-2 text-[11px] font-medium text-teal hover:text-teal/90 hover:bg-teal/10 gap-1"
              title="Disburse Payment to Vendor"
            >
              <DollarSign className="w-3 h-3" />
              Pay
            </Button>
          )}

          {isConfirmed && hasDue && bill.vendor?.email && (
            <Button
              variant="ghost"
              size="sm"
              disabled={sendingReminderId === bill.id}
              onClick={() => onSendReminder(bill.id)}
              className="h-7 px-2 text-[11px] font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 gap-1"
              title={
                bill.lastReminderSentAt
                  ? `Last reminder sent: ${new Date(bill.lastReminderSentAt).toLocaleString("en-IN")}. Click to resend.`
                  : "Send payment alert email to vendor"
              }
            >
              {sendingReminderId === bill.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Mail className="w-3 h-3" />
                  {bill.lastReminderSentAt ? "Reminded" : "Remind"}
                </>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            disabled={downloadingId === bill.id}
            onClick={() => onDownloadPDF(bill)}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            title="Download PDF"
          >
            {downloadingId === bill.id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
          </Button>

          {bill.status !== DocumentStatus.CANCELLED && (!bill.payments || bill.payments.length === 0) && (
            <Button
              variant="ghost"
              size="sm"
              disabled={cancellingBillId === bill.id}
              onClick={() => onCancelBill(bill.id)}
              className="h-7 px-1.5 text-[11px] text-destructive hover:bg-destructive/10"
              title="Cancel Bill"
            >
              {cancellingBillId === bill.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Cancel"
              )}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
