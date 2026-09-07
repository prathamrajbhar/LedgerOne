"use client";

import * as React from "react";
import Link from "next/link";
import { Boxes, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import type { InventoryStatus } from "@/app/actions/dashboard.actions";

interface InventoryStatusCardProps {
  inventoryStatus: InventoryStatus;
}

export function InventoryStatusCard({ inventoryStatus }: InventoryStatusCardProps) {
  return (
    <Card className="p-5 bg-white shadow-card flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <CardTitle className="text-sm font-bold text-foreground">
          Inventory Status
        </CardTitle>
        <Link
          href="/inventory"
          className="text-xs font-semibold text-teal hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1 pt-3">
        <Link
          href="/products"
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border hover:bg-surface hover:border-navy/30 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9] group-hover:scale-105 transition-transform">
            <Boxes className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block font-medium truncate">
              Total Products
            </span>
            <span className="text-lg font-bold text-foreground">
              {inventoryStatus.totalProducts}
            </span>
          </div>
        </Link>

        <Link
          href="/products?status=LOW_STOCK"
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border hover:bg-[#FFFDF7] hover:border-warning/40 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF7E6] text-warning group-hover:scale-105 transition-transform">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block font-medium truncate">
              Low Stock
            </span>
            <span className="text-lg font-bold text-warning">
              {inventoryStatus.lowStock}
            </span>
          </div>
        </Link>

        <Link
          href="/products?status=ACTIVE"
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border hover:bg-[#F7FCFA] hover:border-success/40 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF7F1] text-success group-hover:scale-105 transition-transform">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block font-medium truncate">
              In Stock
            </span>
            <span className="text-lg font-bold text-success">
              {inventoryStatus.inStock}
            </span>
          </div>
        </Link>

        <Link
          href="/products?status=OUT_OF_STOCK"
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border hover:bg-[#FFF9F9] hover:border-destructive/40 transition-all group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FDEEEE] text-destructive group-hover:scale-105 transition-transform">
            <XCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-muted-foreground block font-medium truncate">
              Out of Stock
            </span>
            <span className="text-lg font-bold text-destructive">
              {inventoryStatus.outOfStock}
            </span>
          </div>
        </Link>
      </div>
    </Card>
  );
}
