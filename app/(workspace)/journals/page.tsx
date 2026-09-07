"use client";

import * as React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DebouncedSearchInput } from "@/components/ui/debounced-search-input";
import { toast } from "sonner";
import { getJournalsAction } from "@/app/actions/master-data.actions";

interface JournalItem {
  id: string;
  code: string;
  name: string;
  type: "SALES" | "PURCHASE" | "BANK" | "CASH";
  defaultAccount: {
    id: string;
    code: string;
    name: string;
  };
}

export default function JournalsPage() {
  const [journals, setJournals] = React.useState<JournalItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");

  const loadJournals = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getJournalsAction();
      if (result.success && result.data) {
        setJournals(result.data as JournalItem[]);
      } else {
        toast.error(result.error || "Failed to load journals");
      }
    } catch {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const filtered = React.useMemo(() => {
    return journals.filter(
      (j) =>
        j.name.toLowerCase().includes(search.toLowerCase()) ||
        j.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [journals, search]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Accounting Journals"
        description="Configure accounting posting books for sales, timber purchases, liquid bank flows, and general entries."
        actions={
          <Link href="/journals/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-xs cursor-pointer">
              <Plus className="h-4 w-4" />
              New Journal
            </Button>
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <div className="max-w-sm w-full">
          <DebouncedSearchInput
            placeholder="Search journals by name or code..."
            value={search}
            onChange={setSearch}
            className="py-2"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading journals...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">
            {search
              ? "No journals found matching your search"
              : "No journals yet. Create your first journal to get started."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Journal Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Default Account</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((j) => (
                  <tr key={j.id} className="hover:bg-primary-light/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">{j.code}</td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">{j.name}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                        {j.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {j.defaultAccount.code} - {j.defaultAccount.name}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success" className="text-[10px]">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
