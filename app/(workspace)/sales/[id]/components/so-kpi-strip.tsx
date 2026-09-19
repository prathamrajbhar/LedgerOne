import * as React from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Percent, Layers } from "lucide-react";
import type { SerializedSalesOrder } from "../types";

export function SoKpiStrip({ order }: { order: SerializedSalesOrder }) {
  const totalTax = order.lines.reduce((acc, l) => acc + (Number(l.taxAmount) || 0), 0);
  const totalUnits = order.lines.reduce((acc, l) => acc + (Number(l.quantity) || 0), 0);
  const subtotal = Number(order.total) - totalTax;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy flex-shrink-0">
          <DollarSign className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Total Order</span>
          <span className="text-lg font-bold text-foreground">
            ₹{Number(order.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal flex-shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Net Subtotal</span>
          <span className="text-lg font-bold text-foreground">
            ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E6] text-warning flex-shrink-0">
          <Percent className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">GST Tax</span>
          <span className="text-lg font-bold text-foreground">
            ₹{totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      <Card className="p-4 bg-white shadow-card flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div>
          <span className="text-xs text-muted-foreground font-medium block">Quantity Booked</span>
          <span className="text-lg font-bold text-foreground">{totalUnits} units</span>
        </div>
      </Card>
    </div>
  );
}
