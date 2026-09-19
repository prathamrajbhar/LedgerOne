import * as React from "react";
import { notFound } from "next/navigation";
import { getJournalEntryByIdAction } from "@/app/actions/accounting.actions";
import { JournalEntryDetailClient } from "./journal-entry-detail-client";
import type { SerializedJournalEntryDetail } from "./types";

export default async function JournalEntryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getJournalEntryByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const raw = result.data as unknown as Record<string, unknown>;
  const entry: SerializedJournalEntryDetail = {
    id: String(raw.id),
    entryNumber: String(raw.entryNumber),
    accountingDate: String(raw.accountingDate),
    status: String(raw.status),
    source: String(raw.source),
    reference: raw.reference ? String(raw.reference) : null,
    totalDebit: Number(raw.totalDebit || 0),
    totalCredit: Number(raw.totalCredit || 0),
    journal: raw.journal as SerializedJournalEntryDetail["journal"],
    createdBy: raw.createdBy as SerializedJournalEntryDetail["createdBy"],
    vendorBill: raw.vendorBill as SerializedJournalEntryDetail["vendorBill"],
    invoice: raw.invoice as SerializedJournalEntryDetail["invoice"],
    billPayment: raw.billPayment as SerializedJournalEntryDetail["billPayment"],
    invoicePayment: raw.invoicePayment as SerializedJournalEntryDetail["invoicePayment"],
    lines: ((raw.lines as unknown[]) || []).map((l: unknown) => {
      const line = l as Record<string, unknown>;
      return {
        id: String(line.id),
        account: line.account as { code: string; name: string; type?: string },
        partner: line.partner as { name: string } | null,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
      };
    }),
  };

  return <JournalEntryDetailClient initialEntry={entry} />;
}
