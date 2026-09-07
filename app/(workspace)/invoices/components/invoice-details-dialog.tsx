"use client";

import * as React from "react";
import { Download, Printer, DollarSign, Ban, BookOpen } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DocumentStatus } from "@prisma/client";
import type { InvoiceWithRelations } from "../invoices-types";

interface InvoiceDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceWithRelations | null;
  displayStatus: string;
  downloadingId: string | null;
  cancellingInvoiceId: string | null;
  onDownloadPDF: (inv: InvoiceWithRelations) => void;
  onOpenPayment: (inv: InvoiceWithRelations) => void;
  onCancelInvoice: (invoiceId: string) => void;
}

export function InvoiceDetailsDialog({
  open,
  onOpenChange,
  invoice,
  displayStatus,
  downloadingId,
  cancellingInvoiceId,
  onDownloadPDF,
  onOpenPayment,
  onCancelInvoice,
}: InvoiceDetailsDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-navy">Invoice #{invoice.invoiceNumber}</h2>
                <StatusBadge status={displayStatus} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sales Invoice • Created on{" "}
                {new Date(invoice.invoiceDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadPDF(invoice)}
                disabled={downloadingId === invoice.id}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="h-8 text-xs gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </Button>

              {invoice.status === DocumentStatus.CONFIRMED && Number(invoice.amountDue) > 0 && (
                <Button
                  size="sm"
                  onClick={() => onOpenPayment(invoice)}
                  className="h-8 text-xs bg-teal hover:bg-teal/90 text-white font-semibold gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  Record Payment
                </Button>
              )}

              {invoice.status !== DocumentStatus.CANCELLED && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={cancellingInvoiceId === invoice.id}
                  onClick={() => onCancelInvoice(invoice.id)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Invoice Information
              </span>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Number:</span>
                  <span className="font-mono font-bold text-navy">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="font-medium">
                    {new Date(invoice.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {invoice.salesOrder && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales Order:</span>
                    <span className="font-semibold text-navy">{invoice.salesOrder.soNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Customer Information
              </span>
              <div className="space-y-1">
                <p className="font-bold text-navy">{invoice.customer?.name}</p>
                <p className="text-muted-foreground">{invoice.customer?.email || "No email"}</p>
                <p className="text-muted-foreground">{invoice.customer?.phone || "No phone"}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Billing Address
              </span>
              <div className="text-muted-foreground">
                {invoice.customer?.address ? (
                  <p className="whitespace-pre-line leading-relaxed">{invoice.customer.address}</p>
                ) : (
                  <p className="italic">No address provided</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navy">
              Purchased Products
            </span>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Tax Rate</th>
                    <th className="py-2.5 px-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoice.lines?.map((line) => (
                    <tr key={line.id} className="hover:bg-[#F8FAFC]/50">
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {line.product?.name || "Product"}
                        {line.product?.sku && (
                          <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
                            ({line.product.sku})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">{Number(line.quantity)}</td>
                      <td className="py-2.5 px-3 text-right">
                        ₹{Number(line.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">
                        {line.taxRate ? `${line.taxRate.percentage}%` : "0%"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-navy">
                        ₹{Number(line.lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="w-full sm:w-1/2 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                Payment History
              </span>
              {invoice.payments && invoice.payments.length > 0 ? (
                <div className="space-y-1.5 border border-border rounded-xl p-3 bg-white">
                  {invoice.payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0"
                    >
                      <div>
                        <span className="font-semibold text-foreground">
                          ₹{Number(p.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] text-muted-foreground ml-1.5">
                          via {p.paymentMethod}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#F8FAFC]/50 border border-dashed border-border text-center text-xs text-muted-foreground">
                  No payments recorded yet
                </div>
              )}
            </div>

            <div className="w-full sm:w-80 p-4 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Total Amount:</span>
                <span className="font-bold text-foreground">
                  ₹{Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Amount Paid:</span>
                <span className="font-medium">
                  ₹{Number(invoice.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-2 mt-1">
                <span>Outstanding:</span>
                <span
                  className={
                    Number(invoice.amountDue) > 0 ? "text-amber-600" : "text-muted-foreground"
                  }
                >
                  ₹{Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#16324F]/5 border border-navy/15 space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-navy" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy">
                Accounting Entry
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Confirming this invoice automatically posts double entry journal entries.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-navy">Accounts Receivable</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                    DEBIT
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Customer owes money</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-teal">Sales Income</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    CREDIT
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Revenue recognized</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-border shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">Tax Payable</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                    CREDIT
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">GST collected</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
