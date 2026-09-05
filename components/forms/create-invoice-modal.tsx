"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createStandaloneInvoiceAction,
  getSalesOrdersAction,
} from "@/app/actions/sales.actions";
import { getContactsAction } from "@/app/actions/contact.actions";
import { getProductsAction } from "@/app/actions/product.actions";
import { getTaxRatesAction } from "@/app/actions/tax-rate.actions";
import type { Contact, Product } from "@prisma/client";

interface FormLineRow {
  productId: string;
  description: string;
  quantity: number | "";
  unitPrice: number | "";
  taxRateId: string;
  discountPercent: number | "";
}

interface CreateInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateInvoiceModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [customers, setCustomers] = React.useState<Contact[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [taxRates, setTaxRates] = React.useState<Array<{ id: string; name: string; percentage: number }>>([]);
  const [salesOrders, setSalesOrders] = React.useState<Array<{ id: string; soNumber: string; customerId: string }>>([]);

  const [formCustomer, setFormCustomer] = React.useState("");
  const [formSalesOrder, setFormSalesOrder] = React.useState("");
  const [formInvoiceDate, setFormInvoiceDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formPaymentTerms, setFormPaymentTerms] = React.useState("NET_30");
  const [formNotes, setFormNotes] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const [formLines, setFormLines] = React.useState<FormLineRow[]>([
    {
      productId: "",
      description: "",
      quantity: 1,
      unitPrice: "",
      taxRateId: "",
      discountPercent: 0,
    },
  ]);

  React.useEffect(() => {
    if (open) {
      loadDependencies();
    }
  }, [open]);

  const loadDependencies = async () => {
    try {
      const [customersRes, productsRes, taxRes, soRes] = await Promise.all([
        getContactsAction({ type: "CUSTOMER", limit: 100 }),
        getProductsAction({ limit: 100 }),
        getTaxRatesAction(),
        getSalesOrdersAction({ limit: 100 }),
      ]);

      if (customersRes.success && customersRes.data) {
        const cData = customersRes.data as { contacts?: Contact[] };
        setCustomers(cData.contacts || []);
      }

      if (productsRes.success && productsRes.data) {
        const pData = productsRes.data as { data?: Product[] };
        setProducts(pData.data || []);
      }

      if (taxRes.success && taxRes.data) {
        const tData = taxRes.data as Array<{ id: string; name: string; percentage: number }>;
        setTaxRates(tData);
        if (tData.length > 0) {
          setFormLines((prev) =>
            prev.map((l) => (l.taxRateId ? l : { ...l, taxRateId: tData[0].id }))
          );
        }
      }

      if (soRes.success && soRes.data) {
        const soData = soRes.data as { data?: Array<{ id: string; soNumber: string; customerId: string }> };
        setSalesOrders(soData.data || []);
      }
    } catch {
      toast.error("Failed to load dependency data for invoice");
    }
  };

  const handleAddLine = () => {
    setFormLines((prev) => [
      ...prev,
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: "",
        taxRateId: taxRates[0]?.id || "",
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) {
      toast.error("An invoice requires at least one product row");
      return;
    }
    setFormLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index: number, field: keyof FormLineRow, value: unknown) => {
    setFormLines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === "productId") {
        const selProd = products.find((p) => p.id === value);
        if (selProd) {
          current.description = selProd.name;
          current.unitPrice = Number(selProd.salesPrice) || 0;
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  const formCalculations = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    formLines.forEach((line) => {
      const qty = Number(line.quantity) || 0;
      const price = Number(line.unitPrice) || 0;
      const discountPct = Number(line.discountPercent) || 0;

      const baseAmount = qty * price;
      const discountAmt = (baseAmount * discountPct) / 100;
      const discountedAmount = Math.max(0, baseAmount - discountAmt);

      const taxRateObj = taxRates.find((t) => t.id === line.taxRateId);
      const taxRate = taxRateObj ? Number(taxRateObj.percentage) : 0;
      const taxAmt = (discountedAmount * taxRate) / 100;

      subtotal += baseAmount;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      cgst,
      sgst,
      grandTotal,
    };
  }, [formLines, taxRates]);

  const handleSaveInvoice = async (asDraft = false) => {
    if (!formCustomer) {
      toast.error("Please select a customer");
      return;
    }

    const validLines = formLines.filter(
      (l) => l.productId && Number(l.quantity) > 0 && Number(l.unitPrice) >= 0
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one complete product item with price and quantity");
      return;
    }

    setCreating(true);
    try {
      const invoiceLines = validLines.map((l) => {
        const qty = Number(l.quantity);
        const rawPrice = Number(l.unitPrice);
        const disc = Number(l.discountPercent) || 0;
        const effectiveUnitPrice = disc > 0 ? rawPrice * (1 - disc / 100) : rawPrice;

        return {
          productId: l.productId,
          description: l.description || "Furniture Item",
          quantity: qty,
          unitPrice: effectiveUnitPrice,
          taxRateId: l.taxRateId || undefined,
        };
      });

      const result = await createStandaloneInvoiceAction({
        customerId: formCustomer,
        invoiceDate: new Date(formInvoiceDate),
        dueDate: new Date(formDueDate),
        invoiceReference: formSalesOrder ? `SO-${formSalesOrder}` : undefined,
        notes: formNotes || undefined,
        lines: invoiceLines,
      });

      if (result.success && result.data) {
        toast.success(
          `Customer Invoice ${result.data.invoiceNumber} created successfully${
            asDraft ? " as Draft" : ""
          }`
        );
        onOpenChange(false);
        setFormCustomer("");
        setFormSalesOrder("");
        setFormNotes("");
        setFormLines([
          {
            productId: "",
            description: "",
            quantity: 1,
            unitPrice: "",
            taxRateId: taxRates[0]?.id || "",
            discountPercent: 0,
          },
        ]);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to generate invoice");
      }
    } catch {
      toast.error("An unexpected error occurred while creating the invoice");
    } finally {
      setCreating(false);
    }
  };

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
          {/* Header Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Customer */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Customer <span className="text-destructive">*</span>
              </label>
              <select
                value={formCustomer}
                onChange={(e) => setFormCustomer(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              >
                <option value="">Select a Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sales Order Reference */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Sales Order (Optional)
              </label>
              <select
                value={formSalesOrder}
                onChange={(e) => setFormSalesOrder(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              >
                <option value="">Direct Invoice (No Sales Order)</option>
                {salesOrders
                  .filter((so) => !formCustomer || so.customerId === formCustomer)
                  .map((so) => (
                    <option key={so.id} value={so.soNumber}>
                      {so.soNumber}
                    </option>
                  ))}
              </select>
            </div>

            {/* Payment Terms */}
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
                className="w-full h-9 px-3 rounded-lg border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
              >
                <option value="NET_15">Net 15 Days</option>
                <option value="NET_30">Net 30 Days (Standard)</option>
                <option value="NET_60">Net 60 Days</option>
                <option value="IMMEDIATE">Immediate / Due on Receipt</option>
              </select>
            </div>
          </div>

          {/* Date Fields */}
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

          {/* Product Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-navy">
                Invoice Item Table
              </span>
              <Button
                type="button"
                onClick={handleAddLine}
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5"
              >
                <Plus className="w-3 h-3" />
                Add Product Row
              </Button>
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-white">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-[26%]">Product</th>
                    <th className="py-2.5 px-3 w-[24%]">Description</th>
                    <th className="py-2.5 px-3 w-[10%] text-right">Qty</th>
                    <th className="py-2.5 px-3 w-[14%] text-right">Unit Price (₹)</th>
                    <th className="py-2.5 px-3 w-[14%] text-left">Tax</th>
                    <th className="py-2.5 px-3 w-[10%] text-right">Disc %</th>
                    <th className="py-2.5 px-3 w-[12%] text-right">Subtotal</th>
                    <th className="py-2.5 px-2 w-[4%] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {formLines.map((line, idx) => {
                    const qty = Number(line.quantity) || 0;
                    const price = Number(line.unitPrice) || 0;
                    const disc = Number(line.discountPercent) || 0;
                    const base = qty * price;
                    const lineSubtotal = Math.max(0, base - (base * disc) / 100);

                    return (
                      <tr key={idx} className="hover:bg-surface-subtle/50">
                        {/* Product */}
                        <td className="p-2">
                          <select
                            value={line.productId}
                            onChange={(e) =>
                              handleLineChange(idx, "productId", e.target.value)
                            }
                            className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                          >
                            <option value="">Select product...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} {p.sku ? `(${p.sku})` : ""}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Description */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={line.description}
                            onChange={(e) =>
                              handleLineChange(idx, "description", e.target.value)
                            }
                            placeholder="Specifications / Finish..."
                            className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              handleLineChange(idx, "quantity", e.target.value)
                            }
                            className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) =>
                              handleLineChange(idx, "unitPrice", e.target.value)
                            }
                            placeholder="0.00"
                            className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                          />
                        </td>

                        {/* Tax */}
                        <td className="p-2">
                          <select
                            value={line.taxRateId}
                            onChange={(e) =>
                              handleLineChange(idx, "taxRateId", e.target.value)
                            }
                            className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                          >
                            <option value="">No Tax (0%)</option>
                            {taxRates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name} ({t.percentage}%)
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Discount */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.discountPercent}
                            onChange={(e) =>
                              handleLineChange(idx, "discountPercent", e.target.value)
                            }
                            className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                          />
                        </td>

                        {/* Line Subtotal */}
                        <td className="p-2 text-right font-medium text-foreground">
                          ₹{lineSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Remove */}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                            title="Delete Row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Notes */}
            <div className="w-full sm:w-1/2 space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Invoice Terms & Notes
              </label>
              <textarea
                rows={4}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Terms of warranty, delivery schedule, payment conditions..."
                className="w-full p-2.5 rounded-lg border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy resize-none"
              />
            </div>

            {/* Totals Calculation */}
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

          {/* Actions: Save Draft / Cancel / Create Invoice */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={creating}
              className="h-8.5 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSaveInvoice(true)}
              disabled={creating}
              className="h-8.5 text-xs text-navy font-medium"
            >
              Save Draft
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSaveInvoice(false)}
              disabled={creating}
              className="h-8.5 text-xs bg-navy hover:bg-navy/90 text-white font-semibold gap-1.5 shadow-sm px-4"
            >
              {creating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-0.5" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
