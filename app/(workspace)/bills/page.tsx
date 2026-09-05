"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Plus,
  Search,
  Download,
  CheckCircle,
  Loader2,
  DollarSign,
  Receipt,
  FileText,
  AlertCircle,
  Clock,
  Trash2,
  Eye,
  Printer,
  Ban,
  BookOpen,
  Check,
  Mail,
  Send,
  History,
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
  getVendorBillsAction,
  createStandaloneBillAction,
  confirmBillAction,
  cancelBillAction,
  getPurchaseOrdersAction,
  getAnalyticAccountsAction,
} from "@/app/actions/purchase.actions";
import {
  sendBillReminderAction,
  dispatchBatchDueBillAlertsAction,
  getBillEmailLogsAction,
} from "@/app/actions/bill-reminder.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getTaxRatesAction } from "@/app/actions/tax-rate.actions";
import { recordPaymentAction } from "@/app/actions/payment.actions";
import { DocumentStatus, PaymentStatus, PaymentMethod, Prisma } from "@prisma/client";
import type { Contact, Product, AnalyticAccount } from "@prisma/client";

interface BillLineItem {
  id: string;
  productId: string;
  analyticAccountId: string;
  quantity: Prisma.Decimal | number;
  unitPrice: Prisma.Decimal | number;
  lineTotal: Prisma.Decimal | number;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
    category?: string | null;
    unitOfMeasure?: string | null;
  } | null;
  analyticAccount?: {
    id: string;
    name: string;
    code?: string;
  } | null;
}

