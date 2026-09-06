"use client";

import * as React from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Search, ChevronDown, ChevronUp, Download, Package } from "lucide-react";
import { PaymentMethod } from "@prisma/client";
import { toast } from "sonner";

interface InvoiceLine {
  id: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  taxAmount: number;
}

interface CustomerPaymentItem {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  invoice: {
    id: string;
    invoiceNumber: string;
    invoiceDate: string;
    total: number;
    lines: InvoiceLine[];
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
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const filteredCustomerPayments = customerPayments.filter((p) =>
    p.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const filteredVendorPayments = vendorPayments.filter((p) =>
    p.vendorBill.billNumber.toLowerCase().includes(search.toLowerCase())
  );

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      setDownloading(invoiceId);
      const response = await fetch(`/api/portal/invoice/${invoiceId}/download`);

      if (!response.ok) {
        throw new Error("Failed to download invoice");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

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
                      <th className="py-3.5 px-4 w-10"></th>
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                      <th className="py-3.5 px-4">Method</th>
                      <th className="py-3.5 px-4 text-right">Amount Paid</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCustomerPayments.map((p) => (
                      <React.Fragment key={p.id}>
                        <tr className="hover:bg-primary-light/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleRow(p.id)}
                              className="text-muted-foreground hover:text-navy transition-colors p-1"
                              aria-label={expandedRows.has(p.id) ? "Collapse details" : "Expand details"}
                            >
                              {expandedRows.has(p.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </td>
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
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDownloadInvoice(p.invoice.id, p.invoice.invoiceNumber)}
                              disabled={downloading === p.invoice.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy hover:bg-navy/90 text-white text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {downloading === p.invoice.id ? "Downloading..." : "Download"}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(p.id) && (
                          <tr className="bg-[#F9FAFB]">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-navy font-bold text-xs">
                                  <Package className="h-4 w-4" />
                                  <span>Items Purchased</span>
                                </div>
                                <div className="bg-white rounded-lg border border-border overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-border bg-gray-50">
                                        <th className="py-2 px-3 text-left text-[11px] font-semibold text-muted-foreground uppercase">Product</th>
                                        <th className="py-2 px-3 text-left text-[11px] font-semibold text-muted-foreground uppercase">SKU</th>
                                        <th className="py-2 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">Qty</th>
                                        <th className="py-2 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">Unit Price</th>
                                        <th className="py-2 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">Tax</th>
                                        <th className="py-2 px-3 text-right text-[11px] font-semibold text-muted-foreground uppercase">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                      {p.invoice.lines.map((line) => (
                                        <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                                          <td className="py-2.5 px-3 text-foreground font-medium">{line.productName}</td>
                                          <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                                            {line.productSku || "-"}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-muted-foreground tnum">
                                            {Number(line.quantity).toLocaleString("en-IN")}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-muted-foreground tnum">
                                            ₹{Number(line.unitPrice).toLocaleString("en-IN", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                          </td>
                                          <td className="py-2.5 px-3 text-right text-muted-foreground tnum">
                                            ₹{Number(line.taxAmount).toLocaleString("en-IN", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                          </td>
                                          <td className="py-2.5 px-3 text-right font-bold text-navy tnum">
                                            ₹{Number(line.lineTotal + line.taxAmount).toLocaleString("en-IN", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="border-t-2 border-navy">
                                      <tr className="bg-navy/5">
                                        <td colSpan={5} className="py-2.5 px-3 text-right font-bold text-navy text-xs">
                                          Invoice Total:
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-bold text-navy text-sm tnum">
                                          ₹{Number(p.invoice.total).toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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
