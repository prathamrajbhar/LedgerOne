"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Receipt, CreditCard, Download } from "lucide-react";
import { PaymentStatus, DocumentStatus } from "@prisma/client";

export interface SerializedInvoice {
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

interface PortalBillingTableProps {
  invoices: SerializedInvoice[];
  downloadingId: string | null;
  onDownload: (inv: SerializedInvoice) => void;
}

export function PortalBillingTable({
  invoices,
  downloadingId,
  onDownload,
}: PortalBillingTableProps) {
  return (
    <Card className="border-border shadow-2xs overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[650px]">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-3 px-4 text-left whitespace-nowrap">Invoice No</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Invoice Date</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Due Date</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Status</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Total</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Amount Paid</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Balance Due</th>
              <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {invoices.length === 0 ? (
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
              invoices.map((inv) => {
                const isPaid = inv.paymentStatus === PaymentStatus.PAID;
                const canPay = !isPaid && inv.amountDue > 0;

                return (
                  <tr key={inv.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-navy">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/portal/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoiceNumber}
                        </Link>
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
                          onClick={() => onDownload(inv)}
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
  );
}
