"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Send } from "lucide-react";
import { BillsSummaryCards } from "./components/bills-summary-cards";
import { BillsFilterBar } from "./components/bills-filter-bar";
import { BillsTable } from "./components/bills-table";
import { useVendorBills } from "./use-vendor-bills";

export default function VendorBillsPage() {
  const router = useRouter();
  const {
    bills,
    vendors,
    search,
    setSearch,
    vendorFilter,
    setVendorFilter,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    confirmingBillId,
    cancellingBillId,
    downloadingId,
    sendingReminderId,
    runningBatchAlerts,
    handleConfirmBill,
    handleCancelBill,
    handleDownloadPDF,
    handleSendReminder,
    handleRunBatchAlerts,
    summaryMetrics,
    getDisplayStatus,
    filteredBills,
  } = useVendorBills();

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-navy">
              Vendor Bills
            </h1>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-navy/10 text-navy border border-navy/20">
              Purchases Cycle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Log, verify, approve, and settle supplier liabilities and timber purchases.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunBatchAlerts}
            disabled={runningBatchAlerts}
            className="h-9 px-3 text-xs gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
          >
            {runningBatchAlerts ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-teal" />
            ) : (
              <Send className="h-3.5 w-3.5 text-teal" />
            )}
            Batch Due Reminders
          </Button>

          <Button
            onClick={() => router.push("/bills/new")}
            className="h-9 px-3.5 bg-navy hover:bg-navy-hover text-white text-xs font-semibold gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Vendor Bill
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      <BillsSummaryCards
        summaryMetrics={summaryMetrics}
        runningBatchAlerts={runningBatchAlerts}
        onRunBatchAlerts={handleRunBatchAlerts}
      />

      {/* 3. Filter & Search Controls */}
      <BillsFilterBar
        search={search}
        onSearchChange={setSearch}
        vendorFilter={vendorFilter}
        onVendorFilterChange={setVendorFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        dateRangeFilter={dateRangeFilter}
        onDateRangeFilterChange={setDateRangeFilter}
        vendors={vendors}
        totalRecords={bills.length}
        filteredCount={filteredBills.length}
        onResetFilters={() => {
          setSearch("");
          setVendorFilter("ALL");
          setStatusFilter("ALL");
          setPaymentStatusFilter("ALL");
          setDateRangeFilter({ start: "", end: "" });
        }}
      />

      {/* 4. Bills Data Table */}
      <BillsTable
        bills={filteredBills}
        getDisplayStatus={getDisplayStatus}
        confirmingBillId={confirmingBillId}
        cancellingBillId={cancellingBillId}
        downloadingId={downloadingId}
        sendingReminderId={sendingReminderId}
        onOpenDetails={(b) => router.push(`/bills/${b.id}`)}
        onConfirmBill={handleConfirmBill}
        onCancelBill={handleCancelBill}
        onOpenPayment={(b) =>
          router.push(`/payments/new?billId=${b.id}&returnUrl=/bills`)
        }
        onSendReminder={handleSendReminder}
        onDownloadPDF={handleDownloadPDF}
        onOpenCreateModal={() => router.push("/bills/new")}
      />
    </div>
  );
}
