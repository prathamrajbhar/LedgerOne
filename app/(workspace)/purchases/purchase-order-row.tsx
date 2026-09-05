"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle } from "lucide-react";
import { confirmPurchaseOrderAction } from "@/app/actions/purchase.actions";
import { toast } from "sonner";

interface PurchaseOrderData {
  id: string;
  poNumber: string;
  vendor?: { name: string } | null;
  orderDate: string | Date;
  status: string;
  totalAmount: number | string;
  _count?: { lines: number };
  lines?: unknown[];
}

interface PurchaseOrderRowProps {
  po: PurchaseOrderData;
}

export function PurchaseOrderRow({ po }: PurchaseOrderRowProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const result = await confirmPurchaseOrderAction(po.id);
      if (result.success) {
        toast.success("Purchase order confirmed successfully");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to confirm purchase order");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsConfirming(false);
    }
  };

  const lineCount = po._count?.lines || po.lines?.length || 0;

  return (
    <tr className="hover:bg-primary-light/30">
      <td className="py-3.5 px-4 font-mono font-bold text-navy">{po.poNumber}</td>
      <td className="py-3.5 px-4 font-semibold text-foreground">{po.vendor?.name || "N/A"}</td>
      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(po.orderDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="py-3.5 px-4 text-muted-foreground">{lineCount} item(s)</td>
      <td className="py-3.5 px-4 text-right font-bold text-foreground">
        ₹{Number(po.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-3.5 px-4 text-center">
        <StatusBadge status={po.status} />
      </td>
      <td className="py-3.5 px-4 text-center">
        {po.status === "DRAFT" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="text-xs"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            {isConfirming ? "Confirming..." : "Confirm"}
          </Button>
        )}
      </td>
    </tr>
  );
}
