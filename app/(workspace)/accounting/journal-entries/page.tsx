import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { journalEntryService } from "@/lib/services/journal-entry.service";
import { JournalEntriesTable } from "./journal-entries-table";

export const dynamic = "force-dynamic";

export default async function JournalEntriesPage({
  searchParams,
}: {
  searchParams: { status?: string; journalId?: string; page?: string };
}) {
  const entries = await journalEntryService.list({
    status: searchParams.status as any,
    journalId: searchParams.journalId,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal Entries"
        description="Double-entry general ledger with enforced debit-credit balance verification."
        actions={
          <Link href="/accounting/journal-entries/new">
            <Button size="sm" className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Journal Entry
            </Button>
          </Link>
        }
      />
      <JournalEntriesTable data={entries} />
    </div>
  );
}
