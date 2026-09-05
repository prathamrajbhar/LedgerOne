"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Boxes, AlertTriangle, CheckCircle2, XCircle, Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

export default function InventoryPage() {
  const stockMetrics = [
    { label: "Total Products", count: 124, icon: Boxes, color: "text-[#3478B9]", bg: "bg-[#EDF5FC]" },
    { label: "Low Stock", count: 8, icon: AlertTriangle, color: "text-warning", bg: "bg-[#FFF7E6]" },
    { label: "In Stock", count: 108, icon: CheckCircle2, color: "text-success", bg: "bg-[#EAF7F1]" },
    { label: "Out of Stock", count: 8, icon: XCircle, color: "text-destructive", bg: "bg-[#FDEEEE]" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Stock Valuation"
        description="Real-time furniture stock counts, warehouse reorder alerts, and safety thresholds."
        actions={
          <Link href="/products/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              Add Stock Item
            </Button>
          </Link>
        }
      />

      {/* 4 Metric Cards Matching Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stockMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-4 bg-white shadow-card flex items-center gap-3.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.bg} ${m.color} flex-shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium block">
                  {m.label}
                </span>
                <span className="text-xl font-bold text-foreground">
                  {m.count}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Urgent Attention Table */}
      <Card className="p-5 bg-white shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
          <h3 className="text-sm font-bold text-foreground">
            Items Requiring Restock (Threshold ≤ 5)
          </h3>
          <span className="text-xs text-warning font-semibold">16 items alerted</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-muted-foreground uppercase text-[11px] font-semibold border-b border-border bg-[#F9FAFB]">
                <th className="py-3 px-4">Item SKU</th>
                <th className="py-3 px-4">Furniture Model</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Remaining</th>
                <th className="py-3 px-4 text-center">Min. Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-primary-light/30">
                <td className="py-3 px-4 font-mono font-bold text-navy">FUR-BED-004</td>
                <td className="py-3 px-4 font-semibold text-foreground">Nordic Solid Oak King Size Bed</td>
                <td className="py-3 px-4 text-muted-foreground">Bedroom</td>
                <td className="py-3 px-4 text-center font-bold text-destructive">0 units</td>
                <td className="py-3 px-4 text-center text-muted-foreground">3 units</td>
                <td className="py-3 px-4"><StatusBadge status="OUT_OF_STOCK" /></td>
                <td className="py-3 px-4 text-center">
                  <Button size="sm" onClick={() => toast.success("Purchase order draft created.")} className="h-7 text-xs bg-navy text-white">
                    Reorder Now
                  </Button>
                </td>
              </tr>
              <tr className="hover:bg-primary-light/30">
                <td className="py-3 px-4 font-mono font-bold text-navy">FUR-OFF-003</td>
                <td className="py-3 px-4 font-semibold text-foreground">Ergonomic High-Back Executive Chair</td>
                <td className="py-3 px-4 text-muted-foreground">Office</td>
                <td className="py-3 px-4 text-center font-bold text-warning">4 units</td>
                <td className="py-3 px-4 text-center text-muted-foreground">6 units</td>
                <td className="py-3 px-4"><StatusBadge status="LOW_STOCK" /></td>
                <td className="py-3 px-4 text-center">
                  <Button size="sm" onClick={() => toast.success("Purchase order draft created.")} className="h-7 text-xs bg-navy text-white">
                    Reorder Now
                  </Button>
                </td>
              </tr>
              <tr className="hover:bg-primary-light/30">
                <td className="py-3 px-4 font-mono font-bold text-navy">FUR-COF-006</td>
                <td className="py-3 px-4 font-semibold text-foreground">Marble Top Round Coffee Table</td>
                <td className="py-3 px-4 text-muted-foreground">Living Room</td>
                <td className="py-3 px-4 text-center font-bold text-warning">3 units</td>
                <td className="py-3 px-4 text-center text-muted-foreground">4 units</td>
                <td className="py-3 px-4"><StatusBadge status="LOW_STOCK" /></td>
                <td className="py-3 px-4 text-center">
                  <Button size="sm" onClick={() => toast.success("Purchase order draft created.")} className="h-7 text-xs bg-navy text-white">
                    Reorder Now
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