interface BillPaymentItem {
  id: string;
  amount: Prisma.Decimal | number;
  paymentDate: Date | string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

interface BillEmailLogItem {
  id: string;
  recipientEmail: string;
  recipientName?: string | null;
  emailType: string;
  subject: string;
  status: string;
  errorMessage?: string | null;
  sentAt: string | Date;
}

interface VendorBillWithRelations {
  id: string;
  billNumber: string;
  vendorId: string;
  vendor: Contact;
  purchaseOrderId?: string | null;
  purchaseOrder?: {
    id: string;
    poNumber: string;
  } | null;
  billDate: Date | string;
  dueDate: Date | string;
  status: DocumentStatus;
  paymentStatus: PaymentStatus;
  total: Prisma.Decimal | number;
  amountPaid: Prisma.Decimal | number;
  amountDue: Prisma.Decimal | number;
  lastReminderSentAt?: Date | string | null;
  reminderCount?: number;
  lines: BillLineItem[];
  payments?: BillPaymentItem[];
  emailLogs?: BillEmailLogItem[];
}

interface FormBillLineRow {
  productId: string;
  analyticAccountId: string;
  description: string;
  quantity: number | "";
  unit: string;
  unitCost: number | "";
  taxRateId: string;
  discountPercent: number | "";
}

export default function VendorBillsPage() {
  const [bills, setBills] = React.useState<VendorBillWithRelations[]>([]);
  const [vendors, setVendors] = React.useState<Contact[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [analyticAccounts, setAnalyticAccounts] = React.useState<AnalyticAccount[]>([]);
  const [taxRates, setTaxRates] = React.useState<Array<{ id: string; name: string; percentage: number }>>([]);
  const [purchaseOrders, setPurchaseOrders] = React.useState<Array<{ id: string; poNumber: string; vendorId: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [vendorFilter, setVendorFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = React.useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Modals state
  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const [openDetailsModal, setOpenDetailsModal] = React.useState(false);
  const [selectedBillForView, setSelectedBillForView] = React.useState<VendorBillWithRelations | null>(null);

  // Payment modal state
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [selectedBillForPayment, setSelectedBillForPayment] = React.useState<VendorBillWithRelations | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  // Action status trackers
  const [confirmingBillId, setConfirmingBillId] = React.useState<string | null>(null);
  const [cancellingBillId, setCancellingBillId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [sendingReminderId, setSendingReminderId] = React.useState<string | null>(null);
  const [runningBatchAlerts, setRunningBatchAlerts] = React.useState(false);
  const [modalEmailLogs, setModalEmailLogs] = React.useState<BillEmailLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = React.useState(false);

  // Add Vendor Bill Form State
  const [formVendor, setFormVendor] = React.useState("");
  const [formPurchaseOrder, setFormPurchaseOrder] = React.useState("");
  const [formVendorBillNumber, setFormVendorBillNumber] = React.useState("");
  const [formBillDate, setFormBillDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formPaymentTerms, setFormPaymentTerms] = React.useState("NET_30");
  const [submitting, setSubmitting] = React.useState(false);

  // Dynamic lines for add bill
  const [formLines, setFormLines] = React.useState<FormBillLineRow[]>([
    {
      productId: "",
      analyticAccountId: "",
      description: "",
      quantity: 1,
      unit: "pcs",
      unitCost: "",
      taxRateId: "",
      discountPercent: 0,
    },
  ]);

  // Load initial data
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsRes, vendorsRes, productsRes, taxRes, poRes, analyticRes] = await Promise.all([
        getVendorBillsAction(),
        getContactsAction({ type: "VENDOR", limit: 100 }),
        getProductsAction({ limit: 100 }),
        getTaxRatesAction(),
        getPurchaseOrdersAction(),
        getAnalyticAccountsAction(),
      ]);

      if (billsRes.success && billsRes.data) {
        setBills(billsRes.data as unknown as VendorBillWithRelations[]);
      } else {
        toast.error(billsRes.error || "Failed to load vendor bills");
      }

      if (vendorsRes.success && vendorsRes.data) {
        const vData = vendorsRes.data as { contacts?: Contact[] };
        setVendors(vData.contacts || []);
      }

      if (productsRes.success && productsRes.data) {
        const pData = productsRes.data as { data?: Product[] };
        setProducts(pData.data || []);
      }

      if (taxRes.success && taxRes.data) {
        setTaxRates(taxRes.data as Array<{ id: string; name: string; percentage: number }>);
      }

      if (poRes.success && poRes.data) {
        setPurchaseOrders(poRes.data as Array<{ id: string; poNumber: string; vendorId: string }>);
      }

      if (analyticRes.success && analyticRes.data) {
        setAnalyticAccounts(analyticRes.data as AnalyticAccount[]);
      }
    } catch {
      toast.error("Failed to load vendor bills workspace data");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic item table management
  const handleAddLine = () => {
    setFormLines((prev) => [
      ...prev,
      {
        productId: "",
        analyticAccountId: analyticAccounts[0]?.id || "",
        description: "",
        quantity: 1,
        unit: "pcs",
        unitCost: "",
        taxRateId: taxRates[0]?.id || "",
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) {
      toast.error("A vendor bill requires at least one material/product row");
      return;
    }
    setFormLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index: number, field: keyof FormBillLineRow, value: unknown) => {
    setFormLines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === "productId") {
        const selProd = products.find((p) => p.id === value);
        if (selProd) {
          current.description = selProd.name;
          current.unitCost = Number(selProd.cost) || 0;
          current.unit = "pcs";
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  // Compute live financial summary for creation form
  const formCalculations = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    formLines.forEach((line) => {
      const qty = Number(line.quantity) || 0;
      const cost = Number(line.unitCost) || 0;
      const discPct = Number(line.discountPercent) || 0;

      const baseAmount = qty * cost;
      const discountAmt = (baseAmount * discPct) / 100;
      const discountedAmount = Math.max(0, baseAmount - discountAmt);

      const taxRateObj = taxRates.find((t) => t.id === line.taxRateId);
      const taxRate = taxRateObj ? Number(taxRateObj.percentage) : 0;
      const taxAmt = (discountedAmount * taxRate) / 100;

      subtotal += baseAmount;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const preRound = subtotal - totalDiscount + totalTax;
    const grandTotal = Math.round(preRound * 100) / 100;
    const roundOff = Math.round((Math.round(grandTotal) - grandTotal) * 100) / 100;
    const finalGrandTotal = Math.max(0, grandTotal + roundOff);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      cgst,
      sgst,
      roundOff,
      grandTotal: finalGrandTotal,
    };
  }, [formLines, taxRates]);

  // Handle Add Vendor Bill submission
  const handleSaveBill = async (asDraft = false) => {
    if (!formVendor) {
      toast.error("Please select a vendor");
      return;
    }

    const validLines = formLines.filter(
      (l) => l.productId && Number(l.quantity) > 0 && Number(l.unitCost) >= 0
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one complete material/product item with unit cost and quantity");
      return;
    }

    setSubmitting(true);
    try {
      const defaultAnalyticId = analyticAccounts[0]?.id;
      if (!defaultAnalyticId) {
        toast.error("No analytic account found. Please create one first.");
        setSubmitting(false);
        return;
      }

      const billLines = validLines.map((l) => {
        const qty = Number(l.quantity);
        const rawCost = Number(l.unitCost);
        const disc = Number(l.discountPercent) || 0;
        const effectiveUnitCost = disc > 0 ? rawCost * (1 - disc / 100) : rawCost;

        return {
          productId: l.productId,
          analyticAccountId: l.analyticAccountId || defaultAnalyticId,
          quantity: qty,
          unitPrice: effectiveUnitCost,
        };
      });

      const result = await createStandaloneBillAction({
        vendorId: formVendor,
        billDate: new Date(formBillDate),
        dueDate: new Date(formDueDate),
        lines: billLines,
      });

      if (result.success && result.data) {
        toast.success(
          `Vendor Bill ${result.data.billNumber} created successfully${
            asDraft ? " as Draft" : ""
          }`
        );
        setOpenCreateModal(false);
        // Reset form
        setFormVendor("");
        setFormPurchaseOrder("");
        setFormVendorBillNumber("");
        setFormLines([
          {
            productId: "",
            analyticAccountId: analyticAccounts[0]?.id || "",
            description: "",
            quantity: 1,
            unit: "pcs",
            unitCost: "",
            taxRateId: taxRates[0]?.id || "",
            discountPercent: 0,
          },
        ]);
        await fetchData();
      } else {
        toast.error(result.error || "Failed to create vendor bill");
      }
    } catch {
      toast.error("An unexpected error occurred while creating vendor bill");
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm / Post Bill handler
  const handleConfirmBill = async (billId: string) => {
    setConfirmingBillId(billId);
    try {
      const result = await confirmBillAction(billId);
      if (result.success) {
        toast.success("Vendor bill posted! Journal Entry created: Debit Purchase Expense, Credit Vendor Payable.");
        await fetchData();
        if (selectedBillForView?.id === billId) {
          setSelectedBillForView((prev) =>
            prev ? { ...prev, status: DocumentStatus.CONFIRMED } : null
          );
        }
      } else {
        toast.error(result.error || "Failed to confirm vendor bill");
      }
    } catch {
      toast.error("Error occurred while confirming vendor bill");
    } finally {
      setConfirmingBillId(null);
    }
  };

  // Cancel Bill handler
  const handleCancelBill = async (billId: string) => {
    if (!confirm("Are you sure you want to cancel this vendor bill?")) {
      return;
    }
    setCancellingBillId(billId);
    try {
      const result = await cancelBillAction(billId);
      if (result.success) {
        toast.success("Vendor bill has been marked as Cancelled");
        await fetchData();
        if (selectedBillForView?.id === billId) {
          setSelectedBillForView((prev) =>
            prev ? { ...prev, status: DocumentStatus.CANCELLED } : null
          );
        }
      } else {
        toast.error(result.error || "Failed to cancel vendor bill");
      }
    } catch {
      toast.error("Error occurred while cancelling bill");
    } finally {
      setCancellingBillId(null);
    }
  };

  // PDF Download handler
  const handleDownloadPDF = async (bill: VendorBillWithRelations) => {
    setDownloadingId(bill.id);
    try {
      const response = await fetch(`/api/bills/${bill.id}/download`);
      if (!response.ok) {
        toast.error("Failed to generate PDF for this vendor bill");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `VendorBill-${bill.billNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded VendorBill-${bill.billNumber}.pdf`);
    } catch {
      toast.error("Error downloading PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  // Payment Recording modal
  const handleOpenPayment = (bill: VendorBillWithRelations) => {
    setSelectedBillForPayment(bill);
    setPaymentAmount(Number(bill.amountDue).toFixed(2));
    setPaymentMethod(PaymentMethod.BANK);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNote("");
    setOpenPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment || !paymentAmount) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const amt = parseFloat(paymentAmount);
    const due = Number(selectedBillForPayment.amountDue);

    if (amt <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }
    if (amt > due) {
      toast.error("Payment amount cannot exceed balance due to vendor");
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await recordPaymentAction({
        documentId: selectedBillForPayment.id,
        documentType: "BILL",
        amount: amt,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        note: paymentNote || undefined,
      });

      if (res.success) {
        toast.success("Vendor payment recorded successfully & journal entry created");
        setOpenPaymentModal(false);
        await fetchData();
        if (selectedBillForView?.id === selectedBillForPayment.id) {
          setOpenDetailsModal(false);
        }
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch {
      toast.error("Error recording vendor payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  // Open Details Modal and fetch fresh email logs
  const handleOpenDetails = async (bill: VendorBillWithRelations) => {
    setSelectedBillForView(bill);
    setOpenDetailsModal(true);
    setLoadingLogs(true);
    try {
      const logsRes = await getBillEmailLogsAction(bill.id);
      if (logsRes.success && logsRes.data) {
        setModalEmailLogs(logsRes.data as BillEmailLogItem[]);
      } else {
        setModalEmailLogs(bill.emailLogs || []);
      }
    } catch {
      setModalEmailLogs(bill.emailLogs || []);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Send single on-demand payment reminder email
  const handleSendReminder = async (billId: string) => {
    setSendingReminderId(billId);
    try {
      const res = await sendBillReminderAction(billId);
      if (res.success) {
        toast.success(res.message || "Reminder email sent successfully");
        await fetchData();
        if (selectedBillForView?.id === billId) {
          const freshLogs = await getBillEmailLogsAction(billId);
          if (freshLogs.success && freshLogs.data) {
            setModalEmailLogs(freshLogs.data as BillEmailLogItem[]);
          }
        }
      } else {
        toast.error(res.error || "Failed to send reminder email");
      }
    } catch {
      toast.error("Error dispatching payment reminder email");
    } finally {
      setSendingReminderId(null);
    }
  };

  // Run batch due & overdue alerts scan
  const handleRunBatchAlerts = async () => {
    setRunningBatchAlerts(true);
    try {
      const res = await dispatchBatchDueBillAlertsAction();
      if (res.success) {
        toast.success(res.message);
        await fetchData();
      } else {
        toast.error(res.error || "Batch reminder execution failed");
      }
    } catch {
      toast.error("Error running batch reminder alerts");
    } finally {
      setRunningBatchAlerts(false);
    }
  };

  // Compute real dashboard summary metrics
  const summaryMetrics = React.useMemo(() => {
    let totalCount = 0;
    let paidAmount = 0;
    let outstandingAmount = 0;
    let overdueAmount = 0;

    const today = new Date();

    bills.forEach((bill) => {
      if (bill.status === DocumentStatus.CANCELLED) return;
      totalCount += 1;

      const paid = Number(bill.amountPaid) || 0;
      const due = Number(bill.amountDue) || 0;

      paidAmount += paid;
      outstandingAmount += due;

      const isOverdue =
        due > 0 &&
        new Date(bill.dueDate) < today &&
        bill.paymentStatus !== PaymentStatus.PAID;

      if (isOverdue) {
        overdueAmount += due;
      }
    });

    return {
      totalCount,
      paidAmount,
      outstandingAmount,
      overdueAmount,
    };
  }, [bills]);

  // Compute helper status
  const getDisplayStatus = (bill: VendorBillWithRelations): string => {
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

  // Filtered bills
  const filteredBills = bills.filter((bill) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      bill.billNumber.toLowerCase().includes(q) ||
      bill.vendor?.name.toLowerCase().includes(q) ||
      (bill.purchaseOrder?.poNumber && bill.purchaseOrder.poNumber.toLowerCase().includes(q));

    const matchesVendor =
      vendorFilter === "ALL" || bill.vendorId === vendorFilter;

    const displayStatus = getDisplayStatus(bill);
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DRAFT" && bill.status === DocumentStatus.DRAFT) ||
      (statusFilter === "CONFIRMED" && bill.status === DocumentStatus.CONFIRMED) ||
      (statusFilter === "CANCELLED" && bill.status === DocumentStatus.CANCELLED) ||
      displayStatus === statusFilter;

    const matchesPaymentStatus =
      paymentStatusFilter === "ALL" ||
      bill.paymentStatus === paymentStatusFilter;

    let matchesDate = true;
    if (dateRangeFilter.start) {
      matchesDate =
        matchesDate && new Date(bill.billDate) >= new Date(dateRangeFilter.start);
    }
    if (dateRangeFilter.end) {
      matchesDate =
        matchesDate && new Date(bill.billDate) <= new Date(dateRangeFilter.end);
    }

    return (
      matchesSearch &&
      matchesVendor &&
      matchesStatus &&
      matchesPaymentStatus &&
      matchesDate
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
        <p className="text-xs text-muted-foreground font-medium">
          Loading Vendor Bills & Payables Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* TOP HEADER */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              Vendor Bills
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy/10 text-navy border border-navy/20">
              Purchase Cycle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage bills received from vendors and track outstanding payments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunBatchAlerts}
            disabled={runningBatchAlerts}
            className="h-9 px-3 text-xs font-medium border-border hover:bg-navy/5 text-navy gap-1.5 shadow-2xs"
            title="Scan all bills and send due soon (<=3 days) or overdue reminders"
          >
            {runningBatchAlerts ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-navy" />
                Scanning & Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5 text-navy" />
                Send Due/Overdue Alerts
              </>
            )}
          </Button>

          <Button
            onClick={() => setOpenCreateModal(true)}
            className="h-9 px-3.5 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            + Add Vendor Bill
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUMMARY SECTION (Real calculations or clean zero states) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bills */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Bills</span>
            <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-navy">
              {summaryMetrics.totalCount}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summaryMetrics.totalCount === 0
                ? "Zero vendor bills recorded"
                : `Total recorded procurement bills`}
            </p>
          </div>
        </Card>

        {/* Paid */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-emerald-600">
              ₹{summaryMetrics.paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summaryMetrics.paidAmount === 0
                ? "No vendor disbursements recorded yet"
                : "Total vendor disbursements settled"}
            </p>
          </div>
        </Card>

        {/* Outstanding */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-amber-600">
              ₹{summaryMetrics.outstandingAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summaryMetrics.outstandingAmount === 0
                ? "Zero accounts payable due"
                : "Pending accounts payable to vendors"}
            </p>
          </div>
        </Card>

        {/* Overdue */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overdue</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold tracking-tight text-rose-600">
              ₹{summaryMetrics.overdueAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {summaryMetrics.overdueAmount === 0
                ? "No overdue vendor payables"
                : "Bills past due payment date"}
            </p>
          </div>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* FILTER BAR */}
      {/* ========================================================================= */}
      <Card className="p-3 border-border shadow-2xs bg-white space-y-2.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vendor/bill number (e.g. BILL00001, Timber Supplies)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            />
          </div>

          {/* Filters cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Vendor Filter */}
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">Document Status</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payment Status Filter */}
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">Payment Status</option>
              <option value="NOT_PAID">Not Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Paid in Full</option>
            </select>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={dateRangeFilter.start}
                onChange={(e) =>
                  setDateRangeFilter((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-full h-8.5 px-1.5 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                title="Start Date"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input
                type="date"
                value={dateRangeFilter.end}
                onChange={(e) =>
                  setDateRangeFilter((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-full h-8.5 px-1.5 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                title="End Date"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters helper */}
        {(search || vendorFilter !== "ALL" || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || dateRangeFilter.start || dateRangeFilter.end) && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span>
              Showing {filteredBills.length} of {bills.length} records
            </span>
            <button
              onClick={() => {
                setSearch("");
                setVendorFilter("ALL");
                setStatusFilter("ALL");
                setPaymentStatusFilter("ALL");
                setDateRangeFilter({ start: "", end: "" });
              }}
              className="text-teal hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* VENDOR BILL TABLE */}
      {/* ========================================================================= */}
      <Card className="border-border shadow-2xs overflow-hidden bg-white">
        {filteredBills.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy border border-navy/10 flex items-center justify-center mb-4 shadow-2xs">
              <Receipt className="w-7 h-7 text-navy" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-navy">
              No vendor bills yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
              Add a vendor bill to start tracking your accounts payable.
            </p>
            <Button
              onClick={() => setOpenCreateModal(true)}
              className="mt-5 h-9 px-4 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Vendor Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Bill #</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Bill Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBills.map((bill) => {
                  const displayStatus = getDisplayStatus(bill);
                  const isDraft = bill.status === DocumentStatus.DRAFT;
                  const isConfirmed = bill.status === DocumentStatus.CONFIRMED;
                  const hasDue = Number(bill.amountDue) > 0;

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-[#F8FAFC]/90 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetails(bill)}
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
                          {/* View details */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(bill)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-navy hover:bg-navy/5"
                            title="View Bill Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Post / Confirm Bill */}
                          {isDraft && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={confirmingBillId === bill.id}
                              onClick={() => handleConfirmBill(bill.id)}
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

                          {/* Record Payment */}
                          {isConfirmed && hasDue && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPayment(bill)}
                              className="h-7 px-2 text-[11px] font-medium text-teal hover:text-teal/90 hover:bg-teal/10 gap-1"
                              title="Disburse Payment to Vendor"
                            >
                              <DollarSign className="w-3 h-3" />
                              Pay
                            </Button>
                          )}

                          {/* Send Reminder Email */}
                          {isConfirmed && hasDue && bill.vendor?.email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={sendingReminderId === bill.id}
                              onClick={() => handleSendReminder(bill.id)}
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

                          {/* Download PDF */}
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={downloadingId === bill.id}
                            onClick={() => handleDownloadPDF(bill)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Download PDF"
                          >
                            {downloadingId === bill.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ========================================================================= */}
      {/* ADD VENDOR BILL MODAL */}
      {/* ========================================================================= */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <DialogTitle className="text-lg font-bold text-navy">
                  Add Vendor Bill
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record materials and furniture goods procurement received from vendor.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-navy/5 text-navy border border-navy/10">
                Purchase Accounting
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-3">
            {/* Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Vendor */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Vendor <span className="text-destructive">*</span>
                </label>
                <select
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                >
                  <option value="">Select a Vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Purchase Order */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Purchase Order (Optional)
                </label>
                <select
                  value={formPurchaseOrder}
                  onChange={(e) => setFormPurchaseOrder(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                >
                  <option value="">Direct Bill (No PO)</option>
                  {purchaseOrders
                    .filter((po) => !formVendor || po.vendorId === formVendor)
                    .map((po) => (
                      <option key={po.id} value={po.poNumber}>
                        {po.poNumber}
                      </option>
                    ))}
                </select>
              </div>

              {/* Vendor Bill Number */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Vendor Bill Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. VEND-INV-9821"
                  value={formVendorBillNumber}
                  onChange={(e) => setFormVendorBillNumber(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                />
              </div>
            </div>

            {/* Date & Terms Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Bill Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formBillDate}
                  onChange={(e) => setFormBillDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Due Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Payment Terms
                </label>
                <select
                  value={formPaymentTerms}
                  onChange={(e) => {
                    setFormPaymentTerms(e.target.value);
                    const days = e.target.value === "NET_15" ? 15 : e.target.value === "NET_60" ? 60 : 30;
                    const d = new Date(formBillDate);
                    d.setDate(d.getDate() + days);
                    setFormDueDate(d.toISOString().split("T")[0]);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                >
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days (Standard)</option>
                  <option value="NET_60">Net 60 Days</option>
                  <option value="IMMEDIATE">Immediate / Due on Receipt</option>
                </select>
              </div>
            </div>

            {/* Item Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Item Table (Product / Material)
                </span>
                <Button
                  type="button"
                  onClick={handleAddLine}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5"
                >
                  <Plus className="w-3 h-3" />
                  Add Item Row
                </Button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-[24%]">Product / Material</th>
                      <th className="py-2.5 px-3 w-[22%]">Description</th>
                      <th className="py-2.5 px-3 w-[8%] text-right">Qty</th>
                      <th className="py-2.5 px-3 w-[8%] text-center">Unit</th>
                      <th className="py-2.5 px-3 w-[12%] text-right">Unit Cost (₹)</th>
                      <th className="py-2.5 px-3 w-[12%] text-left">Tax</th>
                      <th className="py-2.5 px-3 w-[8%] text-right">Disc %</th>
                      <th className="py-2.5 px-3 w-[10%] text-right">Amount</th>
                      <th className="py-2.5 px-2 w-[4%] text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {formLines.map((line, idx) => {
                      const qty = Number(line.quantity) || 0;
                      const cost = Number(line.unitCost) || 0;
                      const disc = Number(line.discountPercent) || 0;
                      const base = qty * cost;
                      const lineSubtotal = Math.max(0, base - (base * disc) / 100);

                      return (
                        <tr key={idx} className="hover:bg-surface-subtle/50">
                          {/* Product / Material */}
                          <td className="p-2">
                            <select
                              value={line.productId}
                              onChange={(e) =>
                                handleLineChange(idx, "productId", e.target.value)
                              }
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                            >
                              <option value="">Select item...</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} {p.sku ? `(${p.sku})` : ""}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Description */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) =>
                                handleLineChange(idx, "description", e.target.value)
                              }
                              placeholder="Specifications / Grade..."
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                            />
                          </td>

                          {/* Quantity */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={line.quantity}
                              onChange={(e) =>
                                handleLineChange(idx, "quantity", e.target.value)
                              }
                              className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                            />
                          </td>

                          {/* Unit */}
                          <td className="p-2 text-center">
                            <span className="text-[11px] text-muted-foreground font-medium">
                              {line.unit || "pcs"}
                            </span>
                          </td>

                          {/* Unit Cost */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitCost}
                              onChange={(e) =>
                                handleLineChange(idx, "unitCost", e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                            />
                          </td>

                          {/* Tax */}
                          <td className="p-2">
                            <select
                              value={line.taxRateId}
                              onChange={(e) =>
                                handleLineChange(idx, "taxRateId", e.target.value)
                              }
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                            >
                              <option value="">No Tax (0%)</option>
                              {taxRates.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.percentage}%)
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Discount */}
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={line.discountPercent}
                              onChange={(e) =>
                                handleLineChange(idx, "discountPercent", e.target.value)
                              }
                              className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                            />
                          </td>

                          {/* Line Amount */}
                          <td className="p-2 text-right font-medium text-foreground">
                            ₹{lineSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>

                          {/* Remove */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLine(idx)}
                              className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              title="Delete Row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
              {/* Left guidance */}
              <div className="w-full sm:w-1/2 p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-1.5 text-xs text-muted-foreground">
                <span className="font-semibold text-navy">Procurement & Accounts Payable</span>
                <p>
                  Posting this bill confirms receipt of materials and creates an outstanding payable obligation to the vendor in your ledger.
                </p>
              </div>

              {/* Totals Breakdown */}
              <div className="w-full sm:w-80 p-4 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-foreground">
                    ₹{formCalculations.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {formCalculations.totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>
                      -₹{formCalculations.totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>CGST:</span>
                  <span>
                    ₹{formCalculations.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>SGST:</span>
                  <span>
                    ₹{formCalculations.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Round Off:</span>
                  <span>
                    {formCalculations.roundOff >= 0 ? "+" : ""}
                    ₹{formCalculations.roundOff.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-2 mt-1">
                  <span>Grand Total:</span>
                  <span>
                    ₹{formCalculations.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Save Draft / Preview / Post Bill */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenCreateModal(false)}
                disabled={submitting}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSaveBill(true)}
                disabled={submitting}
                className="h-8.5 text-xs text-navy font-medium"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveBill(false)}
                disabled={submitting}
                className="h-8.5 text-xs bg-navy hover:bg-navy/90 text-white font-semibold gap-1.5"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Posting Bill...
                  </>
                ) : (
                  <>
                    <Receipt className="w-3.5 h-3.5" />
                    Post Bill
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* VENDOR BILL DETAILS MODAL */}
      {/* ========================================================================= */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          {selectedBillForView && (
            <div className="space-y-6">
              {/* Modal Header & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-navy">
                      Bill #{selectedBillForView.billNumber}
                    </h2>
                    <StatusBadge status={getDisplayStatus(selectedBillForView)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vendor Bill • Billed on{" "}
                    {new Date(selectedBillForView.billDate).toLocaleDateString("en-IN", {
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
                    onClick={() => handleDownloadPDF(selectedBillForView)}
                    disabled={downloadingId === selectedBillForView.id}
                    className="h-8 text-xs gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </Button>

                  {/* Print */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="h-8 text-xs gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>

                  {/* Send Reminder Email */}
                  {selectedBillForView.status === DocumentStatus.CONFIRMED &&
                    Number(selectedBillForView.amountDue) > 0 &&
                    selectedBillForView.vendor?.email && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={sendingReminderId === selectedBillForView.id}
                        onClick={() => handleSendReminder(selectedBillForView.id)}
                        className="h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 gap-1.5 font-medium shadow-2xs"
                      >
                        {sendingReminderId === selectedBillForView.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        Send Reminder
                      </Button>
                    )}

                  {/* Record Payment */}
                  {selectedBillForView.status === DocumentStatus.CONFIRMED &&
                    Number(selectedBillForView.amountDue) > 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          handleOpenPayment(selectedBillForView);
                        }}
                        className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-semibold gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Record Payment
                      </Button>
                    )}

                  {/* Cancel Bill */}
                  {selectedBillForView.status !== DocumentStatus.CANCELLED && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cancellingBillId === selectedBillForView.id}
                      onClick={() => handleCancelBill(selectedBillForView.id)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Bill
                    </Button>
                  )}
                </div>
              </div>

              {/* Vendor & Bill Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Bill Information */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Bill Information
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number:</span>
                      <span className="font-mono font-bold text-navy">
                        {selectedBillForView.billNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">
                        {new Date(selectedBillForView.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {selectedBillForView.purchaseOrder && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Order:</span>
                        <span className="font-semibold text-navy">
                          {selectedBillForView.purchaseOrder.poNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vendor Information
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-navy">
                      {selectedBillForView.vendor?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedBillForView.vendor?.email || "No email on record"}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedBillForView.vendor?.phone || "No phone on record"}
                    </p>
                  </div>
                </div>

                {/* Vendor Address & GSTIN */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Vendor Address & Tax ID
                  </span>
                  <div className="text-muted-foreground space-y-1">
                    {selectedBillForView.vendor?.address ? (
                      <p className="whitespace-pre-line leading-relaxed">
                        {selectedBillForView.vendor.address}
                      </p>
                    ) : (
                      <p className="italic">Vendor address not provided</p>
                    )}
                    <div className="pt-1 text-[11px]">
                      <span className="font-semibold text-navy">GSTIN: </span>
                      <span>Verified Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchased Products Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Purchased Products / Materials
                </span>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Item / Material</th>
                        <th className="py-2.5 px-3">Cost Center</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Unit Cost</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedBillForView.lines?.map((line) => (
                        <tr key={line.id} className="hover:bg-surface-subtle/40">
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {line.product?.name || "Product"}
                            {line.product?.sku && (
                              <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                                ({line.product.sku})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {line.analyticAccount?.name || "Default Cost Center"}
                          </td>
                          <td className="py-2.5 px-3 text-right">{Number(line.quantity)}</td>
                          <td className="py-2.5 px-3 text-right">
                            ₹{Number(line.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-navy">
                            ₹{Number(line.lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals & Outstanding */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Payment History */}
                <div className="w-full sm:w-1/2 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">
                    Payment History
                  </span>
                  {selectedBillForView.payments && selectedBillForView.payments.length > 0 ? (
                    <div className="space-y-1.5 border border-border rounded-xl p-3 bg-white">
                      {selectedBillForView.payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0"
                        >
                          <div>
                            <span className="font-semibold text-foreground">
                              ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[11px] text-muted-foreground ml-1.5">
                              via {p.paymentMethod}
                            </span>
                          </div>
                          <span className="text-muted-foreground text-[11px]">
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
                    <div className="p-4 rounded-xl bg-surface-subtle/50 border border-dashed border-border text-center text-xs text-muted-foreground">
                      No vendor disbursement payments recorded for this bill yet.
                    </div>
                  )}
                </div>

                {/* Amount breakdown */}
                <div className="w-full sm:w-80 p-4 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Bill Amount:</span>
                    <span className="font-bold text-foreground">
                      ₹{Number(selectedBillForView.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Amount Paid:</span>
                    <span className="font-medium">
                      ₹{Number(selectedBillForView.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-2 mt-1">
                    <span>Outstanding Balance:</span>
                    <span className={Number(selectedBillForView.amountDue) > 0 ? "text-amber-600" : "text-muted-foreground"}>
                      ₹{Number(selectedBillForView.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* ACCOUNTING SECTION */}
              {/* ================================================================= */}
              <div className="p-4 rounded-xl bg-[#16324F]/5 border border-navy/15 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-navy" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                    Accounting Entry (Double Entry Posting)
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirming/posting this vendor bill debits expense accounts and credits vendor payable obligations:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-teal">Purchase Expense</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        DEBIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Material cost recognized in P&L
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">Input Tax (GST)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        DEBIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Input tax credit claimable on purchases
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-navy">Vendor Payable</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        CREDIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Accounts payable liability owed to vendor
                    </p>
                  </div>
                </div>
              </div>

              {/* ================================================================= */}
              {/* EMAIL REMINDER AUDIT LOG SECTION */}
              {/* ================================================================= */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-navy" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                      Email Reminder & Audit History
                    </h3>
                  </div>
                  {modalEmailLogs.length > 0 && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {modalEmailLogs.length} reminder{modalEmailLogs.length === 1 ? "" : "s"} recorded
                    </span>
                  )}
                </div>

                {loadingLogs ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-navy" />
                    Loading email communication logs...
                  </div>
                ) : modalEmailLogs.length > 0 ? (
                  <div className="border border-border rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left">
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
                        {modalEmailLogs.map((log) => (
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
                            <td className="py-2.5 px-3 text-muted-foreground max-w-[220px] truncate" title={log.subject}>
                              {log.subject}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span
                                className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                                  log.status === "SENT" ? "text-emerald-600" : "text-destructive"
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${log.status === "SENT" ? "bg-emerald-600" : "bg-destructive"}`} />
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white border border-dashed border-border text-center text-xs text-muted-foreground">
                    No reminder emails have been dispatched for this bill yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* RECORD PAYMENT MODAL */}
      {/* ========================================================================= */}
      <Dialog open={openPaymentModal} onOpenChange={setOpenPaymentModal}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy">
              Record Vendor Payment
            </DialogTitle>
          </DialogHeader>
          {selectedBillForPayment && (
            <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
              <div className="p-3.5 bg-[#F8FAFC] border border-border rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill:</span>
                  <span className="font-mono font-bold text-navy">
                    {selectedBillForPayment.billNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendor:</span>
                  <span className="font-semibold">{selectedBillForPayment.vendor?.name}</span>
                </div>
                <div className="flex justify-between border-t border-border/70 pt-1.5 mt-1.5">
                  <span className="text-muted-foreground font-medium">Balance Due:</span>
                  <span className="font-bold text-amber-600">
                    ₹{Number(selectedBillForPayment.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <FormInput
                label="Payment Amount (₹)"
                type="number"
                required
                min="0.01"
                step="0.01"
                max={Number(selectedBillForPayment.amountDue)}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                helperText="Enter the exact amount paid to the vendor"
              />

              <FormSelect
                label="Payment Method"
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                options={[
                  { value: PaymentMethod.BANK, label: "Bank Transfer / RTGS / NEFT" },
                  { value: PaymentMethod.CASH, label: "Cash Disbursal" },
                ]}
              />

              <FormInput
                label="Payment Date"
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />

              <FormInput
                label="Note / UTR Reference (Optional)"
                type="text"
                placeholder="Bank UTR #, Cheque #, or disbursement reference"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpenPaymentModal(false)}
                  disabled={recordingPayment}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5"
                  disabled={recordingPayment}
                >
                  {recordingPayment ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Recording Payment...
                    </>
                  ) : (
                    "Confirm Disbursal"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
