"use client";

import * as React from "react";
import { Loader2, Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { Contact, Product } from "@prisma/client";
import { InvoiceCreateItemsTable } from "./invoice-create-items-table";
import { useInvoiceCreateForm } from "./use-invoice-create-form";

interface InvoiceCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Contact[];
  salesOrders: Array<{ id: string; soNumber: string; customerId: string }>;
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  onSuccess: () => void;
}

export function InvoiceCreateDialog({
  open,
  onOpenChange,
  customers,
  salesOrders,
  products,
  taxRates,
  onSuccess,
}: InvoiceCreateDialogProps) {
  const {
    formCustomer,
    setFormCustomer,
    formSalesOrder,
    setFormSalesOrder,
    formInvoiceDate,
    setFormInvoiceDate,
    formDueDate,
    setFormDueDate,
    formPaymentTerms,
    setFormPaymentTerms,
    formNotes,
    setFormNotes,
    creating,
    formLines,
    customerOptions,
    salesOrderOptions,
    productOptions,
    handleAddLine,
    handleRemoveLine,
    handleLineChange,
    formCalculations,
    handleSaveInvoice,
  } = useInvoiceCreateForm({
    customers,
    salesOrders,
    products,
    taxRates,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <DialogTitle className="text-lg font-bold text-navy">
                Create Customer Invoice
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate an official sales invoice for furniture delivered to customer.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-navy/5 text-navy border border-navy/10">
              Sales Accounting
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Customer <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                options={customerOptions}
                value={formCustomer}
                onChange={(val) => {
                  setFormCustomer(val);
                  if (formSalesOrder) {
                    const so = salesOrders.find((s) => s.soNumber === formSalesOrder);
                    if (so && so.customerId !== val) {
                      setFormSalesOrder("");
                    }
                  }
                }}
                placeholder="Select a Customer"
                searchPlaceholder="Search customer by name or phone..."
                emptyMessage="No customers found"
                className="h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Sales Order (Optional)
              </label>
              <SearchableSelect
                options={salesOrderOptions}
                value={formSalesOrder}
                onChange={(val) => setFormSalesOrder(val)}
                placeholder="Direct Invoice"
                searchPlaceholder="Search sales order..."
                emptyMessage="No sales orders found"
                className="h-9"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Payment Terms
              </label>
              <select
                value={formPaymentTerms}
                onChange={(e) => {
                  setFormPaymentTerms(e.target.value);
                  const days = e.target.value === "NET_15" ? 15 : e.target.value === "NET_60" ? 60 : 30;
                  const d = new Date(formInvoiceDate);
                  d.setDate(d.getDate() + days);
                  setFormDueDate(d.toISOString().split("T")[0]);
                }}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
              >
                <option value="NET_15">Net 15 Days</option>
                <option value="NET_30">Net 30 Days</option>
                <option value="NET_60">Net 60 Days</option>
                <option value="IMMEDIATE">Immediate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Invoice Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formInvoiceDate}
                onChange={(e) => setFormInvoiceDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Due Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              />
            </div>
          </div>

          <InvoiceCreateItemsTable
            formLines={formLines}
            productOptions={productOptions}
            taxRates={taxRates}
            onAddLine={handleAddLine}
            onRemoveLine={handleRemoveLine}
            onLineChange={handleLineChange}
          />

          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Invoice Terms & Notes</label>
              <textarea
                rows={4}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Terms of warranty, delivery schedule..."
                className="w-full p-2.5 rounded-lg border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy resize-none"
              />
            </div>

            <div className="w-full sm:w-80 p-4 rounded-xl bg-[#F8FAFC] border border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-semibold text-foreground">
                  ₹{formCalculations.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {formCalculations.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>
                    -₹{formCalculations.totalDiscount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>CGST:</span>
                <span>
                  ₹{formCalculations.cgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>SGST:</span>
                <span>
                  ₹{formCalculations.sgst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-navy border-t border-border pt-2 mt-1">
                <span>Grand Total:</span>
                <span>
                  ₹{formCalculations.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={creating}
              className="h-9 px-4 text-xs rounded-lg font-medium cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSaveInvoice(true)}
              disabled={creating}
              className="h-9 px-4 text-xs rounded-lg font-medium cursor-pointer"
            >
              Save Draft
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSaveInvoice(false)}
              disabled={creating}
              className="h-9 px-4 text-xs rounded-lg bg-navy hover:bg-navy/90 text-white font-semibold gap-2 shadow-xs cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Create Invoice</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
