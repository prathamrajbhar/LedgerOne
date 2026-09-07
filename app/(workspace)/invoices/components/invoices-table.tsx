"use client";

import * as React from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { InvoicesTableRow } from "./invoices-table-row";
import type { InvoiceWithRelations } from "../invoices-types";

interface InvoicesTableProps {
  invoices: InvoiceWithRelations[];
  getDisplayStatus: (inv: InvoiceWithRelations) => string;
  confirmingInvoiceId: string | null;
  downloadingId: string | null;
  onViewInvoice: (invoice: InvoiceWithRelations) => void;
  onConfirmInvoice: (invoiceId: string) => void;
  onOpenPayment: (invoice: InvoiceWithRelations) => void;
  onDownloadPDF: (invoice: InvoiceWithRelations) => void;
  onOpenCreateModal: () => void;
}

type InvoiceSortColumn =
  | "invoiceNumber"
  | "customer"
  | "invoiceDate"
  | "dueDate"
  | "total"
  | "amountPaid"
  | "amountDue"
  | "status";

export function InvoicesTable({
  invoices,
  getDisplayStatus,
  confirmingInvoiceId,
  downloadingId,
  onViewInvoice,
  onConfirmInvoice,
  onOpenPayment,
  onDownloadPDF,
  onOpenCreateModal,
}: InvoicesTableProps) {
  const { sortedItems: sortedInvoices, sortState, handleSort } = useTableSort<
    InvoiceWithRelations,
    InvoiceSortColumn
  >(invoices, "invoiceDate", "desc", {
    invoiceNumber: (i) => i.invoiceNumber,
    customer: (i) => i.customer?.name || "",
    invoiceDate: (i) => new Date(i.invoiceDate),
    dueDate: (i) => new Date(i.dueDate),
    total: (i) => Number(i.total),
    amountPaid: (i) => Number(i.amountPaid),
    amountDue: (i) => Number(i.amountDue),
    status: (i) => getDisplayStatus(i),
  });

  return (
    <Card className="border-border shadow-2xs overflow-hidden bg-white">
      {sortedInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy border border-navy/10 flex items-center justify-center mb-4 shadow-2xs">
            <Receipt className="w-7 h-7 text-navy" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-navy">No customer invoices yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
            Create your first invoice to start tracking customer receivables.
          </p>
          <Button
            onClick={onOpenCreateModal}
            className="mt-5 h-9 px-4 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <SortableTableHead columnKey="invoiceNumber" currentSort={sortState} onSort={handleSort}>
                  Invoice #
                </SortableTableHead>
                <SortableTableHead columnKey="customer" currentSort={sortState} onSort={handleSort}>
                  Customer
                </SortableTableHead>
                <SortableTableHead columnKey="invoiceDate" currentSort={sortState} onSort={handleSort}>
                  Invoice Date
                </SortableTableHead>
                <SortableTableHead columnKey="dueDate" currentSort={sortState} onSort={handleSort}>
                  Due Date
                </SortableTableHead>
                <SortableTableHead columnKey="total" currentSort={sortState} onSort={handleSort} align="right">
                  Amount
                </SortableTableHead>
                <SortableTableHead columnKey="amountPaid" currentSort={sortState} onSort={handleSort} align="right">
                  Paid
                </SortableTableHead>
                <SortableTableHead columnKey="amountDue" currentSort={sortState} onSort={handleSort} align="right">
                  Balance
                </SortableTableHead>
                <SortableTableHead columnKey="status" currentSort={sortState} onSort={handleSort} align="center">
                  Status
                </SortableTableHead>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {sortedInvoices.map((inv) => (
                <InvoicesTableRow
                  key={inv.id}
                  invoice={inv}
                  displayStatus={getDisplayStatus(inv)}
                  confirmingInvoiceId={confirmingInvoiceId}
                  downloadingId={downloadingId}
                  onViewInvoice={onViewInvoice}
                  onConfirmInvoice={onConfirmInvoice}
                  onOpenPayment={onOpenPayment}
                  onDownloadPDF={onDownloadPDF}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
