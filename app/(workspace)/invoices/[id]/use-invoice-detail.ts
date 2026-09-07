"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import {
  confirmInvoiceAction,
  cancelInvoiceAction,
  getInvoiceByIdAction,
} from "@/app/actions/sales.actions";
import { sendInvoiceEmailWithPDFAction } from "@/app/actions/invoice-email.actions";
import { sendInvoicePaymentReminderAction } from "@/app/actions/invoice-reminder.actions";
import { SerializedInvoiceData, serializeInvoiceData } from "./types";

export function useInvoiceDetail(initialInvoice: SerializedInvoiceData) {
  const router = useRouter();
  const [invoice, setInvoice] = React.useState<SerializedInvoiceData>(initialInvoice);

  const [confirming, setConfirming] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [sendingEmail, setSendingEmail] = React.useState(false);
  const [sendingReminder, setSendingReminder] = React.useState(false);

  const displayStatus = React.useMemo(() => {
    if (invoice.status === DocumentStatus.CANCELLED) return "CANCELLED";
    if (invoice.status === DocumentStatus.DRAFT) return "DRAFT";
    if (invoice.paymentStatus === PaymentStatus.PAID) return "PAID";

    const isOverdue =
      invoice.amountDue > 0 && new Date(invoice.dueDate) < new Date();

    if (isOverdue) return "OVERDUE";
    if (invoice.paymentStatus === PaymentStatus.PARTIAL) return "PARTIALLY_PAID";
    return "POSTED";
  }, [invoice]);

  const refreshInvoice = async () => {
    try {
      const res = await getInvoiceByIdAction(invoice.id);
      if (res.success && res.data) {
        setInvoice(serializeInvoiceData(res.data as Record<string, unknown>));
      }
    } catch {
      // silent refresh failover
    }
  };

  const handleConfirmInvoice = async () => {
    setConfirming(true);
    try {
      const res = await confirmInvoiceAction(invoice.id);
      if (res.success) {
        toast.success("Invoice confirmed! Double-entry Journal Entry posted.");
        await refreshInvoice();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to confirm invoice");
      }
    } catch {
      toast.error("Failed to confirm invoice");
    } finally {
      setConfirming(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!confirm("Are you sure you want to cancel this invoice?")) return;
    setCancelling(true);
    try {
      const res = await cancelInvoiceAction(invoice.id);
      if (res.success) {
        toast.success("Invoice has been cancelled");
        await refreshInvoice();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to cancel invoice");
      }
    } catch {
      toast.error("Failed to cancel invoice");
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/invoices/${invoice.id}/download`);
      if (!response.ok) {
        toast.error("Failed to generate PDF");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded Invoice-${invoice.invoiceNumber}.pdf`);
    } catch {
      toast.error("Error downloading PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await sendInvoiceEmailWithPDFAction(invoice.id);
      if (res.success) {
        toast.success(res.message || "Invoice email with PDF sent successfully!");
        await refreshInvoice();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send invoice email");
      }
    } catch {
      toast.error("Error sending invoice email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendReminder = async () => {
    setSendingReminder(true);
    try {
      const res = await sendInvoicePaymentReminderAction(invoice.id);
      if (res.success) {
        toast.success(res.message || "Payment reminder email sent successfully!");
        await refreshInvoice();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send payment reminder");
      }
    } catch {
      toast.error("Error sending payment reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  return {
    invoice,
    displayStatus,
    confirming,
    cancelling,
    downloading,
    sendingEmail,
    sendingReminder,
    handleConfirmInvoice,
    handleCancelInvoice,
    handleDownloadPDF,
    handleSendEmail,
    handleSendReminder,
  };
}
