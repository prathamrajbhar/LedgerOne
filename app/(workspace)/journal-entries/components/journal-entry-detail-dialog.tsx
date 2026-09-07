"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJournalEntryByIdAction } from "@/app/actions/accounting.actions";
import { Loader2, FileText, Calendar, BookOpen, User, ArrowRight } from "lucide-react";
import Link from "next/link";

interface JournalEntryDetailDialogProps {
  entryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JournalEntryDetail {
  id: string;
  entryNumber: string;
  accountingDate: string;
  status: string;
  source: string;
  reference: string | null;
  totalDebit: number;
  totalCredit: number;
  journal: {
    code: string;
    name: string;
    type: string;
  };
  createdBy: {
    name: string;
    email: string;
  };
  vendorBill?: {
    id: string;
    billNumber: string;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
  } | null;
  lines: Array<{
    id: string;
    account: {
      code: string;
      name: string;
      type: string;
    };
    partner?: {
      name: string;
    } | null;
    debit: number;
    credit: number;
  }>;
}

export function JournalEntryDetailDialog({
  entryId,
  open,
  onOpenChange,
}: JournalEntryDetailDialogProps) {
  const [entry, setEntry] = React.useState<JournalEntryDetail | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!entryId || !open) {
      setEntry(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    getJournalEntryByIdAction(entryId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          const raw = res.data as any;
          setEntry({
            id: raw.id,
            entryNumber: raw.entryNumber,
            accountingDate: new Date(raw.accountingDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            status: raw.status,
            source: raw.source,
            reference: raw.reference || null,
            totalDebit: Number(raw.totalDebit),
            totalCredit: Number(raw.totalCredit),
            journal: {
              code: raw.journal?.code || "",
              name: raw.journal?.name || "",
              type: raw.journal?.type || "",
            },
            createdBy: {
              name: raw.createdBy?.name || "System",
              email: raw.createdBy?.email || "",
            },
            vendorBill: raw.vendorBill
              ? { id: raw.vendorBill.id, billNumber: raw.vendorBill.billNumber }
              : null,
            invoice: raw.invoice
              ? { id: raw.invoice.id, invoiceNumber: raw.invoice.invoiceNumber }
              : null,
            lines: (raw.lines || []).map((line: any) => ({
              id: line.id,
              account: {
                code: line.account?.code || "",
                name: line.account?.name || "",
                type: line.account?.type || "",
              },
              partner: line.partner ? { name: line.partner.name } : null,
              debit: Number(line.debit),
              credit: Number(line.credit),
            })),
          });
        } else {
          setError(res.error || "Failed to load journal entry details");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "An unexpected error occurred");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [entryId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-navy font-mono">
                  {entry?.entryNumber || "Journal Entry Details"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Double-entry general ledger voucher audit
                </p>
              </div>
            </div>
            {entry && (
              <Badge
                variant={entry.status === "POSTED" ? "success" : "secondary"}
                className="text-xs"
              >
                {entry.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-7 w-7 animate-spin text-navy" />
            <p className="text-xs text-muted-foreground">Loading entry details...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-destructive text-sm">
            {error}
          </div>
        ) : entry ? (
          <div className="space-y-6 pt-2">
            {/* Meta Information Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F9FAFB] p-3.5 rounded-xl border border-border text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Journal</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <BookOpen className="h-3 w-3 text-navy" />
                  {entry.journal.name} ({entry.journal.code})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Date</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3 text-navy" />
                  {entry.accountingDate}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Source</span>
                <span className="font-medium text-foreground mt-0.5 block">
                  <Badge variant="outline" className="text-[10px] bg-white">
                    {entry.source}
                  </Badge>
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Created By</span>
                <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                  <User className="h-3 w-3 text-navy" />
                  {entry.createdBy.name}
                </span>
              </div>
            </div>

            {/* Linked Document Banner if available */}
            {entry.invoice && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs">
                <span className="text-navy">
                  Linked Customer Invoice: <strong>{entry.invoice.invoiceNumber}</strong>
                </span>
                <Link
                  href={`/invoices/${entry.invoice.id}`}
                  className="inline-flex items-center gap-1 text-navy font-semibold hover:underline"
                >
                  View Invoice <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
            {entry.vendorBill && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                <span className="text-amber-900">
                  Linked Vendor Bill: <strong>{entry.vendorBill.billNumber}</strong>
                </span>
                <Link
                  href={`/bills/${entry.vendorBill.id}`}
                  className="inline-flex items-center gap-1 text-amber-900 font-semibold hover:underline"
                >
                  View Bill <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Double-Entry Lines Table */}
            <div>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                Accounting Lines
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase">
                      <th className="py-2.5 px-3">Account</th>
                      <th className="py-2.5 px-3">Partner</th>
                      <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                      <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entry.lines.map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-foreground">
                          <span className="font-mono text-muted-foreground mr-1.5 text-[11px]">
                            {line.account.code}
                          </span>
                          {line.account.name}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground">
                          {line.partner?.name || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                          {line.debit > 0
                            ? `₹${line.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-medium text-foreground">
                          {line.credit > 0
                            ? `₹${line.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-[#F9FAFB] font-bold text-xs">
                      <td colSpan={2} className="py-2.5 px-3 text-navy">
                        Total
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        ₹{entry.totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-foreground">
                        ₹{entry.totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
