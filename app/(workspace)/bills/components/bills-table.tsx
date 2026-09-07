"use client";

import * as React from "react";
import { Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SortableTableHead, useTableSort } from "@/components/ui/sortable-table-head";
import { BillsTableRow } from "./bills-table-row";
import type { VendorBillWithRelations } from "../bills-types";

interface BillsTableProps {
  bills: VendorBillWithRelations[];
  getDisplayStatus: (bill: VendorBillWithRelations) => string;
  confirmingBillId: string | null;
  cancellingBillId: string | null;
  downloadingId: string | null;
  sendingReminderId: string | null;
  onOpenDetails: (bill: VendorBillWithRelations) => void;
  onConfirmBill: (billId: string) => void;
  onCancelBill: (billId: string) => void;
  onOpenPayment: (bill: VendorBillWithRelations) => void;
  onSendReminder: (billId: string) => void;
  onDownloadPDF: (bill: VendorBillWithRelations) => void;
  onOpenCreateModal: () => void;
}

type BillSortColumn =
  | "billNumber"
  | "vendor"
  | "billDate"
  | "dueDate"
  | "total"
  | "amountPaid"
  | "amountDue"
  | "status";

export function BillsTable({
  bills,
  getDisplayStatus,
  confirmingBillId,
  cancellingBillId,
  downloadingId,
  sendingReminderId,
  onOpenDetails,
  onConfirmBill,
  onCancelBill,
  onOpenPayment,
  onSendReminder,
  onDownloadPDF,
  onOpenCreateModal,
}: BillsTableProps) {
  const { sortedItems: sortedBills, sortState, handleSort } = useTableSort<
    VendorBillWithRelations,
    BillSortColumn
  >(bills, "billDate", "desc", {
    billNumber: (b) => b.billNumber,
    vendor: (b) => b.vendor?.name || "",
    billDate: (b) => new Date(b.billDate),
    dueDate: (b) => new Date(b.dueDate),
    total: (b) => Number(b.total),
    amountPaid: (b) => Number(b.amountPaid),
    amountDue: (b) => Number(b.amountDue),
    status: (b) => getDisplayStatus(b),
  });

  return (
    <Card className="border-border shadow-2xs overflow-hidden bg-white">
      {sortedBills.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy border border-navy/10 flex items-center justify-center mb-4 shadow-2xs">
            <Receipt className="w-7 h-7 text-navy" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-navy">No vendor bills yet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md">
            Add a vendor bill to start tracking your accounts payable.
          </p>
          <Button
            onClick={onOpenCreateModal}
            className="mt-5 h-9 px-4 bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Add Vendor Bill
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-border text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <SortableTableHead columnKey="billNumber" currentSort={sortState} onSort={handleSort}>
                  Bill #
                </SortableTableHead>
                <SortableTableHead columnKey="vendor" currentSort={sortState} onSort={handleSort}>
                  Vendor
                </SortableTableHead>
                <SortableTableHead columnKey="billDate" currentSort={sortState} onSort={handleSort}>
                  Bill Date
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
              {sortedBills.map((bill) => (
                <BillsTableRow
                  key={bill.id}
                  bill={bill}
                  displayStatus={getDisplayStatus(bill)}
                  confirmingBillId={confirmingBillId}
                  cancellingBillId={cancellingBillId}
                  downloadingId={downloadingId}
                  sendingReminderId={sendingReminderId}
                  onOpenDetails={onOpenDetails}
                  onConfirmBill={onConfirmBill}
                  onCancelBill={onCancelBill}
                  onOpenPayment={onOpenPayment}
                  onSendReminder={onSendReminder}
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
