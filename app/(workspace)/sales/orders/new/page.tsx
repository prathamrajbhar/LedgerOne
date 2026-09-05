"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { SalesOrderForm } from "../sales-order-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create sales order");
      }

      toast.success("Sales order created successfully");
      router.push("/sales/orders");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create sales order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Sales Order"
        description="Book a new order from a customer with products and pricing."
        actions={
          <Link href="/sales/orders">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Orders
            </Button>
          </Link>
        }
      />
      <SalesOrderForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
