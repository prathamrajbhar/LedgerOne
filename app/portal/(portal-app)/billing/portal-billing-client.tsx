"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Receipt,
  CreditCard,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Search,
  ExternalLink,
} from "lucide-react";
import { PaymentStatus, DocumentStatus } from "@prisma/client";
import { toast } from "sonner";

interface SerializedInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  status: DocumentStatus;
  salesOrder?: { soNumber: string } | null;
  paymentsCount: number;
}

interface BillingStats {
  totalBilled: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueCount: number;
  totalInvoices: number;
}

interface PortalBillingClientProps {
  invoices: SerializedInvoice[];
  stats: BillingStats;
}

export function PortalBillingClient({ invoices, stats }: PortalBillingClientProps) {
  const [search, setSearch] = React.useState("");
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.salesOrder?.soNumber &&
        inv.salesOrder.soNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDownload = async (inv: SerializedInvoice) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
            My Billing
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage your account statement, pending dues, invoices, and payment receipts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/portal/payments">
            <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Payment History
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-navy">
              ₹{stats.totalBilled.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Across {stats.totalInvoices} issued invoice{stats.totalInvoices === 1 ? "" : "s"}
            </p>
          </div>
        </Card>

        {/* Total Paid */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Paid</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-emerald-600">
              ₹{stats.totalPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Settled via online payments & transfers
            </p>
          </div>
        </Card>

        {/* Outstanding Dues */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Current Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-amber-600">
              ₹{stats.totalOutstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Pending payment balance
            </p>
          </div>
        </Card>

        {/* Overdue Count */}
        <Card className="p-4 sm:p-5 border-border shadow-2xs hover:shadow-sm transition-all bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Overdue Invoices</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-rose-600">
              {stats.overdueCount}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Past payment due date
            </p>
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Billing Activity Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-base font-semibold text-navy">Billing Statements & Invoices</h2>
            <p className="text-xs text-muted-foreground">
              Review invoice details, settlement status, and pay outstanding amounts instantly.
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-border rounded-lg placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-teal"
            />
          </div>
        </div>

        {/* Invoice List Table */}
        <Card className="border-border shadow-2xs overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Invoice No</th>
                  <th className="py-3 px-4 text-left">Invoice Date</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-right">Amount Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="font-medium">No billing records found</p>
                      <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                        Invoices generated for your account will appear here.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isPaid = inv.paymentStatus === PaymentStatus.PAID;
                    const canPay = !isPaid && inv.amountDue > 0;

                    return (
                      <tr key={inv.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-navy">
                          <div className="flex items-center gap-1.5">
                            <span>{inv.invoiceNumber}</span>
                            {inv.salesOrder && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-normal">
                                SO: {inv.salesOrder.soNumber}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {new Date(inv.dueDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={inv.paymentStatus} />
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-foreground">
                          ₹{inv.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                          ₹{inv.amountPaid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-navy">
                          {inv.amountDue > 0 ? (
                            <span className="text-amber-600">
                              ₹{inv.amountDue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">₹0.00</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={downloadingId === inv.id}
                              onClick={() => handleDownload(inv)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            {canPay ? (
                              <Link href={`/portal/invoices/${inv.id}/pay`}>
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 text-[11px] bg-teal hover:bg-teal/90 text-white font-medium gap-1"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  Pay
                                </Button>
                              </Link>
                            ) : (
                              <Link href="/portal/payments">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                                >
                                  Receipt
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
