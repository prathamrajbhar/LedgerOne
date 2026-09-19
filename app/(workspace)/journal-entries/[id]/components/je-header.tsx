"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SerializedJournalEntryDetail } from "../types";

interface JeHeaderProps {
  entry: SerializedJournalEntryDetail;
  posting: boolean;
  resetting: boolean;
  deleting: boolean;
  onPost: () => void;
  onResetToDraft: () => void;
  onDelete: () => void;
}

export function JeHeader({
  entry,
  posting,
  resetting,
  deleting,
  onPost,
  onResetToDraft,
  onDelete,
}: JeHeaderProps) {
  const isDraft = entry.status === "DRAFT";

  return (
    <div className="space-y-3">
      <Link
        href="/journal-entries"
        className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Journal Entries
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-navy">
              Journal Entry #{entry.entryNumber}
            </h1>
            <Badge
              variant={entry.status === "POSTED" ? "success" : "secondary"}
              className="text-xs"
            >
              {entry.status}
            </Badge>
            <Badge variant="outline" className="text-xs bg-[#F6F7F9]">
              {entry.source}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Journal: <span className="font-semibold text-foreground">{entry.journal.name} ({entry.journal.code})</span> • Date:{" "}
            {new Date(entry.accountingDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Entry
          </Button>

          {isDraft && (
            <Button
              size="sm"
              onClick={onPost}
              disabled={posting}
              className="h-8 text-xs bg-navy hover:bg-navy-hover text-white font-medium gap-1.5 cursor-pointer"
            >
              {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              Post Entry
            </Button>
          )}

          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 border-destructive/20 gap-1.5 cursor-pointer"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              Delete Draft
            </Button>
          )}

          {!isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetToDraft}
              disabled={resetting}
              className="h-8 text-xs text-muted-foreground hover:text-navy border-border gap-1.5 cursor-pointer"
            >
              {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              Reset to Draft
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
