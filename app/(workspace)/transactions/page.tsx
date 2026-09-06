import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TransactionPagination } from "./_components/transaction-pagination";
import { getJournalEntriesAction } from "@/app/actions/accounting.actions";
import { JournalEntryStatus, JournalEntrySource } from "@prisma/client";
import { TransactionFilters } from "./_components/transaction-filters";
import { TransactionsTable } from "./_components/transactions-table";

interface TransactionsPageProps {
  searchParams?: {
    search?: string;
    status?: string;
    source?: string;
    page?: string;
  };
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const page = parseInt(searchParams?.page || "1");
  const search = searchParams?.search || "";
  const statusFilter = searchParams?.status as JournalEntryStatus | undefined;
  const sourceFilter = searchParams?.source as JournalEntrySource | undefined;

  const result = await getJournalEntriesAction({
    search,
    status: statusFilter,
    source: sourceFilter,
    page,
    pageSize: 20,
  });

  if (!result.success || !result.data) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Financial Transactions"
          description="Journal entries ledger covering all accounting transactions."
        />
        <div className="rounded-xl border border-border bg-white p-8 text-center">
          <p className="text-sm text-destructive">{result.error || "Failed to load transactions"}</p>
        </div>
      </div>
    );
  }

  const { entries, pagination } = result.data;

  // Helper function to get document reference
  const getDocumentReference = (entry: typeof entries[0]) => {
    if (entry.vendorBill) {
      return {
        ref: entry.vendorBill.billNumber,
        party: entry.vendorBill.vendor.name,
        type: "Vendor Bill",
      };
    }
    if (entry.invoice) {
      return {
        ref: entry.invoice.invoiceNumber,
        party: entry.invoice.customer.name,
        type: "Customer Invoice",
      };
    }
    if (entry.billPayment) {
      return {
        ref: entry.billPayment.vendorBill.billNumber,
        party: entry.billPayment.vendorBill.vendor.name,
        type: "Bill Payment",
      };
    }
    if (entry.invoicePayment) {
      return {
        ref: entry.invoicePayment.invoice.invoiceNumber,
        party: entry.invoicePayment.invoice.customer.name,
        type: "Invoice Payment",
      };
    }
    return {
      ref: "Manual Entry",
      party: "-",
      type: "Manual",
    };
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Financial Transactions"
        description="Audited ledger entries covering customer invoicing, vendor bills, payments, and operational expenses."
        actions={
          <form action="/api/export/transactions" method="post">
            <Button
              type="submit"
              size="sm"
              className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm"
            >
              <Download className="h-4 w-4" />
              Export Ledger
            </Button>
          </form>
        }
      />

      {/* Filters */}
      <TransactionFilters />

      {/* Table */}
      <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
        {entries.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No journal entries found. {search && "Try adjusting your search filters."}
            </p>
          </div>
        ) : (
          <TransactionsTable
            entries={entries.map((entry) => {
              const docRef = getDocumentReference(entry);
              const isBalanced = Number(entry.totalDebit) === Number(entry.totalCredit);

              const serializedEntry = {
                id: entry.id,
                entryNumber: entry.entryNumber,
                accountingDate: entry.accountingDate.toISOString(),
                status: entry.status,
                totalDebit: Number(entry.totalDebit),
                totalCredit: Number(entry.totalCredit),
                journal: {
                  name: entry.journal.name,
                },
                lines: (entry.lines || []).map((line) => ({
                  id: line.id,
                  accountId: line.accountId,
                  partnerId: line.partnerId,
                  debit: Number(line.debit),
                  credit: Number(line.credit),
                  account: {
                    code: line.account.code,
                    name: line.account.name,
                  },
                  partner: line.partner ? { name: line.partner.name } : null,
                })),
              };

              return {
                entry: serializedEntry,
                docRef,
                isBalanced,
              };
            })}
          />
        )}
      </div>

      {pagination.totalPages > 1 && (
        <TransactionPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  );
}
