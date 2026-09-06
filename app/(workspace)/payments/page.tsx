"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  getPaymentsAction,
  PaymentRecord,
} from "@/app/actions/payment.actions";
import { PaymentModal } from "@/components/forms/payment-modal";

import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<PaymentRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [openModal, setOpenModal] = React.useState(false);
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
    return payments.filter((p) =>
      p.party.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      p.documentNumber.toLowerCase().includes(search.toLowerCase())
    );
  }, [payments, search]);

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
            onClick={() => setOpenModal(true)}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </Button>
        }
      />

      <PaymentModal
        open={openModal}
        onOpenChange={setOpenModal}
        onSuccess={loadPayments}
      />

      <div className="flex items-center gap-3">
        <div className="max-w-sm w-full">
          <DebouncedSearchInput
            placeholder="Search payments by ref, party, or document..."
            value={search}
            onChange={setSearch}
            className="py-2"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading payments...
          </div>
        ) : sortedPayments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            {search ? "No payments found matching your search" : "No payments recorded yet"}
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
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
              {sortedPayments.map((row) => (
                <tr key={row.id} className="hover:bg-primary-light/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-navy">{row.ref}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{row.party}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.documentNumber}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.method}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.date}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{row.account}</td>
                  <td className={`py-3.5 px-4 text-right font-bold ${row.direction === "INBOUND" ? "text-success" : "text-destructive"}`}>
                    {row.direction === "INBOUND" ? "+" : "-"}₹{row.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
