"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DocumentStatus } from "@prisma/client";
import { SerializedBillData } from "./types";
import { useBillDetail } from "./use-bill-detail";
import { BillHeader } from "./components/bill-header";
import { BillKpiStrip } from "./components/bill-kpi-strip";
import { BillVendorInfo } from "./components/bill-vendor-info";
import { BillLineItemsTable } from "./components/bill-line-items-table";
import { BillFinancialBreakdown } from "./components/bill-financial-breakdown";
import { BillAccountingEntry } from "./components/bill-accounting-entry";
import { BillAuditLogsTable } from "./components/bill-audit-logs-table";

interface BillDetailClientProps {
  initialBill: SerializedBillData;
}

export function BillDetailClient({ initialBill }: BillDetailClientProps) {
  const router = useRouter();
  const {
    bill,
    emailLogs,
    confirming,
    cancelling,
    downloading,
    sendingReminder,
    displayStatus,
    handleConfirmBill,
    handleCancelBill,
    handleDownloadPDF,
    handleSendReminder,
  } = useBillDetail(initialBill);

  const isConfirmed = bill.status === DocumentStatus.CONFIRMED;
  const hasDue = bill.amountDue > 0;

  const navigateToRecordPayment = () => {
    router.push(`/payments/new?billId=${bill.id}&returnUrl=/bills/${bill.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Top Header & Action Controls */}
      <BillHeader
        bill={bill}
        displayStatus={displayStatus}
        downloading={downloading}
        confirming={confirming}
        sendingReminder={sendingReminder}
        cancelling={cancelling}
        onDownloadPDF={handleDownloadPDF}
        onPrint={() => window.print()}
        onConfirmBill={handleConfirmBill}
        onSendReminder={handleSendReminder}
        onOpenPaymentModal={navigateToRecordPayment}
        onCancelBill={handleCancelBill}
      />

      {/* 2. Financial KPI Metrics Strip */}
      <BillKpiStrip bill={bill} />

      {/* 3. Vendor Profile & Bill Information */}
      <BillVendorInfo bill={bill} />

      {/* 4. Purchased Products & Material Lines */}
      <BillLineItemsTable lines={bill.lines} />

      {/* 5. Payments List & Financial Breakdown */}
      <BillFinancialBreakdown
        total={bill.total}
        amountPaid={bill.amountPaid}
        amountDue={bill.amountDue}
        hasDue={hasDue}
        isConfirmed={isConfirmed}
        payments={bill.payments}
        onOpenPaymentModal={navigateToRecordPayment}
      />

      {/* 6. Accounting Double Entry Posting */}
      <BillAccountingEntry />

      {/* 7. Historical Email Reminders Audit Log */}
      <BillAuditLogsTable emailLogs={emailLogs} />
    </div>
  );
}
