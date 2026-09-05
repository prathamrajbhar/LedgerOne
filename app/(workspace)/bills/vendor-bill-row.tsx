"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle } from "lucide-react";
import { confirmBillAction } from "@/app/actions/purchase.actions";
import { toast } from "sonner";

interface VendorBillRowProps {
  bill: any;
}

export function VendorBillRow({ bill }: VendorBillRowProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const result = await confirmBillAction(bill.id);
      if (result.success) {
        toast.success("Vendor bill confirmed successfully and journal entry created");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to confirm vendor bill");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <tr className="hover:bg-primary-light/30">
      <td className="py-3.5 px-4 font-mono font-bold text-navy">{bill.billNumber}</td>
      <td className="py-3.5 px-4 font-semibold text-foreground">{bill.vendor?.name || "N/A"}</td>
      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(bill.billDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="py-3.5 px-4 text-muted-foreground">
        {new Date(bill.dueDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </td>
      <td className="py-3.5 px-4 text-right font-bold text-foreground">
        ₹{Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-3.5 px-4 text-right text-muted-foreground">
        ₹{Number(bill.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-3.5 px-4 text-right text-muted-foreground">
        ₹{Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-3.5 px-4 text-center">
        <StatusBadge status={bill.status} />
      </td>
      <td className="py-3.5 px-4 text-center">
        <StatusBadge status={bill.paymentStatus} />
      </td>
      <td className="py-3.5 px-4 text-center">
        {bill.status === "DRAFT" && (
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
