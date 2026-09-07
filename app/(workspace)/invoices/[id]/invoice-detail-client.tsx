"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SerializedInvoiceData } from "./types";
import { useInvoiceDetail } from "./use-invoice-detail";
import { InvoiceHeader } from "./components/invoice-header";
import { InvoiceKpiStrip } from "./components/invoice-kpi-strip";
import { InvoiceCustomerInfo } from "./components/invoice-customer-info";
import { InvoiceLineItemsTable } from "./components/invoice-line-items-table";
import { InvoiceFinancialBreakdown } from "./components/invoice-financial-breakdown";
import { InvoiceAccountingEntry } from "./components/invoice-accounting-entry";
import { InvoiceAuditLogsTable } from "./components/invoice-audit-logs-table";

interface InvoiceDetailClientProps {
  initialInvoice: SerializedInvoiceData;
}

export function InvoiceDetailClient({ initialInvoice }: InvoiceDetailClientProps) {
  const router = useRouter();
  const {
    invoice,
    displayStatus,
    confirming,
    cancelling,
    downloading,
    sendingEmail,
    sendingReminder,
    handleConfirmInvoice,
    handleCancelInvoice,
    handleDownloadPDF,
    handleSendEmail,
    handleSendReminder,
  } = useInvoiceDetail(initialInvoice);

  const isConfirmed = invoice.status === "CONFIRMED";
  const hasDue = invoice.amountDue > 0;

  const navigateToRecordPayment = () => {
    router.push(`/payments/new?invoiceId=${invoice.id}&returnUrl=/invoices/${invoice.id}`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Top Header & Action Controls */}
      <InvoiceHeader
        invoice={invoice}
        displayStatus={displayStatus}
        downloading={downloading}
        confirming={confirming}
        cancelling={cancelling}
        sendingEmail={sendingEmail}
        sendingReminder={sendingReminder}
        onDownloadPDF={handleDownloadPDF}
        onPrint={() => window.print()}
        onConfirmInvoice={handleConfirmInvoice}
        onOpenPaymentModal={navigateToRecordPayment}
        onCancelInvoice={handleCancelInvoice}
        onSendEmail={handleSendEmail}
        onSendReminder={handleSendReminder}
      />

      {/* 2. Financial KPI Metrics Strip */}
      <InvoiceKpiStrip invoice={invoice} />

      {/* 3. Customer Profile & Invoice Meta */}
      <InvoiceCustomerInfo invoice={invoice} />

      {/* 4. Purchased Products & Furniture Lines */}
      <InvoiceLineItemsTable lines={invoice.lines} />

      {/* 5. Payments List & Financial Breakdown */}
      <InvoiceFinancialBreakdown
        total={invoice.total}
        amountPaid={invoice.amountPaid}
        amountDue={invoice.amountDue}
        hasDue={hasDue}
        isConfirmed={isConfirmed}
        payments={invoice.payments}
        onOpenPaymentModal={navigateToRecordPayment}
      />

      {/* 6. Accounting Double Entry Posting Audit */}
      <InvoiceAccountingEntry invoice={invoice} />

      {/* 7. Email & Dispatch Audit Trail */}
      <InvoiceAuditLogsTable emailLogs={invoice.emailLogs} />
    </div>
  );
}
