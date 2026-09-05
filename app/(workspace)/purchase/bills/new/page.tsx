"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { VendorBillForm } from "../vendor-bill-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewVendorBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/purchase/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create vendor bill");
      }

      toast.success("Vendor bill recorded successfully");
      router.push("/purchase/bills");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create vendor bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Vendor Bill"
        description="Record an incoming supplier bill, set due dates, and schedule payment."
        actions={
          <Link href="/purchase/bills">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Bills
            </Button>
          </Link>
        }
      />
      <VendorBillForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
