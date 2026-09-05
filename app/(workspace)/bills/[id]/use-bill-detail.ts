"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  confirmBillAction,
  cancelBillAction,
  getVendorBillByIdAction,
} from "@/app/actions/purchase.actions";
import {
  sendBillReminderAction,
  getBillEmailLogsAction,
} from "@/app/actions/bill-reminder.actions";
import { recordPaymentAction } from "@/app/actions/payment.actions";
import { DocumentStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import {
  SerializedBillData,
  SerializedBillEmailLog,
  serializeBillData,
} from "./types";

export function useBillDetail(initialBill: SerializedBillData) {
  const router = useRouter();
  const [bill, setBill] = React.useState<SerializedBillData>(initialBill);
  const [emailLogs, setEmailLogs] = React.useState<SerializedBillEmailLog[]>(initialBill.emailLogs);

  const [confirming, setConfirming] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [sendingReminder, setSendingReminder] = React.useState(false);

  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState(bill.amountDue > 0 ? bill.amountDue.toString() : "");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  const refreshBill = async () => {
    try {
      const res = await getVendorBillByIdAction(bill.id);
      if (res.success && res.data) {
        const updated = serializeBillData(res.data as Record<string, unknown>);
        setBill(updated);
        setEmailLogs(updated.emailLogs);
      }
    } catch { /* Non-blocking */ }
  };

  const displayStatus = React.useMemo(() => {
    if (bill.status === DocumentStatus.DRAFT) return "DRAFT";
    if (bill.status === DocumentStatus.CANCELLED) return "CANCELLED";
    if (bill.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (bill.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";
    if (new Date(bill.dueDate) < new Date() && bill.paymentStatus === PaymentStatus.NOT_PAID) return "OVERDUE";
    return "PENDING";
  }, [bill.status, bill.paymentStatus, bill.dueDate]);

  const handleConfirmBill = async () => {
    setConfirming(true);
    try {
      const res = await confirmBillAction(bill.id);
      if (res.success) {
        toast.success("Vendor bill posted to creditors ledger");
        await refreshBill();
        router.refresh();
      } else { toast.error(res.error || "Failed to post vendor bill"); }
    } catch { toast.error("Error confirming vendor bill"); }
    finally { setConfirming(false); }
  };

  const handleCancelBill = async () => {
    if (!confirm("Are you sure you want to cancel this vendor bill?")) return;
    setCancelling(true);
    try {
      const res = await cancelBillAction(bill.id);
      if (res.success) {
        toast.success("Vendor bill cancelled");
        await refreshBill();
        router.refresh();
      } else { toast.error(res.error || "Failed to cancel vendor bill"); }
    } catch { toast.error("Error cancelling vendor bill"); }
    finally { setCancelling(false); }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/bills/${bill.id}/download`);
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VendorBill-${bill.billNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Bill PDF downloaded successfully");
    } catch { toast.error("Failed to generate PDF download"); }
    finally { setDownloading(false); }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const res = await sendBillReminderAction(bill.id);
      if (res.success) {
        toast.success(res.message || "Reminder email dispatched successfully");
        await refreshBill();
        const logsRes = await getBillEmailLogsAction(bill.id);
        if (logsRes.success && logsRes.data) {
          setEmailLogs(logsRes.data as SerializedBillEmailLog[]);
        }
      } else { toast.error(res.error || "Failed to send reminder email"); }
    } catch { toast.error("Error dispatching payment reminder email"); }
    finally { setSendingReminder(false); }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (amt > bill.amountDue + 0.01) {
      toast.error("Payment amount cannot exceed outstanding balance");
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await recordPaymentAction({
        documentId: bill.id,
        documentType: "BILL",
        amount: amt,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        note: paymentNote || undefined,
      });

      if (res.success) {
        toast.success("Vendor disbursement payment recorded");
        setOpenPaymentModal(false);
        await refreshBill();
        router.refresh();
      } else { toast.error(res.error || "Failed to record payment"); }
    } catch { toast.error("Error recording vendor payment"); }
    finally { setRecordingPayment(false); }
  };

  return {
    bill,
    emailLogs,
    confirming,
    cancelling,
    downloading,
    sendingReminder,
    openPaymentModal,
    setOpenPaymentModal,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    paymentDate,
    setPaymentDate,
    paymentNote,
    setPaymentNote,
    recordingPayment,
    displayStatus,
    handleConfirmBill,
    handleCancelBill,
    handleDownloadPDF,
    handleSendReminder,
    handleRecordPayment,
  };
}
