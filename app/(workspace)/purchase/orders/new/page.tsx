"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PurchaseOrderForm } from "../purchase-order-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/purchase/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create purchase order");
      }

      toast.success("Purchase order created successfully");
      router.push("/purchase/orders");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Purchase Order"
        description="Draft a new procurement order with vendor details and line items."
        actions={
          <Link href="/purchase/orders">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Button>
          </Link>
        }
      />
      <PurchaseOrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
