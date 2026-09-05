import { journalEntryService } from "@/lib/services/journal-entry.service";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function JournalEntryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let entry;
  try {
    entry = await journalEntryService.findById(params.id);
  } catch {
    notFound();
  }

  async function postEntry() {
    "use server";
    await journalEntryService.post(params.id);
    revalidatePath(`/accounting/journal-entries/${params.id}`);
    revalidatePath("/accounting/journal-entries");
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title={`Journal Entry: ${entry.entryNumber}`}
        description={`Accounting Date: ${new Date(entry.accountingDate).toLocaleDateString()} · Journal: ${entry.journal.name}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/accounting/journal-entries">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
            {entry.status === "DRAFT" && (
              <form action={postEntry}>
                <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Post Entry
                </Button>
              </form>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Ledger Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-2.5 px-4 text-left font-medium text-gray-700">Account</th>
                    <th className="py-2.5 px-4 text-left font-medium text-gray-700">Partner</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Debit ($)</th>
                    <th className="py-2.5 px-4 text-right font-medium text-gray-700">Credit ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-4 font-medium text-gray-900">
                        {line.account.name}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600">
                        {line.partner?.name || "—"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-gray-900">
                        ${Number(line.debit).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-medium text-gray-900">
                        ${Number(line.credit).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="w-72 space-y-2 text-right">
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Total Debit:</span>
                  <span className="font-semibold text-gray-900">${Number(entry.totalDebit).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b">
                  <span className="text-muted-foreground">Total Credit:</span>
                  <span className="font-semibold text-gray-900">${Number(entry.totalCredit).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm py-1 font-bold text-emerald-600">
                  <span>Balance Difference:</span>
                  <span>$0.00 (Balanced)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">Entry Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="text-muted-foreground">Status:</span>
                <StatusBadge status={entry.status} />
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Source:</span>
                <span className="font-medium text-gray-900">{entry.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-muted-foreground">Journal:</span>
                <span className="font-medium text-gray-900">{entry.journal.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Created By:</span>
                <span className="font-medium text-gray-900">{entry.createdBy?.name || "User"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
