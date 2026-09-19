import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Layers, DollarSign, ArrowUpRight } from "lucide-react";

export default async function JournalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const journal = await prisma.journal.findUnique({
    where: { id: params.id },
    include: {
      defaultAccount: true,
      journalEntries: {
        take: 20,
        orderBy: { accountingDate: "desc" },
      },
    },
  });

  if (!journal) {
    notFound();
  }

  let totalDebitVolume = 0;
  let totalCreditVolume = 0;
  journal.journalEntries.forEach((e) => {
    totalDebitVolume += Number(e.totalDebit);
    totalCreditVolume += Number(e.totalCredit);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="space-y-3">
        <Link
          href="/journals"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Journals
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-navy">
                {journal.name} ({journal.code})
              </h1>
              <Badge variant="outline" className="text-xs bg-[#F6F7F9]">
                {journal.type}
              </Badge>
              <Badge variant="success" className="text-xs">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Default Posting Account:{" "}
              <Link href={`/accounts/${journal.defaultAccount.id}`} className="font-semibold text-navy hover:underline">
                {journal.defaultAccount.code} - {journal.defaultAccount.name}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10 text-navy flex-shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Total Entries Recorded</span>
            <span className="text-lg font-bold text-foreground">{journal.journalEntries.length} entries</span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10 text-teal flex-shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Debit Activity</span>
            <span className="text-lg font-bold text-foreground">
              ₹{totalDebitVolume.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-card flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF5FC] text-[#3478B9] flex-shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground font-medium block">Credit Activity</span>
            <span className="text-lg font-bold text-foreground">
              ₹{totalCreditVolume.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
      </div>

      {/* Recent Entries Table */}
      <Card className="p-5 bg-white shadow-card space-y-3">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Journal Entries</h3>
            <p className="text-xs text-muted-foreground">
              Audit log of transactions posted into this journal book.
            </p>
          </div>
        </div>

        {journal.journalEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No entries have been posted to this journal yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-muted-foreground uppercase text-[10px] font-semibold border-b border-border bg-[#F9FAFB]">
                  <th className="py-2.5 px-3">Entry #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {journal.journalEntries.map((e) => (
                  <tr key={e.id} className="hover:bg-primary-light/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-navy">{e.entryNumber}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {new Date(e.accountingDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">{e.source}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{Number(e.totalDebit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ₹{Number(e.totalCredit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge variant={e.status === "POSTED" ? "success" : "secondary"} className="text-[10px]">
                        {e.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Link
                        href={`/journal-entries/${e.id}`}
                        className="inline-flex items-center gap-1 text-xs text-navy font-semibold hover:underline"
                      >
                        View <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
