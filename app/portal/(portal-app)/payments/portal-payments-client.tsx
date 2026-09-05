"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { PaymentMethod } from "@prisma/client";

interface CustomerPaymentItem {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
  };
}

interface VendorPaymentItem {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  vendorBill: {
    billNumber: string;
    billDate: string;
  };
}

interface PortalPaymentsClientProps {
  isCustomer: boolean;
  isVendor: boolean;
  customerPayments: CustomerPaymentItem[];
  vendorPayments: VendorPaymentItem[];
}

export function PortalPaymentsClient({
  isCustomer,
  isVendor,
  customerPayments,
  vendorPayments,
}: PortalPaymentsClientProps) {
  const [search, setSearch] = React.useState("");

  const filteredCustomerPayments = customerPayments.filter((p) =>
    p.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVendorPayments = vendorPayments.filter((p) =>
    p.vendorBill.billNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Payment History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Audit log of all payments processed and disbursements completed with LedgerOne.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or bill reference..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>
      </div>

      {/* Customer Payments Table */}
      {isCustomer && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy">Payments Remitted (Invoices)</h2>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredCustomerPayments.length} entries
            </span>
          </div>

          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
            {filteredCustomerPayments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Method</th>
                      <th className="py-3.5 px-4 text-right">Amount Paid</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomerPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-primary-light/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy">
                          {p.invoice.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(p.paymentDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          <span className="px-2 py-0.5 rounded bg-[#E8F0F7] text-navy text-[11px] font-semibold uppercase">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-destructive tnum">
                          -₹{Number(p.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status="PAID" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendor Payments Table */}
      {isVendor && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-navy">Disbursements Received (Bills)</h2>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredVendorPayments.length} entries
            </span>
          </div>

          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
            {filteredVendorPayments.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No disbursements received yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="py-3.5 px-4">Bill #</th>
                      <th className="py-3.5 px-4">Disbursement Date</th>
                      <th className="py-3.5 px-4">Method</th>
                      <th className="py-3.5 px-4 text-right">Amount Credited</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredVendorPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-primary-light/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-navy">
                          {p.vendorBill.billNumber}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(p.paymentDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          <span className="px-2 py-0.5 rounded bg-[#E8F0F7] text-navy text-[11px] font-semibold uppercase">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-green-600 tnum">
                          +₹{Number(p.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status="PAID" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
