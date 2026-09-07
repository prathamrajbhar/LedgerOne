"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  getPaymentsAction,
  PaymentRecord,
} from "@/app/actions/payment.actions";

import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [directionFilter, setDirectionFilter] = React.useState<string>("ALL");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    const result = await getPaymentsAction();
    if (result.success && result.data) {
      setPayments(result.data);
    } else {
      toast.error(result.error || "Failed to load payments");
    }
    setLoading(false);
  }, []);

  // Fetch payments on mount
  React.useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filtered = React.useMemo(() => {
    return payments.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.party.toLowerCase().includes(q) ||
        p.ref.toLowerCase().includes(q) ||
        p.documentNumber.toLowerCase().includes(q) ||
        p.account.toLowerCase().includes(q);

      const matchesDirection =
        directionFilter === "ALL" || p.direction === directionFilter;

      const matchesMethod =
        methodFilter === "ALL" ||
        (methodFilter === "BANK" && p.method.toLowerCase().includes("bank")) ||
        (methodFilter === "CASH" && p.method.toLowerCase().includes("cash"));

      let matchesDate = true;
      if (startDate) {
        matchesDate = matchesDate && new Date(p.date) >= new Date(startDate);
      }
      if (endDate) {
        matchesDate = matchesDate && new Date(p.date) <= new Date(endDate);
      }

      return matchesSearch && matchesDirection && matchesMethod && matchesDate;
    });
  }, [payments, search, directionFilter, methodFilter, startDate, endDate]);

  const hasActiveFilters = Boolean(
    search ||
      directionFilter !== "ALL" ||
      methodFilter !== "ALL" ||
      startDate ||
      endDate
  );

  const handleResetFilters = () => {
    setSearch("");
    setDirectionFilter("ALL");
    setMethodFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const { sortedItems: sortedPayments, sortState, handleSort } = useTableSort<
    PaymentRecord,
    "ref" | "party" | "documentNumber" | "method" | "date" | "account" | "amount"
  >(
    filtered,
    "date",
    "desc",
    {
      date: (item) => new Date(item.date).getTime(),
      amount: (item) => (item.direction === "INBOUND" ? item.amount : -item.amount),
    }
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments & Banking"
        description="Record customer receipts, vendor disbursements, and view bank account clearing vouchers."
        actions={
          <Button
            onClick={() => router.push("/payments/new")}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="flex-1 min-w-[220px]">
          <DebouncedSearchInput
            placeholder="Search payments by ref, party, document, or account..."
            value={search}
            onChange={setSearch}
            className="h-9"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Payment Types</option>
            <option value="INBOUND">Customer Receipts (Inbound)</option>
            <option value="OUTBOUND">Vendor Disbursements (Outbound)</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="BANK">Bank Transfer</option>
            <option value="CASH">Cash</option>
          </select>

          <div className="col-span-2 flex items-center gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="Start Date"
            />
            <span className="text-muted-foreground text-xs flex-shrink-0">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-border bg-white text-[11px] text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>
            Showing {filtered.length} of {payments.length} payment records
          </span>
          <button
            onClick={handleResetFilters}
            className="text-teal hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading payments...
          </div>
        ) : sortedPayments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {hasActiveFilters
              ? "No payments found matching your filters"
              : "No payments recorded yet"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <SortableTableHead
                    columnKey="ref"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Payment #
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="party"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Party / Counterparty
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="documentNumber"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Document
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="method"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Mode
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="date"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Date
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="account"
                    currentSort={sortState}
                    onSort={handleSort}
                    className="py-3.5 px-4"
                  >
                    Account
                  </SortableTableHead>
                  <SortableTableHead
                    columnKey="amount"
                    currentSort={sortState}
                    onSort={handleSort}
                    align="right"
                    className="py-3.5 px-4"
                  >
                    Amount (₹)
                  </SortableTableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPayments.map((row) => {
                  const targetUrl =
                    row.documentType === "INVOICE"
                      ? `/invoices/${row.documentId}`
                      : `/bills/${row.documentId}`;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => router.push(targetUrl)}
                      className="hover:bg-primary-light/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">
                        <span className="hover:underline">{row.ref}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">{row.party}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-navy font-medium hover:underline">
                          {row.documentNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{row.method}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{row.date}</td>
                      <td className="py-3.5 px-4 text-muted-foreground">{row.account}</td>
                      <td className={`py-3.5 px-4 text-right font-bold ${row.direction === "INBOUND" ? "text-success" : "text-destructive"}`}>
                        {row.direction === "INBOUND" ? "+" : "-"}₹{row.amount.toLocaleString("en-IN")}
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
