"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  postJournalEntryAction,
  resetJournalEntryToDraftAction,
  deleteJournalEntryAction,
} from "@/app/actions/accounting.actions";
import { JeHeader } from "./components/je-header";
import { JeKpiStrip } from "./components/je-kpi-strip";
import { JeSourceDocCard } from "./components/je-source-doc-card";
import { JeLinesTable } from "./components/je-lines-table";
import type { SerializedJournalEntryDetail } from "./types";

export function JournalEntryDetailClient({
  initialEntry,
}: {
  initialEntry: SerializedJournalEntryDetail;
}) {
  const router = useRouter();
  const [entry, setEntry] = React.useState<SerializedJournalEntryDetail>(initialEntry);
  const [posting, setPosting] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handlePost = async () => {
    setPosting(true);
    try {
      const result = await postJournalEntryAction(entry.id);
      if (result.success) {
        toast.success("Journal entry posted to general ledger");
        setEntry((prev) => ({ ...prev, status: "POSTED" }));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to post entry");
      }
    } catch {
      toast.error("Failed to post journal entry");
    } finally {
      setPosting(false);
    }
  };

  const handleResetToDraft = async () => {
    if (!confirm("Are you sure you want to reset this entry to draft?")) return;
    setResetting(true);
    try {
      const result = await resetJournalEntryToDraftAction(entry.id);
      if (result.success) {
        toast.success("Journal entry reset to draft");
        setEntry((prev) => ({ ...prev, status: "DRAFT" }));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to reset entry");
      }
    } catch {
      toast.error("Failed to reset journal entry");
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this draft entry?")) return;
    setDeleting(true);
    try {
      const result = await deleteJournalEntryAction(entry.id);
      if (result.success) {
        toast.success("Draft journal entry deleted");
        router.push("/journal-entries");
      } else {
        toast.error(result.error || "Failed to delete entry");
      }
    } catch {
      toast.error("Failed to delete draft journal entry");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <JeHeader
        entry={entry}
        posting={posting}
        resetting={resetting}
        deleting={deleting}
        onPost={handlePost}
        onResetToDraft={handleResetToDraft}
        onDelete={handleDelete}
      />

      <JeKpiStrip entry={entry} />

      <JeSourceDocCard entry={entry} />

      <JeLinesTable
        lines={entry.lines}
        totalDebit={entry.totalDebit}
        totalCredit={entry.totalCredit}
      />
    </div>
  );
}
