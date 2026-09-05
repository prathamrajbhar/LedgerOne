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
  ArrowRight,
  BookOpen,
  Calendar,
  Building2,
  Check,
  ChevronDown,
  Info,
  TrendingUp,
  X,
  CreditCard,
  User,
  ShieldCheck,
  Percent,
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
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  getInvoicesAction,
  createStandaloneInvoiceAction,
  confirmInvoiceAction,
  cancelInvoiceAction,
  getSalesOrdersAction,
} from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getTaxRatesAction } from "@/app/actions/tax-rate.actions";
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
  journalEntries?: Array<{
    id: string;
    entryNumber: string;
    lines: Array<{
      id: string;
      debit: Prisma.Decimal;
      credit: Prisma.Decimal;
      account: {
        code: string;
        name: string;
      };
    }>;
  }>;
}

interface FormLineRow {
  productId: string;
  description: string;
  quantity: number | "";
  unitPrice: number | "";
  taxRateId: string;
  discountPercent: number | "";
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = React.useState<InvoiceWithRelations[]>([]);
  const [customers, setCustomers] = React.useState<Contact[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [taxRates, setTaxRates] = React.useState<Array<{ id: string; name: string; percentage: number }>>([]);
  const [salesOrders, setSalesOrders] = React.useState<Array<{ id: string; soNumber: string; customerId: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters state
  const [search, setSearch] = React.useState("");
  const [customerFilter, setCustomerFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = React.useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

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

  // Dynamic product lines for create invoice
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

  // Load initial data
  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, customersRes, productsRes, taxRes, soRes] = await Promise.all([
        getInvoicesAction({ limit: 100 }),
        getContactsAction({ type: "CUSTOMER", limit: 100 }),
        getProductsAction({ limit: 100 }),
        getTaxRatesAction(),
        getSalesOrdersAction({ limit: 100 }),
      ]);

      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data.data as InvoiceWithRelations[]);
      } else {
        toast.error(invoicesRes.error || "Failed to fetch customer invoices");
      }

      if (customersRes.success && customersRes.data) {
        const cData = customersRes.data as { contacts?: Contact[] };
        setCustomers(cData.contacts || []);
      }

      if (productsRes.success && productsRes.data) {
        const pData = productsRes.data as { data?: Product[] };
        setProducts(pData.data || []);
      }

      if (taxRes.success && taxRes.data) {
        setTaxRates(taxRes.data as Array<{ id: string; name: string; percentage: number }>);
      }

