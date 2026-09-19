"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Boxes, PackageCheck, AlertTriangle, XCircle } from "lucide-react";
import type { StockReport } from "@/lib/services/reports/stock-report.service";

interface StockValuationTabProps {
  report: StockReport | null;
  onRefresh: () => void;
  loading: boolean;
}

export function StockValuationTab({
  report,
  onRefresh,
  loading,
}: StockValuationTabProps) {
  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Valuation</span>
            <span className="text-lg font-bold text-foreground">
              ₹{report.summary.totalStockValuation.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F1] text-success flex-shrink-0">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">In Stock Items</span>
            <span className="text-lg font-bold text-foreground">
              {report.summary.inStockCount} / {report.summary.totalProducts}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6] text-warning flex-shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Low Stock Alerts</span>
            <span className="text-lg font-bold text-warning">{report.summary.lowStockCount}</span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDEEEE] text-destructive flex-shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Out of Stock</span>
            <span className="text-lg font-bold text-destructive">{report.summary.outOfStockCount}</span>
          </div>
        </Card>
      </div>

      {/* Category Breakdown Table */}
      <Card className="p-5 bg-white shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Category-wise Stock Valuation
            </h3>
            <p className="text-xs text-muted-foreground">
              Aggregate valuation by furniture product categories.
            </p>
          </div>
          <Button
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs bg-navy text-white hover:bg-navy-hover"
          >
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground uppercase text-[11px] font-semibold border-b border-border bg-[#F9FAFB]">
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-center">SKU Count</th>
                <th className="py-2.5 px-4 text-center">Total Quantity</th>
                <th className="py-2.5 px-4 text-right">Total Valuation (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.categorySummaries.map((cat) => (
                <tr key={cat.category} className="hover:bg-primary-light/30">
                  <td className="py-2.5 px-4 font-semibold text-foreground">
                    {cat.category}
                  </td>
                  <td className="py-2.5 px-4 text-center text-muted-foreground">
                    {cat.totalItems}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-foreground">
                    {cat.totalQuantity} units
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-navy">
                    ₹
                    {cat.totalValuation.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Itemized Stock Details Table */}
      <Card className="p-5 bg-white shadow-card">
        <div className="pb-3 border-b border-border mb-3">
          <h3 className="text-sm font-bold text-foreground">Itemized Stock Audit</h3>
          <p className="text-xs text-muted-foreground">
            Complete inventory valuation list of all product models and materials.
          </p>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-[#F9FAFB]">
              <tr className="text-muted-foreground uppercase text-[11px] font-semibold border-b border-border">
                <th className="py-2.5 px-4">SKU</th>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4 text-center">Stock</th>
                <th className="py-2.5 px-4 text-right">Cost Price</th>
                <th className="py-2.5 px-4 text-right">Total Valuation</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.items.map((item) => (
                <tr key={item.id} className="hover:bg-primary-light/30">
                  <td className="py-2.5 px-4 font-mono font-bold text-navy">
                    {item.sku}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-foreground">
                    {item.name}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-foreground">
                    {item.stock}
                  </td>
                  <td className="py-2.5 px-4 text-right text-muted-foreground">
                    ₹{item.cost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-navy">
                    ₹
                    {item.totalValuation.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
