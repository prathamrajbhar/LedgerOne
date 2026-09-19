"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SortableTableHead, type SortState } from "@/components/ui/sortable-table-head";
import type { PaymentRecord } from "@/app/actions/payment.actions";

export type PaymentSortColumn =
  | "ref"
  | "party"
  | "documentNumber"
  | "method"
  | "date"
  | "account"
  | "amount";

interface PaymentsTableProps {
  loading: boolean;
  payments: PaymentRecord[];
  hasActiveFilters: boolean;
  sortState: SortState<PaymentSortColumn>;
  onSort: (columnKey: PaymentSortColumn) => void;
}

export function PaymentsTable({
  loading,
  payments,
  hasActiveFilters,
  sortState,
  onSort,
}: PaymentsTableProps) {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      {loading ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          Loading payments...
        </div>
      ) : payments.length === 0 ? (
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
                  onSort={onSort}
                  className="py-3.5 px-4"
                >
                  Payment #
                </SortableTableHead>
                <SortableTableHead
                  columnKey="party"
                  currentSort={sortState}
                  onSort={onSort}
                  className="py-3.5 px-4"
                >
                  Party / Counterparty
                </SortableTableHead>
                <SortableTableHead
                  columnKey="documentNumber"
                  currentSort={sortState}
                  onSort={onSort}
                  className="py-3.5 px-4"
                >
                  Document
                </SortableTableHead>
                <SortableTableHead
                  columnKey="method"
                  currentSort={sortState}
                  onSort={onSort}
                  className="py-3.5 px-4"
                >
                  Mode
                </SortableTableHead>
                <SortableTableHead
                  columnKey="date"
                  currentSort={sortState}
                  onSort={onSort}
                  className="py-3.5 px-4"
                >
                  Date
                </SortableTableHead>
                <SortableTableHead
                  columnKey="account"
                  currentSort={sortState}
                  onSort={onSort}
                  className="py-3.5 px-4"
                >
                  Account
                </SortableTableHead>
                <SortableTableHead
                  columnKey="amount"
                  currentSort={sortState}
                  onSort={onSort}
                  align="right"
                  className="py-3.5 px-4"
                >
                  Amount (₹)
                </SortableTableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((row) => {
                const docUrl =
                  row.documentType === "INVOICE"
                    ? `/invoices/${row.documentId}`
                    : `/bills/${row.documentId}`;

                return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/payments/${row.id}`)}
                    className="hover:bg-primary-light/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      <Link href={`/payments/${row.id}`} className="hover:underline">
                        {row.ref}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{row.party}</td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <Link href={docUrl} className="text-navy font-medium hover:underline">
                        {row.documentNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">{row.method}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{row.date}</td>
                    <td className="py-3.5 px-4 text-muted-foreground">{row.account}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold ${
                        row.direction === "INBOUND" ? "text-success" : "text-destructive"
                      }`}
                    >
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
  );
}
