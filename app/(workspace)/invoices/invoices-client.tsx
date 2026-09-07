"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { confirmInvoiceAction } from "@/app/actions/sales.actions";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import type {
  InvoiceWithRelations,
  InvoicesClientProps,
  InvoiceSummaryMetrics,
} from "./invoices-types";
import { InvoicesSummaryCards } from "./components/invoices-summary-cards";
import { InvoicesFilterBar } from "./components/invoices-filter-bar";
import { InvoicesTable } from "./components/invoices-table";

export function InvoicesClient({
  invoices,
  customers,
}: InvoicesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const customerFilter = searchParams.get("customer") || "ALL";
  const statusFilter = searchParams.get("status") || "ALL";
  const paymentStatusFilter = searchParams.get("paymentStatus") || "ALL";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  // Action status trackers
  const [confirmingInvoiceId, setConfirmingInvoiceId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

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

  const handleConfirmInvoice = async (invoiceId: string) => {
    setConfirmingInvoiceId(invoiceId);
    try {
      const result = await confirmInvoiceAction(invoiceId);
      if (result.success) {
        toast.success("Invoice confirmed! Journal Entry posted.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to confirm invoice");
      }
    } catch {
      toast.error("Error occurred while confirming invoice");
    } finally {
      setConfirmingInvoiceId(null);
    }
  };

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

  const summaryMetrics: InvoiceSummaryMetrics = React.useMemo(() => {
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
      if (isOverdue) overdueAmount += due;
    });

    return { totalCount, paidAmount, outstandingAmount, overdueAmount };
  }, [invoices]);

  const getDisplayStatus = (inv: InvoiceWithRelations): string => {
    if (inv.status === DocumentStatus.DRAFT) return "DRAFT";
    if (inv.status === DocumentStatus.CANCELLED) return "CANCELLED";
    if (inv.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (inv.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";
    const today = new Date();
    const due = new Date(inv.dueDate);
    if (due < today && inv.paymentStatus === PaymentStatus.NOT_PAID) return "OVERDUE";
    return "PENDING";
  };

  return (
    <div className="space-y-6 pb-12">
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
            onClick={() => router.push("/invoices/new")}
            className="h-9 px-3.5 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      <InvoicesSummaryCards summaryMetrics={summaryMetrics} />

      <InvoicesFilterBar
        search={search}
        customerFilter={customerFilter}
        statusFilter={statusFilter}
        paymentStatusFilter={paymentStatusFilter}
        startDate={startDate}
        endDate={endDate}
        customers={customers}
        totalRecords={invoices.length}
        onUpdateFilters={updateFilters}
        onClearFilters={() => router.push("/invoices")}
      />

      <InvoicesTable
        invoices={invoices}
        getDisplayStatus={getDisplayStatus}
        confirmingInvoiceId={confirmingInvoiceId}
        downloadingId={downloadingId}
        onViewInvoice={(inv) => router.push(`/invoices/${inv.id}`)}
        onConfirmInvoice={handleConfirmInvoice}
        onOpenPayment={(inv) =>
          router.push(`/payments/new?invoiceId=${inv.id}&returnUrl=/invoices`)
        }
        onDownloadPDF={handleDownloadPDF}
        onOpenCreateModal={() => router.push("/invoices/new")}
      />
    </div>
  );
}
