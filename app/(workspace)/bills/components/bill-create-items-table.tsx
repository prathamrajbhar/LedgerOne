"use client";

import * as React from "react";
import { FileCheck, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type { FormBillLineRow } from "../bills-types";

interface BillCreateItemsTableProps {
  formLines: FormBillLineRow[];
  productOptions: Array<{ value: string; label: string; subLabel?: string }>;
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  onAddLine: () => void;
  onRemoveLine: (idx: number) => void;
  onLineChange: (idx: number, field: keyof FormBillLineRow, value: string | number) => void;
}

export function BillCreateItemsTable({
  formLines,
  productOptions,
  taxRates,
  onAddLine,
  onRemoveLine,
  onLineChange,
}: BillCreateItemsTableProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-border/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-teal" />
          <span className="text-xs font-bold text-navy">Itemized Procurement Lines</span>
          <span className="text-[11px] font-semibold text-muted-foreground bg-[#F1F5F9] px-2 py-0.5 rounded-full">
            {formLines.length} {formLines.length === 1 ? "Item" : "Items"}
          </span>
        </div>
        <Button
          type="button"
          onClick={onAddLine}
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 text-teal border-teal/30 hover:bg-teal/5 font-semibold cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Line Item
        </Button>
      </div>

      <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 w-[25%]">Product / Material</th>
              <th className="py-3 px-3 w-[21%]">Description / Specs</th>
              <th className="py-3 px-3 w-[8%] text-right">Qty</th>
              <th className="py-3 px-3 w-[7%] text-center">Unit</th>
              <th className="py-3 px-3 w-[13%] text-right">Unit Cost (₹)</th>
              <th className="py-3 px-3 w-[12%] text-left">Tax</th>
              <th className="py-3 px-3 w-[7%] text-right">Disc %</th>
              <th className="py-3 px-3 w-[11%] text-right">Amount (₹)</th>
              <th className="py-3 px-2 w-[4%] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {formLines.map((line, idx) => {
              const qty = Number(line.quantity) || 0;
              const cost = Number(line.unitCost) || 0;
              const disc = Number(line.discountPercent) || 0;
              const base = qty * cost;
              const lineSubtotal = Math.max(0, base - (base * disc) / 100);

              return (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-2.5 min-w-[220px]">
                    <SearchableSelect
                      size="sm"
                      options={productOptions}
                      value={line.productId}
                      onChange={(val) => onLineChange(idx, "productId", val)}
                      placeholder="Select item..."
                      searchPlaceholder="Search product, material, SKU..."
                    />
                  </td>

                  <td className="p-2.5">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => onLineChange(idx, "description", e.target.value)}
                      placeholder="Specifications / Grade..."
                      className="w-full h-8.5 px-2.5 rounded-lg border border-border bg-white text-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-teal"
                    />
                  </td>

                  <td className="p-2.5">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => onLineChange(idx, "quantity", e.target.value)}
                      className="w-full h-8.5 px-2 text-right rounded-lg border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-teal font-medium"
                    />
                  </td>

                  <td className="p-2.5 text-center">
                    <span className="text-[11px] font-semibold text-muted-foreground bg-[#F1F5F9] px-2 py-1 rounded-md border border-border/50">
                      {line.unit || "pcs"}
                    </span>
                  </td>

                  <td className="p-2.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitCost}
                      onChange={(e) => onLineChange(idx, "unitCost", e.target.value)}
                      placeholder="0.00"
                      className="w-full h-8.5 px-2 text-right rounded-lg border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-teal font-medium"
                    />
                  </td>

                  <td className="p-2.5">
                    <select
                      value={line.taxRateId}
                      onChange={(e) => onLineChange(idx, "taxRateId", e.target.value)}
                      className="w-full h-8.5 px-2 rounded-lg border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-teal"
                    >
                      <option value="">No Tax (0%)</option>
                      {taxRates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.percentage}%)
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={line.discountPercent}
                      onChange={(e) => onLineChange(idx, "discountPercent", e.target.value)}
                      className="w-full h-8.5 px-2 text-right rounded-lg border border-border bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-teal"
                    />
                  </td>

                  <td className="p-2.5 text-right font-semibold text-navy">
                    ₹{lineSubtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(idx)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Delete Row"
                    >
                      <Trash2 className="w-4 h-4" />
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
