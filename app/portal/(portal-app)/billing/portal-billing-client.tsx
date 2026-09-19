"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { toast } from "sonner";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import {
  PortalBillingKpiCards,
  type BillingStats,
} from "./components/portal-billing-kpi-cards";
import {
  PortalBillingTable,
  type SerializedInvoice,
} from "./components/portal-billing-table";

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
      const res = await fetch(`/api/portal/invoice/${inv.id}/download`);
      if (!res.ok) {
        throw new Error("Failed to download PDF");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${inv.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice PDF downloaded successfully");
    } catch {
      toast.error("Failed to generate or download invoice PDF");
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
      <PortalBillingKpiCards stats={stats} />

      {/* Main Content Area */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-base font-semibold text-navy">Billing Statements & Invoices</h2>
            <p className="text-xs text-muted-foreground">
              Review invoice details, settlement status, and pay outstanding amounts instantly.
            </p>
          </div>
          <div className="w-full sm:w-64">
            <DebouncedSearchInput
              placeholder="Search invoice number..."
              value={search}
              onChange={setSearch}
              className="py-1.5"
            />
          </div>
        </div>

        <PortalBillingTable
          invoices={filteredInvoices}
          downloadingId={downloadingId}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}
