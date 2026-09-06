"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import {
  createStandaloneInvoiceAction,
  confirmInvoiceAction,
  cancelInvoiceAction,
} from "@/app/actions/sales.actions";
import { recordPaymentAction } from "@/app/actions/payment.actions";
import { DocumentStatus, PaymentStatus, PaymentMethod, Prisma } from "@prisma/client";
import type { CustomerInvoice, Contact, Product } from "@prisma/client";

interface InvoiceLineItem {
  id: string;
  productId: string;
  quantity: Prisma.Decimal | number;
  unitPrice: Prisma.Decimal | number;
  lineTotal: Prisma.Decimal | number;
  taxAmount: Prisma.Decimal | number;
  taxRateId?: string | null;
  product: {
    id: string;
    name: string;
    sku?: string | null;
    category?: string | null;
  };
  taxRate?: {
    id: string;
    name: string;
    percentage: Prisma.Decimal | number;
  } | null;
}

interface InvoicePaymentItem {
  id: string;
  amount: Prisma.Decimal | number;
  paymentDate: Date | string;
  paymentMethod: PaymentMethod;
  note?: string | null;
}

interface InvoiceWithRelations extends CustomerInvoice {
  customer: Contact;
  salesOrder?: {
    id: string;
    soNumber: string;
  } | null;
  lines: InvoiceLineItem[];
  payments: InvoicePaymentItem[];
}

interface FormLineRow {
  productId: string;
  description: string;
  quantity: number | "";
  unitPrice: number | "";
  taxRateId: string;
  discountPercent: number | "";
}

interface InvoicesClientProps {
  invoices: InvoiceWithRelations[];
  customers: Contact[];
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  salesOrders: Array<{ id: string; soNumber: string; customerId: string }>;
}

