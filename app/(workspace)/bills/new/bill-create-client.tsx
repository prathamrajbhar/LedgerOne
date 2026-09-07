"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AiFileUploader } from "@/components/ai/ai-file-uploader";
import { parseVendorBillAction } from "@/app/actions/ai-document.actions";
import type { Contact, Product, AnalyticAccount } from "@prisma/client";
import { BillNewHeader } from "./components/bill-new-header";
import { BillCreateHeaderFields } from "../components/bill-create-header-fields";
import { BillCreateItemsTable } from "../components/bill-create-items-table";
import { BillCreateSummary } from "../components/bill-create-summary";
import { useBillCreateForm } from "../components/use-bill-create-form";

interface BillCreateClientProps {
  vendors: Contact[];
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  purchaseOrders: Array<{ id: string; poNumber: string; vendorId: string }>;
  analyticAccounts: AnalyticAccount[];
}

export function BillCreateClient({
  vendors,
  products,
  taxRates,
  purchaseOrders,
  analyticAccounts,
}: BillCreateClientProps) {
  const router = useRouter();

  const {
    formVendor,
    setFormVendor,
    formPurchaseOrder,
    setFormPurchaseOrder,
    formVendorBillNumber,
    setFormVendorBillNumber,
    formBillDate,
    setFormBillDate,
    formDueDate,
    setFormDueDate,
    formPaymentTerms,
    setFormPaymentTerms,
    formLines,
    submitting,
    handleAddLine,
    handleRemoveLine,
    handleLineChange,
    formCalculations,
    vendorOptions,
    purchaseOrderOptions,
    productOptions,
    handleAiParsedBill,
    handleSaveBill,
  } = useBillCreateForm({
    vendors,
    products,
    taxRates,
    purchaseOrders,
    analyticAccounts,
    onSuccess: () => {
      router.push("/bills");
      router.refresh();
    },
    onClose: () => {
      router.push("/bills");
    },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Top Header & Action Controls */}
      <BillNewHeader
        submitting={submitting}
        onSave={handleSaveBill}
        onCancel={() => router.push("/bills")}
      />

      {/* 2. AI Document OCR Dropzone */}
      <div className="bg-white p-5 border border-border rounded-xl shadow-2xs">
        <AiFileUploader
          onParsedData={handleAiParsedBill}
          parseAction={parseVendorBillAction}
          label="Auto-Fill Bill with AI Document Scan"
          description="Upload an image or PDF of a vendor invoice to extract items, vendor, amounts, and dates automatically"
        />
      </div>

      {/* 3. General Bill Information Fields */}
      <div className="bg-white p-5 border border-border rounded-xl shadow-2xs space-y-4">
        <div className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2.5">
          Bill Particulars & Vendor Information
        </div>
        <BillCreateHeaderFields
          formVendor={formVendor}
          setFormVendor={setFormVendor}
          formPurchaseOrder={formPurchaseOrder}
          setFormPurchaseOrder={setFormPurchaseOrder}
          formVendorBillNumber={formVendorBillNumber}
          setFormVendorBillNumber={setFormVendorBillNumber}
          formBillDate={formBillDate}
          setFormBillDate={setFormBillDate}
          formDueDate={formDueDate}
          setFormDueDate={setFormDueDate}
          formPaymentTerms={formPaymentTerms}
          setFormPaymentTerms={setFormPaymentTerms}
          vendorOptions={vendorOptions}
          purchaseOrderOptions={purchaseOrderOptions}
          purchaseOrders={purchaseOrders}
        />
      </div>

      {/* 4. Purchased Line Items Table */}
      <div className="bg-white p-5 border border-border rounded-xl shadow-2xs space-y-3">
        <BillCreateItemsTable
          formLines={formLines}
          productOptions={productOptions}
          taxRates={taxRates}
          onAddLine={handleAddLine}
          onRemoveLine={handleRemoveLine}
          onLineChange={handleLineChange}
        />
      </div>

      {/* 5. Summary & Financial Breakdown */}
      <div className="flex justify-end">
        <div className="w-full md:w-80">
          <BillCreateSummary
            subtotal={formCalculations.subtotal}
            totalDiscount={formCalculations.totalDiscount}
            cgst={formCalculations.cgst}
            sgst={formCalculations.sgst}
            roundOff={formCalculations.roundOff}
            grandTotal={formCalculations.grandTotal}
          />
        </div>
      </div>
    </div>
  );
}
