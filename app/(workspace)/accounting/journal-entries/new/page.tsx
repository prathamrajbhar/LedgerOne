"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { JournalEntryForm } from "../journal-entry-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewJournalEntryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/accounting/journal-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create journal entry");
      }

      toast.success("Journal entry recorded successfully");
      router.push("/accounting/journal-entries");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create journal entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Journal Entry"
        description="Create a manual double-entry transaction. Debits must equal Credits."
        actions={
          <Link href="/accounting/journal-entries">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Journal Entries
            </Button>
          </Link>
        }
      />
      <JournalEntryForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
