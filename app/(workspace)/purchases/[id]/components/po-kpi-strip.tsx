import * as React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, Package, CheckSquare, Layers } from "lucide-react";
import type { SerializedPurchaseOrder } from "../types";

export function PoKpiStrip({ po }: { po: SerializedPurchaseOrder }) {
  const totalUnits = po.lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  const hasBills = po.vendorBills && po.vendorBills.length > 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy flex-shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Total PO Value</span>
          <span className="text-lg font-bold text-foreground">
            ₹{Number(po.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal flex-shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Line Items</span>
          <span className="text-lg font-bold text-foreground">
            {po.lines.length} items
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Quantity Ordered</span>
          <span className="text-lg font-bold text-foreground">{totalUnits} units</span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF7F1] text-success flex-shrink-0">
          <CheckSquare className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Billing Status</span>
          <span className="text-lg font-bold text-foreground">
            {hasBills ? "Billed" : "Pending Bill"}
          </span>
        </div>
      </Card>
    </div>
  );
}
