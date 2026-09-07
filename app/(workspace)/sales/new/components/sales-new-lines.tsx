"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";

export interface SalesLineItem {
  productId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface SalesNewLinesProps {
  lines: SalesLineItem[];
  productOptions: Array<{ value: string; label: string; subLabel?: string }>;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onLineChange: (index: number, field: keyof SalesLineItem, value: string | number) => void;
}

export function SalesNewLines({
  lines,
  productOptions,
  onAddLine,
  onRemoveLine,
  onLineChange,
}: SalesNewLinesProps) {
  return (
    <div className="bg-white p-5 border border-border rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-semibold text-navy uppercase tracking-wider">
          Ordered Products & Furniture Lines ({lines.length})
        </span>
        <Button
          type="button"
          onClick={onAddLine}
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1 text-teal border-teal/30 hover:bg-teal/5 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          Add Product Line
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="py-2.5 px-3 w-[40%]">Product <span className="text-destructive">*</span></th>
              <th className="py-2.5 px-3 w-[25%]">Description</th>
              <th className="py-2.5 px-3 w-[12%] text-right">Quantity</th>
              <th className="py-2.5 px-3 w-[15%] text-right">Unit Price (₹)</th>
              <th className="py-2.5 px-3 w-[15%] text-right">Subtotal (₹)</th>
              <th className="py-2.5 px-2 w-[3%] text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {lines.map((line, idx) => {
              const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);

              return (
                <tr key={idx} className="hover:bg-[#F8FAFC]/50">
                  <td className="p-2 min-w-[220px]">
                    <SearchableSelect
                      size="sm"
                      options={productOptions}
                      value={line.productId}
                      onChange={(val) => onLineChange(idx, "productId", val)}
                      placeholder="Select product..."
                      searchPlaceholder="Search furniture products..."
                      emptyMessage="No products found"
                      className="h-8"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => onLineChange(idx, "description", e.target.value)}
                      placeholder="Item details..."
                      className="w-full h-8 px-2 rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => onLineChange(idx, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full h-8 px-2 text-right rounded-md border border-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) => onLineChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
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
                      onClick={() => onRemoveLine(idx)}
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