      if (soRes.success && soRes.data) {
        const soData = soRes.data as { data?: Array<{ id: string; soNumber: string; customerId: string }> };
        setSalesOrders(soData.data || []);
      }
    } catch {
      toast.error("Failed to load invoice workspace data");
    } finally {
      setLoading(false);
    }
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

  // Compute live financial summary for creation form
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

  // Memoized options for searchable dropdowns in create modal
  const customerOptions = React.useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: c.name,
      subLabel: [c.email, c.phone].filter(Boolean).join(" • ") || undefined,
    }));
  }, [customers]);

  const salesOrderOptions = React.useMemo(() => {
    const filtered = salesOrders.filter((so) => !formCustomer || so.customerId === formCustomer);
    return [
      { value: "", label: "Direct Invoice (No Sales Order)" },
      ...filtered.map((so) => ({
        value: so.soNumber,
        label: so.soNumber,
      })),
    ];
  }, [salesOrders, formCustomer]);

  const productOptions = React.useMemo(() => {
    return products.map((p) => {
      const details = [
        p.sku ? `SKU: ${p.sku}` : null,
        p.salesPrice ? `₹${Number(p.salesPrice).toLocaleString("en-IN")}` : null,
        p.stock !== undefined && p.stock !== null ? `Stock: ${p.stock}` : null,
      ].filter(Boolean).join(" • ");

      return {
        value: p.id,
        label: p.name,
        subLabel: details || undefined,
      };
    });
  }, [products]);

  // Handle Create Invoice submission
  const handleSaveInvoice = async (asDraft = false) => {
    if (!formCustomer) {
      toast.error("Please select a furniture customer");
      return;
    }

    const validLines = formLines.filter(
      (l) => l.productId && Number(l.quantity) > 0 && Number(l.unitPrice) >= 0
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one complete product item with price and quantity");
      return;
    }

    setCreating(true);
    try {
      const invoiceLines = validLines.map((l) => {
        const qty = Number(l.quantity);
        const rawPrice = Number(l.unitPrice);
        const disc = Number(l.discountPercent) || 0;
        // Apply line-level discount proportionally to unit price if entered
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
        await fetchData();
      } else {
        toast.error(result.error || "Failed to generate invoice");
      }
    } catch {
      toast.error("An unexpected error occurred while creating the invoice");
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
        toast.success("Invoice confirmed! Journal Entry posted: Debit Accounts Receivable, Credit Sales Income.");
        await fetchData();
        if (selectedInvoiceForView?.id === invoiceId && result.data) {
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
    if (!confirm("Are you sure you want to cancel this customer invoice? This will reverse financial postings.")) {
      return;
    }
    setCancellingInvoiceId(invoiceId);
    try {
      const result = await cancelInvoiceAction(invoiceId);
      if (result.success) {
        toast.success("Invoice has been marked as Cancelled");
        await fetchData();
        if (selectedInvoiceForView?.id === invoiceId && result.data) {
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
        toast.error("Failed to generate PDF for this invoice");
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

  // Payment Recording modal open & submit
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
        toast.success("Payment recorded successfully & journal entry created");
        setOpenPaymentModal(false);
        await fetchData();
        if (selectedInvoiceForView?.id === selectedInvoiceForPayment.id) {
          setOpenDetailsModal(false);
        }
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    } catch {
      toast.error("Error recording customer payment");
    } finally {
      setRecordingPayment(false);
    }
  };

  // Compute real dashboard summary metrics
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

  // Compute helper status
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

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customer?.name.toLowerCase().includes(q) ||
      (inv.salesOrder?.soNumber && inv.salesOrder.soNumber.toLowerCase().includes(q));

    const matchesCustomer =
      customerFilter === "ALL" || inv.customerId === customerFilter;

    const displayStatus = getDisplayStatus(inv);
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "DRAFT" && inv.status === DocumentStatus.DRAFT) ||
      (statusFilter === "CONFIRMED" && inv.status === DocumentStatus.CONFIRMED) ||
      (statusFilter === "CANCELLED" && inv.status === DocumentStatus.CANCELLED) ||
      displayStatus === statusFilter;

    const matchesPaymentStatus =
      paymentStatusFilter === "ALL" ||
      inv.paymentStatus === paymentStatusFilter;

    let matchesDate = true;
    if (dateRangeFilter.start) {
      matchesDate =
        matchesDate && new Date(inv.invoiceDate) >= new Date(dateRangeFilter.start);
    }
    if (dateRangeFilter.end) {
      matchesDate =
        matchesDate && new Date(inv.invoiceDate) <= new Date(dateRangeFilter.end);
    }

    return (
      matchesSearch &&
      matchesCustomer &&
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
          Loading Customer Invoices & Ledger Data...
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
            className="h-9 px-3.5 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5 shadow-2xs hover:shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUMMARY SECTION (Real calculations or clean zero states) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoices */}
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
                : `Active furniture customer invoices`}
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
                ? "No customer payments collected yet"
                : "Total settled customer receivables"}
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
                ? "Zero outstanding customer balances"
                : "Pending customer sales dues"}
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
                ? "No overdue customer invoices"
                : "Receivables past due date"}
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
              placeholder="Search invoice/customer (e.g. INV00001, Acme Furniture)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8.5 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            />
          </div>

          {/* Filters cluster */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Customer Filter */}
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
        {(search || customerFilter !== "ALL" || statusFilter !== "ALL" || paymentStatusFilter !== "ALL" || dateRangeFilter.start || dateRangeFilter.end) && (
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
            <span>
              Showing {filteredInvoices.length} of {invoices.length} records
            </span>
            <button
              onClick={() => {
                setSearch("");
                setCustomerFilter("ALL");
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
      {/* INVOICE TABLE */}
      {/* ========================================================================= */}
      <Card className="border-border shadow-2xs overflow-hidden bg-white">
        {filteredInvoices.length === 0 ? (
          /* Empty State */
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
                {filteredInvoices.map((inv) => {
                  const displayStatus = getDisplayStatus(inv);
                  const isDraft = inv.status === DocumentStatus.DRAFT;
                  const isConfirmed = inv.status === DocumentStatus.CONFIRMED;
                  const isCancelled = inv.status === DocumentStatus.CANCELLED;
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
                      {/* Invoice # */}
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

                      {/* Customer */}
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-teal/10 text-teal flex items-center justify-center text-[10px] font-bold">
                            {inv.customer?.name ? inv.customer.name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <span>{inv.customer?.name}</span>
                        </div>
                      </td>

                      {/* Invoice Date */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.dueDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-medium text-foreground">
                        ₹{Number(inv.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-right text-emerald-600 font-medium">
                        ₹{Number(inv.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4 text-right font-semibold">
                        {hasDue ? (
                          <span className="text-amber-600">
                            ₹{Number(inv.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                            onClick={() => {
                              setSelectedInvoiceForView(inv);
                              setOpenDetailsModal(true);
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-navy hover:bg-navy/5"
                            title="View Invoice Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {/* Confirm Draft */}
                          {isDraft && (
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={confirmingInvoiceId === inv.id}
                              onClick={() => handleConfirmInvoice(inv.id)}
                              className="h-7 px-2 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                              title="Confirm Invoice & Post to Ledger"
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

                          {/* Record Payment */}
                          {isConfirmed && hasDue && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenPayment(inv)}
                              className="h-7 px-2 text-[11px] font-medium text-teal hover:text-teal/90 hover:bg-teal/10 gap-1"
                              title="Record Customer Payment"
                            >
                              <DollarSign className="w-3 h-3" />
                              Pay
                            </Button>
                          )}

                          {/* Download PDF */}
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

      {/* ========================================================================= */}
      {/* CREATE INVOICE MODAL */}
      {/* ========================================================================= */}
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
            {/* Header Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Customer */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Customer <span className="text-destructive">*</span>
                </label>
                <SearchableSelect
                  options={customerOptions}
                  value={formCustomer}
                  onChange={(val) => {
                    setFormCustomer(val);
                    if (formSalesOrder) {
                      const linkedSo = salesOrders.find((so) => so.soNumber === formSalesOrder);
                      if (linkedSo && linkedSo.customerId !== val) {
                        setFormSalesOrder("");
                      }
                    }
                  }}
                  placeholder="Select a Customer"
                  searchPlaceholder="Search customer by name, email..."
                />
              </div>

              {/* Sales Order Reference */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Sales Order (Optional)
                </label>
                <SearchableSelect
                  options={salesOrderOptions}
                  value={formSalesOrder}
                  onChange={(val) => setFormSalesOrder(val)}
                  placeholder="Direct Invoice (No Sales Order)"
                  searchPlaceholder="Search sales order..."
                />
              </div>

              {/* Payment Terms */}
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
                  <option value="NET_30">Net 30 Days (Standard)</option>
                  <option value="NET_60">Net 60 Days</option>
                  <option value="IMMEDIATE">Immediate / Due on Receipt</option>
                </select>
              </div>
            </div>

            {/* Date Fields */}
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

            {/* Product Items Table */}
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
                      <th className="py-2.5 px-3 w-[14%] text-right">Unit Price (₹)</th>
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
                          {/* Product */}
                          <td className="p-2 min-w-[220px]">
                            <SearchableSelect
                              size="sm"
                              options={productOptions}
                              value={line.productId}
                              onChange={(val) =>
                                handleLineChange(idx, "productId", val)
                              }
                              placeholder="Select product..."
                              searchPlaceholder="Search product by name, SKU..."
                            />
                          </td>

                          {/* Description */}
                          <td className="p-2">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) =>
                                handleLineChange(idx, "description", e.target.value)
                              }
                              placeholder="Specifications / Finish..."
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

                          {/* Unit Price */}
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

                          {/* Line Subtotal */}
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

            {/* Financial Summary Breakdown */}
            <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
              {/* Notes */}
              <div className="w-full sm:w-1/2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Invoice Terms & Notes
                </label>
                <textarea
                  rows={4}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Terms of warranty, delivery schedule, payment conditions..."
                  className="w-full p-2.5 rounded-lg border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy resize-none"
                />
              </div>

              {/* Totals Calculation */}
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

            {/* Actions: Cancel / Save Draft / Create Invoice */}
            <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpenCreateModal(false)}
                disabled={creating}
                className="h-9 px-4 text-xs font-medium text-slate-600 bg-white border border-border hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSaveInvoice(true)}
                disabled={creating}
                className="h-9 px-4 text-xs font-semibold text-navy bg-white border border-border hover:bg-slate-50 hover:border-slate-300 rounded-lg transition-colors shadow-2xs"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSaveInvoice(false)}
                disabled={creating}
                className="h-9 px-5 text-xs font-semibold bg-navy hover:bg-navy/90 text-white rounded-lg shadow-sm gap-2 transition-all active:scale-[0.98]"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Invoice...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-teal-300" />
                    <span>Create Invoice</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* INVOICE DETAILS MODAL */}
      {/* ========================================================================= */}
      <Dialog open={openDetailsModal} onOpenChange={setOpenDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          {selectedInvoiceForView && (
            <div className="space-y-6">
              {/* Modal Header & Quick Actions */}
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
                  {/* Download PDF */}
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

                  {/* Record Payment */}
                  {selectedInvoiceForView.status === DocumentStatus.CONFIRMED &&
                    Number(selectedInvoiceForView.amountDue) > 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          handleOpenPayment(selectedInvoiceForView);
                        }}
                        className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-semibold gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Record Payment
                      </Button>
                    )}

                  {/* Cancel Invoice */}
                  {selectedInvoiceForView.status !== DocumentStatus.CANCELLED && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={cancellingInvoiceId === selectedInvoiceForView.id}
                      onClick={() => handleCancelInvoice(selectedInvoiceForView.id)}
                      className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancel Invoice
                    </Button>
                  )}
                </div>
              </div>

              {/* Invoice & Customer Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Invoice Information */}
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

                {/* Customer Information */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Customer Information
                  </span>
                  <div className="space-y-1">
                    <p className="font-bold text-navy">
                      {selectedInvoiceForView.customer?.name}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedInvoiceForView.customer?.email || "No email on record"}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedInvoiceForView.customer?.phone || "No phone on record"}
                    </p>
                  </div>
                </div>

                {/* Billing Address */}
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
                      <p className="italic">Customer billing address not provided</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Table */}
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

              {/* Financial Totals & Outstanding */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Payment History */}
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
                      No payment settlements recorded for this invoice yet.
                    </div>
                  )}
                </div>

                {/* Amount breakdown */}
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
                    <span>Outstanding Amount:</span>
                    <span className={Number(selectedInvoiceForView.amountDue) > 0 ? "text-amber-600" : "text-muted-foreground"}>
                      ₹{Number(selectedInvoiceForView.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
                  Confirming this sales invoice automatically credits sales income and debits customer receivables:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-navy">Customer Receivable</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        DEBIT
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Customer owes money to the business
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
                      Revenue recognized from furniture sales
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
                      GST collected on furniture sales
                    </p>
                  </div>
                </div>
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
                helperText="Enter the exact amount collected from the customer"
              />

              <FormSelect
                label="Payment Method"
                value={paymentMethod}
                onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
                options={[
                  { value: PaymentMethod.BANK, label: "Bank Transfer / NEFT / IMPS" },
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
                label="Note / Transaction Ref (Optional)"
                type="text"
                placeholder="Bank UTR #, Cheque #, or receipt notes"
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
