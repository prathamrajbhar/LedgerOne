"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { FormLineRow } from "../invoices-types";

interface InvoiceCreateItemsTableProps {
  formLines: FormLineRow[];
  productOptions: Array<{ value: string; label: string; subLabel?: string }>;
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (index: number, field: keyof FormLineRow, value: unknown) => void;
}

export function InvoiceCreateItemsTable({
  formLines,
  productOptions,
  taxRates,
  onAddLine,
  onRemoveLine,
  onLineChange,
}: InvoiceCreateItemsTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-navy">
          Invoice Item Table
        </span>
        <Button
          type="button"
          onClick={onAddLine}
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5 cursor-pointer"
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
              <th className="py-2.5 px-3 w-[14%] text-right">Unit Price</th>
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
                <tr key={idx} className="hover:bg-[#F8FAFC]/50">
                  <td className="p-2 min-w-[200px]">
                    <SearchableSelect
                      size="sm"
                      options={productOptions}
                      value={line.productId}
                      onChange={(val) => onLineChange(idx, "productId", val)}
                      placeholder="Select product..."
                      searchPlaceholder="Search product by name or SKU..."
                      emptyMessage="No products found"
                      className="h-8"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => onLineChange(idx, "description", e.target.value)}
                      placeholder="Details..."
                      className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => onLineChange(idx, "quantity", e.target.value)}
                      className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => onLineChange(idx, "unitPrice", e.target.value)}
                      placeholder="0.00"
                      className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2">
                    <select
                      value={line.taxRateId}
                      onChange={(e) => onLineChange(idx, "taxRateId", e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
                    >
                      <option value="">No Tax</option>
                      {taxRates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.percentage}%)
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.discountPercent}
                      onChange={(e) => onLineChange(idx, "discountPercent", e.target.value)}
                      className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2 text-right font-medium text-foreground">
                    ₹{lineSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(idx)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
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
  );
}
