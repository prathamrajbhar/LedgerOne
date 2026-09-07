"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface PurchaseLineItem {
  id: string;
  productId: string;
  analyticAccountId: string;
  quantity: number;
  unitPrice: number;
}

interface PurchaseNewLinesProps {
  lines: PurchaseLineItem[];
  productOptions: Array<{ value: string; label: string; subLabel?: string }>;
  analyticAccountOptions: Array<{ value: string; label: string; subLabel?: string }>;
  onAddLine: () => void;
  onRemoveLine: (id: string) => void;
  onLineChange: (id: string, field: keyof PurchaseLineItem, value: string | number) => void;
}

export function PurchaseNewLines({
  lines,
  productOptions,
  analyticAccountOptions,
  onAddLine,
  onRemoveLine,
  onLineChange,
}: PurchaseNewLinesProps) {
  return (
    <div className="bg-white p-5 border border-border rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-semibold text-navy uppercase tracking-wider">
          Procurement Items & Materials ({lines.length})
        </span>
        <Button
          type="button"
          onClick={onAddLine}
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Material Line
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-[35%]">Product / Material <span className="text-destructive">*</span></th>
              <th className="py-2.5 px-3 w-[25%]">Cost Center / Project <span className="text-destructive">*</span></th>
              <th className="py-2.5 px-3 w-[12%] text-right">Qty</th>
              <th className="py-2.5 px-3 w-[14%] text-right">Unit Cost (₹)</th>
              <th className="py-2.5 px-3 w-[14%] text-right">Subtotal (₹)</th>
              <th className="py-2.5 px-2 w-[3%] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {lines.map((line) => {
              const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);

              return (
                <tr key={line.id} className="hover:bg-[#F8FAFC]/50">
                  <td className="p-2 min-w-[200px]">
                    <SearchableSelect
                      size="sm"
                      options={productOptions}
                      value={line.productId}
                      onChange={(val) => onLineChange(line.id, "productId", val)}
                      placeholder="Select material..."
                      searchPlaceholder="Search products..."
                      emptyMessage="No products found"
                      className="h-8"
                    />
                  </td>

                  <td className="p-2 min-w-[170px]">
                    <SearchableSelect
                      size="sm"
                      options={analyticAccountOptions}
                      value={line.analyticAccountId}
                      onChange={(val) => onLineChange(line.id, "analyticAccountId", val)}
                      placeholder="Select cost center..."
                      searchPlaceholder="Search analytic accounts..."
                      emptyMessage="No cost centers"
                      className="h-8"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => onLineChange(line.id, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => onLineChange(line.id, "unitPrice", parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2 text-right font-semibold font-mono text-navy">
                    ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="p-2 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveLine(line.id)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                      title="Delete Line"
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
