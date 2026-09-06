"use client";

import * as React from "react";
import Link from "next/link";
import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, CreditCard, Download, Loader2 } from "lucide-react";
import { PaymentStatus, DocumentStatus } from "@prisma/client";
import { toast } from "sonner";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

interface InvoiceLineItem {
  id: string;
  quantity: number | string;
  unitPrice: number | string;
  lineTotal: number | string;
  product: {
    name: string;
    sku?: string | null;
  };
}

interface PortalInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  status: DocumentStatus;
  salesOrder?: {
    soNumber: string;
  } | null;
  lines: InvoiceLineItem[];
}

interface PortalInvoicesClientProps {
  invoices: PortalInvoice[];
}

export function PortalInvoicesClient({ invoices }: PortalInvoicesClientProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const getDisplayStatus = (inv: PortalInvoice): string => {
    if (inv.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (inv.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";

    const today = new Date();
    const due = new Date(inv.dueDate);
    if (due < today && inv.paymentStatus === PaymentStatus.NOT_PAID) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.salesOrder?.soNumber && inv.salesOrder.soNumber.toLowerCase().includes(search.toLowerCase()));
    const displayStatus = getDisplayStatus(inv);
    const matchesStatus = statusFilter === "ALL" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownload = async (inv: PortalInvoice) => {
    setDownloadingId(inv.id);
    try {
      const response = await fetch(`/api/invoices/${inv.id}/download`);
      if (!response.ok) {
        toast.error("Failed to download invoice");
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
      toast.success("Invoice downloaded successfully");
    } catch {
      toast.error("Error downloading invoice");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Customer Invoices
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review professional GST sales invoices for furniture deliveries and track customer receivables.
          </p>
        </div>
      </div>

      {/* Toolbar with Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="w-full sm:w-80">
          <DebouncedSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search invoice # or order ref..."
            className="h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-[#F6F7F9] border border-border overflow-x-auto max-w-full">
          {["ALL", "PENDING", "PAID", "PARTIAL", "OVERDUE"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                statusFilter === s
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "ALL" ? "All Invoices" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            {search || statusFilter !== "ALL"
              ? "No invoices found matching your filters."
              : "No customer invoices recorded on your account yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Sales Order</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-right">Amount Due</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => {
                  const displayStatus = getDisplayStatus(inv);
                  const isOverdue = displayStatus === "OVERDUE";
                  const isUnpaid = inv.paymentStatus !== PaymentStatus.PAID;

                  return (
                    <tr key={inv.id} className="hover:bg-primary-light/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {inv.salesOrder?.soNumber || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(inv.invoiceDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td
                        className={`py-3.5 px-4 ${
                          isOverdue ? "text-red-600 font-semibold" : "text-muted-foreground"
                        }`}
                      >
                        {new Date(inv.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground tnum">
                        ₹{Number(inv.amountPaid).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-foreground tnum">
                        ₹{Number(inv.amountDue).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground tnum">
                        ₹{Number(inv.total).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={displayStatus} />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {isUnpaid && (
                            <Link href={`/portal/invoices/${inv.id}/pay`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-navy hover:text-navy-hover hover:bg-[#E8F0F7]"
                                title="Pay Invoice"
                              >
                                <CreditCard className="h-3.5 w-3.5 mr-1" />
                                <span>Pay</span>
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(inv)}
                            disabled={downloadingId === inv.id}
                            className="h-7 px-2 text-muted-foreground hover:text-navy hover:bg-[#F6F7F9]"
                            title="Download Invoice PDF"
                          >
                            {downloadingId === inv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
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
      </div>
    </div>
  );
}
