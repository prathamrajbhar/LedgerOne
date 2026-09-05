"use client";

import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function PurchasesPage() {
  const purchaseOrders = [
    { id: "PO-201", vendor: "WoodMart Timber Supplies", date: "17 Nov 2024", material: "Burma Teak Logs & Planks", total: 48500, status: "PENDING" },
    { id: "PO-200", vendor: "Durian Foam & Hardware Co", date: "12 Nov 2024", material: "High Density Cushion Foam & Telescopic Rails", total: 31200, status: "PAID" },
    { id: "PO-199", vendor: "Asian Paints Woodtech", date: "09 Nov 2024", material: "Clear Polyurethane Wood Sealers", total: 18200, status: "PAID" },
    { id: "PO-198", vendor: "Century Plyboards Ltd", date: "04 Nov 2024", material: "Marine Grade BWP Plywood Sheets", total: 64000, status: "PAID" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Purchase Orders & Vendor Bills"
        description="Procure raw timber, foam, upholstery fabrics, hardware fittings, and track vendor payables."
        actions={
          <Button
            size="sm"
            onClick={() => toast.info("Opening Purchase Order builder...")}
            className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Purchase Order
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
              <th className="py-3.5 px-4">PO Number</th>
              <th className="py-3.5 px-4">Timber / Materials Supplier</th>
              <th className="py-3.5 px-4">Order Date</th>
              <th className="py-3.5 px-4">Items / Category</th>
              <th className="py-3.5 px-4 text-right">Bill Total (₹)</th>
              <th className="py-3.5 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-primary-light/30">
                <td className="py-3.5 px-4 font-mono font-bold text-navy">{po.id}</td>
                <td className="py-3.5 px-4 font-semibold text-foreground">{po.vendor}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{po.date}</td>
                <td className="py-3.5 px-4 text-muted-foreground">{po.material}</td>
                <td className="py-3.5 px-4 text-right font-bold text-foreground">
                  ₹{po.total.toLocaleString("en-IN")}.00
                </td>
                <td className="py-3.5 px-4 text-center"><StatusBadge status={po.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
