"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle, FileText, Eye, Loader2 } from "lucide-react";
import { confirmPurchaseOrderAction, createBillFromPurchaseOrderAction } from "@/app/actions/purchase.actions";
import { toast } from "sonner";

interface PurchaseOrderData {
  id: string;
  poNumber: string;
  vendor?: { name: string } | null;
  orderDate: string | Date;
  status: string;
  total: unknown;
  _count?: { lines: number };
  lines?: unknown[];
  vendorBills?: Array<{ id: string; billNumber: string; status: string }>;
}

interface PurchaseOrderRowProps {
  po: PurchaseOrderData;
}

export function PurchaseOrderRow({ po }: PurchaseOrderRowProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isCreatingBill, setIsCreatingBill] = React.useState(false);

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
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCreateBill = async () => {
    setIsCreatingBill(true);
    try {
      const result = await createBillFromPurchaseOrderAction(po.id);
      if (result.success && result.data) {
        toast.success(`Vendor bill #${result.data.billNumber} created from PO`);
        router.push(`/bills/${result.data.id}`);
      } else {
        toast.error(result.error || "Failed to create vendor bill from PO");
      }
    } catch {
      toast.error("An error occurred creating vendor bill");
    } finally {
      setIsCreatingBill(false);
    }
  };

  const lineCount = po._count?.lines || po.lines?.length || 0;
  const hasBills = po.vendorBills && po.vendorBills.length > 0;

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
        <StatusBadge status={hasBills ? "BILLED" : po.status} />
      </td>
      <td className="py-3.5 px-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {po.status === "DRAFT" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="text-xs"
            >
              {isConfirming ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
              )}
              {isConfirming ? "Confirming..." : "Confirm"}
            </Button>
          )}

          {po.status === "CONFIRMED" && !hasBills && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateBill}
              disabled={isCreatingBill}
              className="text-xs gap-1.5 text-navy border-navy hover:bg-navy hover:text-white"
            >
              {isCreatingBill ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5 mr-1" />
              )}
              {isCreatingBill ? "Creating..." : "Create Vendor Bill"}
            </Button>
          )}

          {hasBills && (
            <Link
              href={po.vendorBills?.[0]?.id ? `/bills/${po.vendorBills[0].id}` : `/bills?search=${encodeURIComponent(po.poNumber)}`}
              className="inline-flex items-center gap-1 text-xs text-navy font-medium hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              View Bill
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
}