export function InvoicesClient({
  invoices,
  customers,
  products,
  taxRates,
  salesOrders,
}: InvoicesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters from URL
  const search = searchParams.get("search") || "";
  const customerFilter = searchParams.get("customer") || "ALL";
  const statusFilter = searchParams.get("status") || "ALL";
  const paymentStatusFilter = searchParams.get("paymentStatus") || "ALL";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  // Modals state
  const [openCreateModal, setOpenCreateModal] = React.useState(false);
  const [openDetailsModal, setOpenDetailsModal] = React.useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = React.useState<InvoiceWithRelations | null>(null);

  // Payment modal state
  const [openPaymentModal, setOpenPaymentModal] = React.useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = React.useState<InvoiceWithRelations | null>(null);
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.BANK);
  const [paymentDate, setPaymentDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [paymentNote, setPaymentNote] = React.useState("");
  const [recordingPayment, setRecordingPayment] = React.useState(false);

  // Action status trackers
  const [confirmingInvoiceId, setConfirmingInvoiceId] = React.useState<string | null>(null);
  const [cancellingInvoiceId, setCancellingInvoiceId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  // Create Invoice Form State
  const [formCustomer, setFormCustomer] = React.useState("");
  const [formSalesOrder, setFormSalesOrder] = React.useState("");
  const [formInvoiceDate, setFormInvoiceDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formPaymentTerms, setFormPaymentTerms] = React.useState("NET_30");
  const [formNotes, setFormNotes] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  // Dynamic product lines
  const [formLines, setFormLines] = React.useState<FormLineRow[]>([
    {
      productId: "",
      description: "",
      quantity: 1,
      unitPrice: "",
      taxRateId: "",
      discountPercent: 0,
    },
  ]);

  // Searchable select options for Create Invoice Modal
  const customerOptions = React.useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: c.name,
      subLabel: c.phone || c.email || undefined,
    }));
  }, [customers]);

  const salesOrderOptions = React.useMemo(() => {
    const availableOrders = salesOrders.filter(
      (so) => !formCustomer || so.customerId === formCustomer
    );
    return [
      { value: "", label: "Direct Invoice (No Sales Order)" },
      ...availableOrders.map((so) => ({
        value: so.soNumber,
        label: so.soNumber,
      })),
    ];
  }, [salesOrders, formCustomer]);

  const productOptions = React.useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.name,
      subLabel: p.sku ? `SKU: ${p.sku} • ₹${Number(p.salesPrice || 0).toLocaleString("en-IN")}` : `₹${Number(p.salesPrice || 0).toLocaleString("en-IN")}`,
    }));
  }, [products]);

  // Update URL with new filter values
  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "ALL" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/invoices?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/invoices");
  };

  // Dynamic line management
  const handleAddLine = () => {
    setFormLines((prev) => [
      ...prev,
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: "",
        taxRateId: taxRates[0]?.id || "",
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) {
      toast.error("An invoice requires at least one product row");
      return;
    }
    setFormLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index: number, field: keyof FormLineRow, value: unknown) => {
    setFormLines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === "productId") {
        const selProd = products.find((p) => p.id === value);
        if (selProd) {
          current.description = selProd.name;
          current.unitPrice = Number(selProd.salesPrice) || 0;
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  // Compute live financial summary
  const formCalculations = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    formLines.forEach((line) => {
      const qty = Number(line.quantity) || 0;
      const price = Number(line.unitPrice) || 0;
      const discountPct = Number(line.discountPercent) || 0;

      const baseAmount = qty * price;
      const discountAmt = (baseAmount * discountPct) / 100;
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
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      cgst,
      sgst,
      grandTotal,
    };
  }, [formLines, taxRates]);

  // Handle Create Invoice submission
  const handleSaveInvoice = async (asDraft = false) => {
    if (!formCustomer) {
      toast.error("Please select a customer");
      return;
    }

    const validLines = formLines.filter(
      (l) => l.productId && Number(l.quantity) > 0 && Number(l.unitPrice) >= 0
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one product with price and quantity");
      return;
    }

    setCreating(true);
    try {
      const invoiceLines = validLines.map((l) => {
        const qty = Number(l.quantity);
        const rawPrice = Number(l.unitPrice);
        const disc = Number(l.discountPercent) || 0;
        const effectiveUnitPrice = disc > 0 ? rawPrice * (1 - disc / 100) : rawPrice;

        return {
          productId: l.productId,
          description: l.description || "Furniture Item",
          quantity: qty,
          unitPrice: effectiveUnitPrice,
          taxRateId: l.taxRateId || undefined,
        };
      });

      const result = await createStandaloneInvoiceAction({
        customerId: formCustomer,
        invoiceDate: new Date(formInvoiceDate),
        dueDate: new Date(formDueDate),
        invoiceReference: formSalesOrder ? `SO-${formSalesOrder}` : undefined,
        notes: formNotes || undefined,
        lines: invoiceLines,
      });

      if (result.success && result.data) {
        toast.success(
          `Customer Invoice ${result.data.invoiceNumber} created successfully${
            asDraft ? " as Draft" : ""
          }`
        );
        setOpenCreateModal(false);
        // Reset form
        setFormCustomer("");
        setFormSalesOrder("");
        setFormNotes("");
        setFormLines([
          {
            productId: "",
            description: "",
            quantity: 1,
            unitPrice: "",
            taxRateId: taxRates[0]?.id || "",
            discountPercent: 0,
          },
        ]);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to generate invoice");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  // Confirm Invoice handler
  const handleConfirmInvoice = async (invoiceId: string) => {
    setConfirmingInvoiceId(invoiceId);
    try {
      const result = await confirmInvoiceAction(invoiceId);
      if (result.success) {
        toast.success("Invoice confirmed! Journal Entry posted.");
        router.refresh();
        if (selectedInvoiceForView?.id === invoiceId) {
          setSelectedInvoiceForView((prev) =>
            prev ? ({ ...prev, status: DocumentStatus.CONFIRMED } as InvoiceWithRelations) : null
          );
        }
      } else {
        toast.error(result.error || "Failed to confirm invoice");
      }
    } catch {
      toast.error("Error occurred while confirming invoice");
    } finally {
      setConfirmingInvoiceId(null);
    }
  };

  // Cancel Invoice handler
  const handleCancelInvoice = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to cancel this invoice?")) {
      return;
    }
    setCancellingInvoiceId(invoiceId);
    try {
      const result = await cancelInvoiceAction(invoiceId);
      if (result.success) {
        toast.success("Invoice has been cancelled");
        router.refresh();
        if (selectedInvoiceForView?.id === invoiceId) {
          setSelectedInvoiceForView((prev) =>
            prev ? ({ ...prev, status: DocumentStatus.CANCELLED } as InvoiceWithRelations) : null
          );
        }
      } else {
        toast.error(result.error || "Failed to cancel invoice");
      }
    } catch {
      toast.error("Error occurred while cancelling invoice");
    } finally {
      setCancellingInvoiceId(null);
    }
  };

  // PDF Download handler
  const handleDownloadPDF = async (inv: InvoiceWithRelations) => {
    setDownloadingId(inv.id);
    try {
      const response = await fetch(`/api/invoices/${inv.id}/download`);
      if (!response.ok) {
        toast.error("Failed to generate PDF");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${inv.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded Invoice-${inv.invoiceNumber}.pdf`);
    } catch {
      toast.error("Error downloading PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  // Payment Recording
  const handleOpenPayment = (inv: InvoiceWithRelations) => {
    setSelectedInvoiceForPayment(inv);
    setPaymentAmount(Number(inv.amountDue).toFixed(2));
    setPaymentMethod(PaymentMethod.BANK);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNote("");
    setOpenPaymentModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !paymentAmount) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const amt = parseFloat(paymentAmount);
    const due = Number(selectedInvoiceForPayment.amountDue);

    if (amt <= 0) {
      toast.error("Payment amount must be greater than zero");
      return;
    }
    if (amt > due) {
      toast.error("Payment amount cannot exceed balance due");
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await recordPaymentAction({
        documentId: selectedInvoiceForPayment.id,
        documentType: "INVOICE",
        amount: amt,
        paymentMethod,
        paymentDate: new Date(paymentDate),
        note: paymentNote || undefined,
      });

      if (res.success) {
        toast.success("Payment recorded successfully");
        setOpenPaymentModal(false);
        router.refresh();
        if (selectedInvoiceForView?.id === selectedInvoiceForPayment.id) {
          setOpenDetailsModal(false);
        }
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch {
      toast.error("Error recording payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  // Summary metrics
  const summaryMetrics = React.useMemo(() => {
    let totalCount = 0;
    let paidAmount = 0;
    let outstandingAmount = 0;
    let overdueAmount = 0;

    const today = new Date();

    invoices.forEach((inv) => {
      if (inv.status === DocumentStatus.CANCELLED) return;
      totalCount += 1;

      const paid = Number(inv.amountPaid) || 0;
      const due = Number(inv.amountDue) || 0;

      paidAmount += paid;
      outstandingAmount += due;

      const isOverdue =
        due > 0 &&
        new Date(inv.dueDate) < today &&
        inv.paymentStatus !== PaymentStatus.PAID;

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
  }, [invoices]);

  // Display status helper
  const getDisplayStatus = (inv: InvoiceWithRelations): string => {
    if (inv.status === DocumentStatus.DRAFT) return "DRAFT";
    if (inv.status === DocumentStatus.CANCELLED) return "CANCELLED";
    if (inv.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (inv.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";

    const today = new Date();
    const due = new Date(inv.dueDate);
    if (due < today && inv.paymentStatus === PaymentStatus.NOT_PAID) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  const hasActiveFilters = search || customerFilter !== "ALL" || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || startDate || endDate;

  return (
    <div className="space-y-6 pb-12">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              Customer Invoices
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal/10 text-teal border border-teal/20">
              Sales Cycle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Create, manage and track invoices generated from customer sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setOpenCreateModal(true)}
            className="h-9 px-3.5 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* SUMMARY SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 border-border shadow-2xs bg-white hover:border-border-strong transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invoices</span>
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
                ? "Zero customer invoices issued"
                : `Active customer invoices`}
            </p>
          </div>
        </Card>

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
                ? "No payments collected yet"
                : "Total settled receivables"}
            </p>
          </div>
        </Card>

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
                ? "Zero outstanding balances"
                : "Pending sales dues"}
            </p>
          </div>
        </Card>

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
                ? "No overdue invoices"
                : "Receivables past due date"}
            </p>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card className="p-3 border-border shadow-2xs bg-white space-y-2.5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search invoice/customer..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select
              value={customerFilter}
              onChange={(e) => updateFilters({ customer: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">Document Status</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={paymentStatusFilter}
              onChange={(e) => updateFilters({ paymentStatus: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">Payment Status</option>
              <option value="NOT_PAID">Not Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="PAID">Paid in Full</option>
            </select>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => updateFilters({ startDate: e.target.value })}
                className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                title="Start Date"
              />
              <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => updateFilters({ endDate: e.target.value })}
                className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                title="End Date"
              />
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span>
              Showing {invoices.length} record{invoices.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={clearFilters}
              className="text-teal hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </Card>

      {/* INVOICE TABLE */}
      <Card className="border-border shadow-2xs overflow-hidden bg-white">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy border border-navy/10 flex items-center justify-center mb-4 shadow-2xs">
              <Receipt className="w-7 h-7 text-navy" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-navy">
              No customer invoices yet
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
              Create your first invoice to start tracking customer receivables.
            </p>
            <Button
              onClick={() => setOpenCreateModal(true)}
              className="mt-5 h-9 px-4 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv) => {
                  const displayStatus = getDisplayStatus(inv);
                  const isDraft = inv.status === DocumentStatus.DRAFT;
                  const isConfirmed = inv.status === DocumentStatus.CONFIRMED;
                  const hasDue = Number(inv.amountDue) > 0;

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#F8FAFC]/90 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedInvoiceForView(inv);
                        setOpenDetailsModal(true);
                      }}
                    >
                      <td className="py-3.5 px-4 font-bold text-navy">
                        <div className="flex items-center gap-1.5">
                          <span>{inv.invoiceNumber}</span>
                          {inv.salesOrder && (
                            <span className="text-[10px] font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              SO: {inv.salesOrder.soNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal/10 text-teal flex items-center justify-center text-[10px] font-bold">
                            {inv.customer?.name ? inv.customer.name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <span>{inv.customer?.name}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-foreground">
                        ₹{Number(inv.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">
                        ₹{Number(inv.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold">
                        {hasDue ? (
                          <span className="text-amber-600">
                            ₹{Number(inv.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                            onClick={() => {
                              setSelectedInvoiceForView(inv);
                              setOpenDetailsModal(true);
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-navy hover:bg-navy/5"
                            title="View Invoice Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {isDraft && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={confirmingInvoiceId === inv.id}
                              onClick={() => handleConfirmInvoice(inv.id)}
                              className="h-7 px-2 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                              title="Confirm Invoice"
                            >
                              {confirmingInvoiceId === inv.id ? (
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
                              onClick={() => handleOpenPayment(inv)}
                              className="h-7 px-2 text-[11px] font-medium text-teal hover:text-teal/90 hover:bg-teal/10 gap-1"
                              title="Record Payment"
                            >
                              <DollarSign className="w-3 h-3" />
                              Pay
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={downloadingId === inv.id}
                            onClick={() => handleDownloadPDF(inv)}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Download PDF"
                          >
                            {downloadingId === inv.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
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

      {/* CREATE INVOICE MODAL */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <DialogTitle className="text-lg font-bold text-navy">
                  Create Customer Invoice
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate an official sales invoice for furniture delivered to customer.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-navy/5 text-navy border border-navy/10">
                Sales Accounting
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-6 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Customer <span className="text-destructive">*</span>
                </label>
                <SearchableSelect
                  options={customerOptions}
                  value={formCustomer}
                  onChange={(val) => {
                    setFormCustomer(val);
                    // Clear selected sales order if customer changes and order does not match
                    if (formSalesOrder) {
                      const so = salesOrders.find((s) => s.soNumber === formSalesOrder);
                      if (so && so.customerId !== val) {
                        setFormSalesOrder("");
                      }
                    }
                  }}
                  placeholder="Select a Customer"
                  searchPlaceholder="Search customer by name or phone..."
                  emptyMessage="No customers found"
                  className="h-9"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Sales Order (Optional)
                </label>
                <SearchableSelect
                  options={salesOrderOptions}
                  value={formSalesOrder}
                  onChange={(val) => setFormSalesOrder(val)}
                  placeholder="Direct Invoice"
                  searchPlaceholder="Search sales order..."
                  emptyMessage="No sales orders found"
                  className="h-9"
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
                    const d = new Date(formInvoiceDate);
                    d.setDate(d.getDate() + days);
                    setFormDueDate(d.toISOString().split("T")[0]);
                  }}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                >
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days</option>
                  <option value="NET_60">Net 60 Days</option>
                  <option value="IMMEDIATE">Immediate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Invoice Date <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formInvoiceDate}
                  onChange={(e) => setFormInvoiceDate(e.target.value)}
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
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Invoice Item Table
                </span>
                <Button
                  type="button"
                  onClick={handleAddLine}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5"
                >
                  <Plus className="w-3 h-3" />
                  Add Product Row
                </Button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 w-[26%]">Product</th>
                      <th className="py-2.5 px-3 w-[24%]">Description</th>
                      <th className="py-2.5 px-3 w-[10%] text-right">Qty</th>
                      <th className="py-2.5 px-3 w-[14%] text-right">Unit Price</th>
                      <th className="py-2.5 px-3 w-[14%] text-left">Tax</th>
                      <th className="py-2.5 px-3 w-[10%] text-right">Disc %</th>
                      <th className="py-2.5 px-3 w-[12%] text-right">Subtotal</th>
                      <th className="py-2.5 px-2 w-[4%] text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {formLines.map((line, idx) => {
                      const qty = Number(line.quantity) || 0;
                      const price = Number(line.unitPrice) || 0;
                      const disc = Number(line.discountPercent) || 0;
                      const base = qty * price;
                      const lineSubtotal = Math.max(0, base - (base * disc) / 100);

                      return (
                        <tr key={idx} className="hover:bg-surface-subtle/50">
                          <td className="p-2 min-w-[200px]">
                            <SearchableSelect
                              size="sm"
                              options={productOptions}
                              value={line.productId}
                              onChange={(val) =>
                                handleLineChange(idx, "productId", val)
                              }
                              placeholder="Select product..."
                              searchPlaceholder="Search product by name or SKU..."
                              emptyMessage="No products found"
                              className="h-8"
                            />
                          </td>

                          <td className="p-2">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) =>
                                handleLineChange(idx, "description", e.target.value)
                              }
                              placeholder="Details..."
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                            />
                          </td>

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

                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={line.unitPrice}
                              onChange={(e) =>
                                handleLineChange(idx, "unitPrice", e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                            />
                          </td>

                          <td className="p-2">
                            <select
                              value={line.taxRateId}
                              onChange={(e) =>
                                handleLineChange(idx, "taxRateId", e.target.value)
                              }
                              className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                            >
                              <option value="">No Tax</option>
                              {taxRates.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} ({t.percentage}%)
                                </option>
                              ))}
                            </select>
                          </td>

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

                          <td className="p-2 text-right font-medium text-foreground">
                            ₹{lineSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>

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

            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
              <div className="w-full sm:w-1/2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Invoice Terms & Notes
                </label>
                <textarea
                  rows={4}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Terms of warranty, delivery schedule..."
                  className="w-full p-2.5 rounded-lg border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy resize-none"
                />
              </div>

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
                <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-2 mt-1">
                  <span>Grand Total:</span>
                  <span>
                    ₹{formCalculations.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenCreateModal(false)}
                disabled={creating}
                className="h-8.5 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleSaveInvoice(true)}
                disabled={creating}
                className="h-8.5 text-xs text-navy font-medium"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveInvoice(false)}
                disabled={creating}
                className="h-8.5 text-xs bg-navy hover:bg-navy/90 text-white font-semibold gap-1.5"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Receipt className="w-3.5 h-3.5" />
                    Create Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* INVOICE DETAILS MODAL */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          {selectedInvoiceForView && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-navy">
                      Invoice #{selectedInvoiceForView.invoiceNumber}
                    </h2>
                    <StatusBadge status={getDisplayStatus(selectedInvoiceForView)} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sales Invoice • Created on{" "}
                    {new Date(selectedInvoiceForView.invoiceDate).toLocaleDateString("en-IN", {
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
                    onClick={() => handleDownloadPDF(selectedInvoiceForView)}
                    disabled={downloadingId === selectedInvoiceForView.id}
                    className="h-8 text-xs gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="h-8 text-xs gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print
                  </Button>

                  {selectedInvoiceForView.status === DocumentStatus.CONFIRMED &&
                    Number(selectedInvoiceForView.amountDue) > 0 && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenPayment(selectedInvoiceForView)}
                        className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-semibold gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Record Payment
                      </Button>
                    )}

                  {selectedInvoiceForView.status !== DocumentStatus.CANCELLED && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cancellingInvoiceId === selectedInvoiceForView.id}
                      onClick={() => handleCancelInvoice(selectedInvoiceForView.id)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Invoice Information
                  </span>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Number:</span>
                      <span className="font-mono font-bold text-navy">
                        {selectedInvoiceForView.invoiceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">
                        {new Date(selectedInvoiceForView.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {selectedInvoiceForView.salesOrder && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sales Order:</span>
                        <span className="font-semibold text-navy">
                          {selectedInvoiceForView.salesOrder.soNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Customer Information
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-navy">
                      {selectedInvoiceForView.customer?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedInvoiceForView.customer?.email || "No email"}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedInvoiceForView.customer?.phone || "No phone"}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Billing Address
                  </span>
                  <div className="text-muted-foreground">
                    {selectedInvoiceForView.customer?.address ? (
                      <p className="whitespace-pre-line leading-relaxed">
                        {selectedInvoiceForView.customer.address}
                      </p>
                    ) : (
                      <p className="italic">No address provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Purchased Products
                </span>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3 text-right">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Tax Rate</th>
                        <th className="py-2.5 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedInvoiceForView.lines?.map((line) => (
                        <tr key={line.id} className="hover:bg-surface-subtle/40">
                          <td className="py-2.5 px-3 font-medium text-foreground">
                            {line.product?.name || "Product"}
                            {line.product?.sku && (
                              <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                                ({line.product.sku})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">{Number(line.quantity)}</td>
                          <td className="py-2.5 px-3 text-right">
                            ₹{Number(line.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right text-muted-foreground">
                            {line.taxRate ? `${line.taxRate.percentage}%` : "0%"}
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

              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="w-full sm:w-1/2 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">
                    Payment History
                  </span>
                  {selectedInvoiceForView.payments && selectedInvoiceForView.payments.length > 0 ? (
                    <div className="space-y-1.5 border border-border rounded-xl p-3 bg-white">
                      {selectedInvoiceForView.payments.map((p) => (
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
                      No payments recorded yet
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-80 p-4 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Amount:</span>
                    <span className="font-bold text-foreground">
                      ₹{Number(selectedInvoiceForView.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Amount Paid:</span>
                    <span className="font-medium">
                      ₹{Number(selectedInvoiceForView.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-2 mt-1">
                    <span>Outstanding:</span>
                    <span className={Number(selectedInvoiceForView.amountDue) > 0 ? "text-amber-600" : "text-muted-foreground"}>
                      ₹{Number(selectedInvoiceForView.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#16324F]/5 border border-navy/15 space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-navy" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                    Accounting Entry
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirming this invoice automatically posts double entry journal entries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-navy">Accounts Receivable</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        DEBIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Customer owes money
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-teal">Sales Income</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        CREDIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Revenue recognized
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-foreground">Tax Payable</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        CREDIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      GST collected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* RECORD PAYMENT MODAL */}
      <Dialog open={openPaymentModal} onOpenChange={setOpenPaymentModal}>
        <DialogContent className="max-w-md p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy">
              Record Customer Payment
            </DialogTitle>
          </DialogHeader>
          {selectedInvoiceForPayment && (
            <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
              <div className="p-3.5 bg-[#F8FAFC] border border-border rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice:</span>
                  <span className="font-mono font-bold text-navy">
                    {selectedInvoiceForPayment.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-semibold">{selectedInvoiceForPayment.customer?.name}</span>
                </div>
                <div className="flex justify-between border-t border-border/70 pt-1.5 mt-1.5">
                  <span className="text-muted-foreground font-medium">Balance Due:</span>
                  <span className="font-bold text-amber-600">
                    ₹{Number(selectedInvoiceForPayment.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <FormInput
                label="Payment Amount (₹)"
                type="number"
                required
                min="0.01"
                step="0.01"
                max={Number(selectedInvoiceForPayment.amountDue)}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                helperText="Enter the amount collected"
              />

              <FormSelect
                label="Payment Method"
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                options={[
                  { value: PaymentMethod.BANK, label: "Bank Transfer" },
                  { value: PaymentMethod.CASH, label: "Cash Receipt" },
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
                label="Note / Reference (Optional)"
                type="text"
                placeholder="Bank UTR, Cheque #, etc."
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
                      Recording...
                    </>
                  ) : (
                    "Confirm Receipt"
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
