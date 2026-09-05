"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, Download, Loader2 } from "lucide-react";
import { PaymentStatus, DocumentStatus } from "@prisma/client";
import { toast } from "sonner";

interface BillLineItem {
  id: string;
  quantity: number | string;
  unitPrice: number | string;
  lineTotal: number | string;
  product: {
    name: string;
    sku?: string | null;
  };
}

interface PortalBill {
  id: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  paymentStatus: PaymentStatus;
  status: DocumentStatus;
  purchaseOrder?: {
    poNumber: string;
  } | null;
  lines: BillLineItem[];
}

interface PortalBillsClientProps {
  bills: PortalBill[];
}

export function PortalBillsClient({ bills }: PortalBillsClientProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const getDisplayStatus = (bill: PortalBill): string => {
    if (bill.paymentStatus === PaymentStatus.PAID) return "PAID";
    if (bill.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";

    const today = new Date();
    const due = new Date(bill.dueDate);
    if (due < today && bill.paymentStatus === PaymentStatus.NOT_PAID) {
      return "OVERDUE";
    }

    return "PENDING";
  };

  const filtered = bills.filter((b) => {
    const matchesSearch =
      b.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.purchaseOrder?.poNumber && b.purchaseOrder.poNumber.toLowerCase().includes(search.toLowerCase()));
    const displayStatus = getDisplayStatus(b);
    const matchesStatus = statusFilter === "ALL" || displayStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Vendor Bills
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track procurement bills, settlement schedules, and payment disbursements.
          </p>
        </div>
      </div>

      {/* Toolbar with Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bill # or PO ref..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
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
              {s === "ALL" ? "All Bills" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            {search || statusFilter !== "ALL"
              ? "No vendor bills found matching your filters."
              : "No vendor bills recorded on your account yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Bill #</th>
                  <th className="py-3.5 px-4">Purchase Order</th>
                  <th className="py-3.5 px-4">Bill Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-right">Amount Due</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((bill) => {
                  const displayStatus = getDisplayStatus(bill);
                  const isOverdue = displayStatus === "OVERDUE";

                  return (
                    <tr key={bill.id} className="hover:bg-primary-light/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy">
                        {bill.billNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-foreground">
                        {bill.purchaseOrder?.poNumber || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {new Date(bill.billDate).toLocaleDateString("en-GB", {
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
                        {new Date(bill.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-muted-foreground tnum">
                        ₹{Number(bill.amountPaid).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-foreground tnum">
                        ₹{Number(bill.amountDue).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-foreground tnum">
                        ₹{Number(bill.total).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={displayStatus} />
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
