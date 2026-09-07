import { toast } from "sonner";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import type { VendorBillWithRelations, BillSummaryMetrics } from "../bills-types";

export function calculateBillSummaryMetrics(
  bills: VendorBillWithRelations[]
): BillSummaryMetrics {
  let totalCount = 0;
  let paidAmount = 0;
  let outstandingAmount = 0;
  let overdueAmount = 0;
  const today = new Date();

  bills.forEach((bill) => {
    if (bill.status === DocumentStatus.CANCELLED) return;
    totalCount += 1;
    const paid = Number(bill.amountPaid) || 0;
    const due = Number(bill.amountDue) || 0;
    paidAmount += paid;
    outstandingAmount += due;

    const isOverdue =
      due > 0 &&
      new Date(bill.dueDate) < today &&
      bill.paymentStatus !== PaymentStatus.PAID;
    if (isOverdue) overdueAmount += due;
  });

  return { totalCount, paidAmount, outstandingAmount, overdueAmount };
}

export function getVendorBillDisplayStatus(
  bill: VendorBillWithRelations
): string {
  if (bill.status === DocumentStatus.DRAFT) return "DRAFT";
  if (bill.status === DocumentStatus.CANCELLED) return "CANCELLED";
  if (bill.paymentStatus === PaymentStatus.PAID) return "PAID";
  if (bill.paymentStatus === PaymentStatus.PARTIAL) return "PARTIAL";
  const today = new Date();
  const due = new Date(bill.dueDate);
  if (due < today && bill.paymentStatus === PaymentStatus.NOT_PAID) return "OVERDUE";
  return "PENDING";
}

export function filterVendorBills(
  bills: VendorBillWithRelations[],
  search: string,
  vendorFilter: string,
  statusFilter: string,
  paymentStatusFilter: string,
  dateRangeFilter: { start: string; end: string }
): VendorBillWithRelations[] {
  return bills.filter((bill) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      bill.billNumber.toLowerCase().includes(q) ||
      bill.vendor?.name.toLowerCase().includes(q) ||
      (bill.purchaseOrder?.poNumber &&
        bill.purchaseOrder.poNumber.toLowerCase().includes(q));

    const matchesVendor = vendorFilter === "ALL" || bill.vendorId === vendorFilter;
    const displayStatus = getVendorBillDisplayStatus(bill);
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OVERDUE" && displayStatus === "OVERDUE") ||
      bill.status === statusFilter;
    const matchesPayment =
      paymentStatusFilter === "ALL" || bill.paymentStatus === paymentStatusFilter;

    let matchesDate = true;
    if (dateRangeFilter.start) {
      matchesDate = matchesDate && new Date(bill.billDate) >= new Date(dateRangeFilter.start);
    }
    if (dateRangeFilter.end) {
      matchesDate = matchesDate && new Date(bill.billDate) <= new Date(dateRangeFilter.end);
    }

    return matchesSearch && matchesVendor && matchesStatus && matchesPayment && matchesDate;
  });
}

export async function downloadVendorBillPDF(
  bill: VendorBillWithRelations
): Promise<void> {
  const response = await fetch(`/api/bills/${bill.id}/download`);
  if (!response.ok) {
    throw new Error("Failed to generate PDF for this vendor bill");
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `VendorBill-${bill.billNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  toast.success(`Downloaded VendorBill-${bill.billNumber}.pdf`);
}
