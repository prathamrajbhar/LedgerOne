"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { Contact, Product } from "@prisma/client";
import { useInvoiceCreateForm } from "../components/use-invoice-create-form";
import { InvoiceNewHeader } from "./components/invoice-new-header";
import { InvoiceNewMetaFields } from "./components/invoice-new-meta-fields";
import { InvoiceCreateItemsTable } from "../components/invoice-create-items-table";
import { InvoiceNewSummaryCard } from "./components/invoice-new-summary-card";

interface InvoiceCreateClientProps {
  customers: Contact[];
  salesOrders: Array<{ id: string; soNumber: string; customerId: string }>;
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
}

export function InvoiceCreateClient({
  customers,
  salesOrders,
  products,
  taxRates,
}: InvoiceCreateClientProps) {
  const router = useRouter();

  const {
    formCustomer,
    setFormCustomer,
    formSalesOrder,
    setFormSalesOrder,
    formInvoiceDate,
    setFormInvoiceDate,
    formDueDate,
    setFormDueDate,
    formNotes,
    setFormNotes,
    creating,
    formLines,
    customerOptions,
    salesOrderOptions,
    productOptions,
    handleAddLine,
    handleRemoveLine,
    handleLineChange,
    formCalculations,
    handleSaveInvoice,
  } = useInvoiceCreateForm({
    customers,
    salesOrders,
    products,
    taxRates,
    onSuccess: () => {
      router.push("/invoices");
      router.refresh();
    },
    onClose: () => {
      router.push("/invoices");
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Header with Breadcrumb and Actions */}
      <InvoiceNewHeader
        creating={creating}
        onSave={() => handleSaveInvoice(false)}
        onCancel={() => router.push("/invoices")}
      />

      {/* 2. Metadata: Customer, SO, Dates, Notes */}
      <InvoiceNewMetaFields
        formCustomer={formCustomer}
        onCustomerChange={setFormCustomer}
        customerOptions={customerOptions}
        formSalesOrder={formSalesOrder}
        onSalesOrderChange={setFormSalesOrder}
        salesOrderOptions={salesOrderOptions}
        formInvoiceDate={formInvoiceDate}
        onInvoiceDateChange={setFormInvoiceDate}
        formDueDate={formDueDate}
        onDueDateChange={setFormDueDate}
        formNotes={formNotes}
        onNotesChange={setFormNotes}
      />

      {/* 3. Items Data Table */}
      <div className="bg-white p-5 border border-border rounded-xl shadow-2xs space-y-3">
        <InvoiceCreateItemsTable
          formLines={formLines}
          productOptions={productOptions}
          taxRates={taxRates}
          onAddLine={handleAddLine}
          onRemoveLine={handleRemoveLine}
          onLineChange={handleLineChange}
        />
      </div>

      {/* 4. Financial Summary Calculation */}
      <InvoiceNewSummaryCard calculations={formCalculations} />
    </div>
  );
}
