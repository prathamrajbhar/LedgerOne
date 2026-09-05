"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, FileText, User, Filter } from "lucide-react";
import { getGeneralLedgerAction, getAccountBalanceAction } from "@/app/actions/general-ledger.actions";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { AccountType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GeneralLedgerLine {
  id: string;
  date: Date;
  entryNumber: string;
  entryId: string;
  partner?: {
    id: string;
    name: string;
  };
  debit: number;
  credit: number;
  balance: number;
  status: string;
  journalName: string;
  journalCode: string;
}

interface AccountInfo {
  id: string;
  code: string;
  name: string;
  type: AccountType;
}

export default function GeneralLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [account, setAccount] = React.useState<AccountInfo | null>(null);
  const [lines, setLines] = React.useState<GeneralLedgerLine[]>([]);
  const [summary, setSummary] = React.useState({
    totalDebit: 0,
    totalCredit: 0,
    balance: 0,
    lineCount: 0,
  });
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "POSTED" | "DRAFT">("ALL");

  const loadLedger = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGeneralLedgerAction({
        accountId,
        status: statusFilter === "ALL" ? undefined : statusFilter,
      });

      if (result.success && result.data) {
        const data = result.data as any;
        setAccount(data.account);
        setLines(data.lines);
        setSummary(data.summary);
      } else {
        toast.error(result.error || "Failed to load general ledger");
      }
    } catch (error) {
      toast.error("Failed to load general ledger");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [accountId, statusFilter]);

  React.useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const getStatusBadge = (status: string) => {
    if (status === "POSTED") {
      return <Badge variant="success">Posted</Badge>;
    }
    return <Badge variant="muted">Draft</Badge>;
  };

  const getTypeBadge = (type: AccountType) => {
    switch (type) {
      case "ASSET":
      case "BANK":
      case "CASH":
        return <Badge variant="default">{type}</Badge>;
      case "INCOME":
        return <Badge variant="success">{type}</Badge>;
      case "EXPENSES":
      case "OTHER_EXPENSES":
        return <Badge variant="warning">{type}</Badge>;
      case "LIABILITY":
      case "CAPITAL":
        return <Badge variant="secondary">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 mb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/accounts")}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="text-sm text-muted-foreground font-normal mb-1">General Ledger</div>
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-foreground">
              {account ? `${account.code} - ${account.name}` : "Loading..."}
            </div>
            {account && getTypeBadge(account.type)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {account && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-4 shadow-card">
            <div className="text-xs text-muted-foreground font-medium mb-1">Total Debit</div>
            <div className="text-2xl font-bold text-navy">
              {formatCurrency(summary.totalDebit)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-card">
            <div className="text-xs text-muted-foreground font-medium mb-1">Total Credit</div>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(summary.totalCredit)}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 shadow-card">
            <div className="text-xs text-muted-foreground font-medium mb-1">Current Balance</div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(summary.balance)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {summary.lineCount} Transaction{summary.lineCount !== 1 ? "s" : ""}
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val) => setStatusFilter(val as "ALL" | "POSTED" | "DRAFT")}
        >
          <SelectTrigger className="h-9 w-[140px] text-xs bg-white border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Entries</SelectItem>
            <SelectItem value="POSTED">Posted Only</SelectItem>
            <SelectItem value="DRAFT">Draft Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <p className="text-sm text-muted-foreground">Loading general ledger...</p>
        </div>
      ) : lines.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-8 text-center shadow-card">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            No transactions found for this account
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Entry #</th>
                  <th className="py-3.5 px-4">Journal</th>
                  <th className="py-3.5 px-4">Partner</th>
                  <th className="py-3.5 px-4 text-right">Debit</th>
                  <th className="py-3.5 px-4 text-right">Credit</th>
                  <th className="py-3.5 px-4 text-right">Balance</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {lines.map((line) => (
                  <tr
                    key={line.id}
                    className="hover:bg-primary-light/30 transition-colors cursor-pointer"
                    onClick={() => router.push(`/journal-entries?entry=${line.entryId}`)}
                  >
                    <td className="py-3.5 px-4 text-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(line.date)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-navy">
                      {line.entryNumber}
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      <div>
                        <div className="font-semibold">{line.journalCode}</div>
                        <div className="text-[10px] text-muted-foreground">{line.journalName}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-foreground">
                      {line.partner ? (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {line.partner.name}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-navy">
                      {line.debit > 0 ? formatCurrency(line.debit) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                      {line.credit > 0 ? formatCurrency(line.credit) : "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-foreground">
                      {formatCurrency(line.balance)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(line.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-[#F9FAFB]">
                <tr className="text-xs font-bold">
                  <td colSpan={4} className="py-3.5 px-4 text-foreground">
                    TOTAL
                  </td>
                  <td className="py-3.5 px-4 text-right text-navy">
                    {formatCurrency(summary.totalDebit)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-600">
                    {formatCurrency(summary.totalCredit)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-foreground">
                    {formatCurrency(summary.balance)}
                  </td>
                  <td className="py-3.5 px-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
