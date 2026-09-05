"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
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
  BookOpen,
  History,
  FileText,
  AlertCircle,
  Building,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
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

export interface SerializedBillLine {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    category?: string | null;
  } | null;
  analyticAccount?: {
    id: string;
    name: string;
  } | null;
}

export interface SerializedBillPayment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

export interface SerializedBillEmailLog {
  id: string;
  recipientEmail: string;
  recipientName?: string | null;
  emailType: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
  sentAt: string;
}

export interface SerializedBillData {
  id: string;
  billNumber: string;
  vendorId: string;
  vendor: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  };
  purchaseOrderId?: string | null;
  purchaseOrder?: {
    id: string;
    poNumber: string;
  } | null;
  billDate: string;
  dueDate: string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  total: number;
  amountPaid: number;
  amountDue: number;
  lastReminderSentAt?: string | null;
  reminderCount: number;
  lines: SerializedBillLine[];
  payments: SerializedBillPayment[];
  emailLogs: SerializedBillEmailLog[];
}

interface BillDetailClientProps {
  initialBill: SerializedBillData;
}

export function BillDetailClient({ initialBill }: BillDetailClientProps) {
  const router = useRouter();
  const [bill, setBill] = React.useState<SerializedBillData>(initialBill);
  const [emailLogs, setEmailLogs] = React.useState<SerializedBillEmailLog[]>(initialBill.emailLogs);

  // Action states
  const [confirming, setConfirming] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [sendingReminder, setSendingReminder] = React.useState(false);

  // Payment Modal state
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [paymentAmount, setPaymentAmount] = React.useState(
    bill.amountDue > 0 ? bill.amountDue.toString() : ""
  );
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  // Reload current bill data
  const refreshBill = async () => {
    try {
      const res = await getVendorBillByIdAction(bill.id);
      if (res.success && res.data) {
        const raw = res.data as any;
        setBill({
          id: raw.id,
          billNumber: raw.billNumber,
          vendorId: raw.vendorId,
          vendor: {
            id: raw.vendor.id,
            name: raw.vendor.name,
            email: raw.vendor.email,
            phone: raw.vendor.phone,
            address: raw.vendor.address,
          },
          purchaseOrderId: raw.purchaseOrderId,
          purchaseOrder: raw.purchaseOrder
            ? { id: raw.purchaseOrder.id, poNumber: raw.purchaseOrder.poNumber }
            : null,
          billDate: new Date(raw.billDate).toISOString(),
          dueDate: new Date(raw.dueDate).toISOString(),
          status: raw.status,
          paymentStatus: raw.paymentStatus,
          total: Number(raw.total),
          amountPaid: Number(raw.amountPaid),
          amountDue: Number(raw.amountDue),
          lastReminderSentAt: raw.lastReminderSentAt
            ? new Date(raw.lastReminderSentAt).toISOString()
            : null,
          reminderCount: raw.reminderCount || 0,
          lines: (raw.lines || []).map((l: any) => ({
            id: l.id,
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
            lineTotal: Number(l.lineTotal),
            product: l.product
              ? {
                  id: l.product.id,
                  name: l.product.name,
                  sku: l.product.sku,
                  category: l.product.category,
                }
              : null,
            analyticAccount: l.analyticAccount
              ? { id: l.analyticAccount.id, name: l.analyticAccount.name }
              : null,
          })),
          payments: (raw.payments || []).map((p: any) => ({
            id: p.id,
            amount: Number(p.amount),
            paymentDate: new Date(p.paymentDate).toISOString(),
            paymentMethod: p.paymentMethod,
            note: p.note,
          })),
          emailLogs: (raw.emailLogs || []).map((log: any) => ({
            id: log.id,
            recipientEmail: log.recipientEmail,
            recipientName: log.recipientName,
            emailType: log.emailType,
            subject: log.subject,
            status: log.status,
            errorMessage: log.errorMessage,
            sentAt: new Date(log.sentAt).toISOString(),
          })),
        });
        setEmailLogs(
          (raw.emailLogs || []).map((log: any) => ({
            id: log.id,
            recipientEmail: log.recipientEmail,
            recipientName: log.recipientName,
            emailType: log.emailType,
            subject: log.subject,
            status: log.status,
            errorMessage: log.errorMessage,
            sentAt: new Date(log.sentAt).toISOString(),
          }))
        );
      }
    } catch {
      // Non-blocking refresh failure
    }
  };

  const getDisplayStatus = (): string => {
    if (bill.status === DocumentStatus.DRAFT) return "DRAFT";
    if (bill.status === DocumentStatus.CANCELLED) return "CANCELLED";
    if (bill.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (bill.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";

    const today = new Date();
    const due = new Date(bill.dueDate);
    if (due < today && bill.paymentStatus === PaymentStatus.NOT_PAID) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  const handleConfirmBill = async () => {
    setConfirming(true);
    try {
      const res = await confirmBillAction(bill.id);
      if (res.success) {
        toast.success("Vendor bill posted to creditors ledger");
        await refreshBill();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to post vendor bill");
      }
    } catch {
      toast.error("Error confirming vendor bill");
    } finally {
      setConfirming(false);
    }
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
      } else {
        toast.error(res.error || "Failed to cancel vendor bill");
      }
    } catch {
      toast.error("Error cancelling vendor bill");
    } finally {
      setCancelling(false);
    }
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
    } catch {
      toast.error("Failed to generate PDF download");
    } finally {
      setDownloading(false);
    }
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
      } else {
        toast.error(res.error || "Failed to send reminder email");
      }
    } catch {
      toast.error("Error dispatching payment reminder email");
    } finally {
      setSendingReminder(false);
    }
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
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch {
      toast.error("Error recording vendor payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  const isConfirmed = bill.status === DocumentStatus.CONFIRMED;
  const isDraft = bill.status === DocumentStatus.DRAFT;
  const isCancelled = bill.status === DocumentStatus.CANCELLED;
  const hasDue = bill.amountDue > 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0 && hasDue;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Header */}
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
              <StatusBadge status={getDisplayStatus()} />
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
              onClick={handleDownloadPDF}
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
              onClick={() => window.print()}
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
                onClick={handleConfirmBill}
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
                onClick={handleSendReminder}
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
                onClick={() => {
                  setPaymentAmount(bill.amountDue.toString());
                  setOpenPaymentModal(true);
                }}
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
                onClick={handleCancelBill}
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

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-border shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Total Bill Amount</span>
          <div className="text-xl font-bold font-mono text-navy mt-1">
            ₹{bill.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            Procurement order value
          </span>
        </Card>

        <Card className="p-4 bg-white border-border shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Settled / Paid</span>
          <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
            ₹{bill.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {bill.amountPaid >= bill.total ? "Fully settled" : "Partial payments recorded"}
          </span>
        </Card>

        <Card className="p-4 bg-white border-border shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Outstanding Balance</span>
          <div className={`text-xl font-bold font-mono mt-1 ${hasDue ? "text-amber-600" : "text-muted-foreground"}`}>
            ₹{bill.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-muted-foreground mt-0.5 block">
            {hasDue ? "Accounts payable liability" : "Zero balance due"}
          </span>
        </Card>

        <Card className="p-4 bg-white border-border shadow-2xs">
          <span className="text-xs font-medium text-muted-foreground">Due Date Status</span>
          <div className={`text-xl font-bold mt-1 ${isOverdue ? "text-rose-600" : "text-foreground"}`}>
            {new Date(bill.dueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
          <span className="text-[11px] mt-0.5 block font-medium">
            {isOverdue ? (
              <span className="text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Overdue by {Math.abs(diffDays)} days
              </span>
            ) : diffDays === 0 ? (
              <span className="text-amber-600">Due today</span>
            ) : hasDue ? (
              <span className="text-muted-foreground">Due in {diffDays} days</span>
            ) : (
              <span className="text-emerald-600">Settled in full</span>
            )}
          </span>
        </Card>
      </div>

      {/* Vendor & Bill Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bill Metadata */}
        <Card className="p-5 bg-white border-border shadow-2xs space-y-3 text-xs">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-navy" /> Bill Information
          </CardTitle>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Bill Number:</span>
              <span className="font-mono font-bold text-navy">{bill.billNumber}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Issue Date:</span>
              <span>
                {new Date(bill.billDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-1.5">
              <span className="text-muted-foreground">Due Date:</span>
              <span className="font-semibold text-foreground">
                {new Date(bill.dueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            {bill.purchaseOrder && (
              <div className="flex justify-between pt-0.5">
                <span className="text-muted-foreground">Purchase Order:</span>
                <span className="font-semibold text-navy">
                  {bill.purchaseOrder.poNumber}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Vendor Contact */}
        <Card className="p-5 bg-white border-border shadow-2xs space-y-3 text-xs">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-navy" /> Vendor Profile
          </CardTitle>
          <div className="space-y-2 pt-1">
            <p className="font-bold text-sm text-navy">{bill.vendor.name}</p>
            <div className="text-muted-foreground space-y-1">
              <p>Email: {bill.vendor.email || "No email on record"}</p>
              <p>Phone: {bill.vendor.phone || "No phone on record"}</p>
            </div>
          </div>
        </Card>

        {/* Vendor Tax & Billing Address */}
        <Card className="p-5 bg-white border-border shadow-2xs space-y-3 text-xs">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-navy" /> Address & Tax Identification
          </CardTitle>
          <div className="space-y-2 pt-1 text-muted-foreground">
            {bill.vendor.address ? (
              <p className="whitespace-pre-line leading-relaxed">{bill.vendor.address}</p>
            ) : (
              <p className="italic">Vendor address not provided</p>
            )}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-navy">GST Compliance:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                Verified Active
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Purchased Products / Materials Table */}
      <Card className="border-border shadow-2xs bg-white overflow-hidden">
        <div className="p-4 border-b border-border bg-[#F8FAFC]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              Purchased Products / Materials
            </h3>
            <span className="text-[11px] text-muted-foreground">
              ({bill.lines.length} line item{bill.lines.length === 1 ? "" : "s"})
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
                <th className="py-3 px-4">Item / Description</th>
                <th className="py-3 px-4">Cost Center / Analytic</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {bill.lines.map((line) => (
                <tr key={line.id} className="hover:bg-surface-subtle/30">
                  <td className="py-3 px-4 font-medium text-foreground">
                    {line.product?.name || "Product"}
                    {line.product?.sku && (
                      <span className="text-[10px] text-muted-foreground ml-2 font-normal">
                        ({line.product.sku})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {line.analyticAccount?.name || "General Procurement"}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{line.quantity}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    ₹{line.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-navy">
                    ₹{line.lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment History & Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Payment History Card */}
        <Card className="p-5 border-border shadow-2xs bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              Disbursement Payment History
            </h3>
            {isConfirmed && hasDue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPaymentAmount(bill.amountDue.toString());
                  setOpenPaymentModal(true);
                }}
                className="h-6 text-[11px] text-teal hover:text-teal/90 px-2"
              >
                + Add Payment
              </Button>
            )}
          </div>

          {bill.payments && bill.payments.length > 0 ? (
            <div className="space-y-2">
              {bill.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F8FAFC] border border-border/60"
                >
                  <div>
                    <div className="font-bold text-foreground">
                      ₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      via {p.paymentMethod} {p.note && `• ${p.note}`}
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-border text-center text-xs text-muted-foreground">
              No disbursement payments recorded for this bill yet.
            </div>
          )}
        </Card>

        {/* Accounting Summary Breakdown */}
        <Card className="p-5 border-border shadow-2xs bg-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy border-b border-border pb-2">
            Financial Balance Breakdown
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Gross Bill Amount:</span>
              <span className="font-bold text-foreground font-mono">
                ₹{bill.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Total Paid to Date:</span>
              <span className="font-medium font-mono">
                - ₹{bill.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-3 mt-1">
              <span>Outstanding Payable:</span>
              <span className={`font-mono ${hasDue ? "text-amber-600" : "text-muted-foreground"}`}>
                ₹{bill.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Accounting Double Entry Posting */}
      <Card className="p-5 border border-navy/15 bg-[#16324F]/5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-navy" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
            Accounting Entry (Double Entry Posting)
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Posting this vendor bill automatically credits Vendor Payables (Accounts Payable) and debits Material Procurement / Input Tax:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-white border border-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-teal">Purchase Expense</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                DEBIT
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Recognized in Profit & Loss as material consumption
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white border border-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Input Tax (GST)</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                DEBIT
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Input tax credit claimable on purchases
            </p>
          </div>

          <div className="p-3 rounded-lg bg-white border border-border shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-navy">Vendor Payable</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                CREDIT
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Current liability owed to vendor on balance sheet
            </p>
          </div>
        </div>
      </Card>

      {/* Email Reminder & Audit History */}
      <Card className="p-5 border-border shadow-2xs bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
              Email Reminder & Audit History
            </h3>
          </div>
          {emailLogs.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground">
              {emailLogs.length} reminder{emailLogs.length === 1 ? "" : "s"} dispatched
            </span>
          )}
        </div>

        {emailLogs.length > 0 ? (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Date & Time Sent</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3 text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {emailLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC]/50">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-foreground font-medium">
                      {new Date(log.sentAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {log.recipientEmail}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.emailType === "OVERDUE"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : log.emailType === "DUE_SOON"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {log.emailType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground max-w-[280px] truncate" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                          log.status === "SENT" ? "text-emerald-600" : "text-destructive"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "SENT" ? "bg-emerald-600" : "bg-destructive"
                          }`}
                        />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-[#F8FAFC] border border-dashed border-border text-center text-xs text-muted-foreground">
            No reminder emails have been dispatched for this bill yet.
          </div>
        )}
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={openPaymentModal} onOpenChange={setOpenPaymentModal}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy">
              Record Vendor Payment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
            <div className="p-3.5 bg-[#F8FAFC] border border-border rounded-xl space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bill:</span>
                <span className="font-mono font-bold text-navy">{bill.billNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vendor:</span>
                <span className="font-semibold">{bill.vendor.name}</span>
              </div>
              <div className="flex justify-between border-t border-border/70 pt-1.5 mt-1.5">
                <span className="text-muted-foreground font-medium">Balance Due:</span>
                <span className="font-bold text-amber-600 font-mono">
                  ₹{bill.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <FormInput
              label="Payment Amount (₹)"
              type="number"
              min="0.01"
              max={bill.amountDue.toString()}
              step="0.01"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />

            <FormSelect
              label="Payment Method"
              options={[
                { value: PaymentMethod.BANK, label: "Bank Transfer (NEFT/RTGS)" },
                { value: PaymentMethod.CASH, label: "Cash in Hand" },
              ]}
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
            />

            <FormInput
              label="Payment Date"
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />

            <FormInput
              label="Payment Reference / Note"
              placeholder="e.g. UTR #, Cheque #, Vendor receipt"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={recordingPayment}
                className="bg-teal hover:bg-teal/90 text-white font-semibold"
              >
                {recordingPayment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Recording...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
