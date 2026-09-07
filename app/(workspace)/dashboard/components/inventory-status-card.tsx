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
    <Card className="p-5 bg-white shadow-card flex flex-col justify-between">
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

      <div className="grid grid-cols-2 gap-3 pt-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF5FC] text-[#3478B9]">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-medium">
              Total Products
            </span>
            <span className="text-base font-bold text-foreground">
              {inventoryStatus.totalProducts}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF7E6] text-warning">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-medium">
              Low Stock
            </span>
            <span className="text-base font-bold text-warning">
              {inventoryStatus.lowStock}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF7F1] text-success">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-medium">
              In Stock
            </span>
            <span className="text-base font-bold text-success">
              {inventoryStatus.inStock}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-subtle border border-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FDEEEE] text-destructive">
            <XCircle className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-medium">
              Out of Stock
            </span>
            <span className="text-base font-bold text-destructive">
              {inventoryStatus.outOfStock}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
