"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { BudgetForm } from "../budget-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewBudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create budget");
      }

      toast.success("Budget created in Draft state");
      router.push("/budgets");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Budget"
        description="Set up a new operational or revenue budget with analytic account limits."
        actions={
          <Link href="/budgets">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Budgets
            </Button>
          </Link>
        }
      />
      <BudgetForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
