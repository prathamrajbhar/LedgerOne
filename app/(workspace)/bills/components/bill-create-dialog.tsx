"use client";

import * as React from "react";
import { Receipt, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AiFileUploader } from "@/components/ai/ai-file-uploader";
import { parseVendorBillAction } from "@/app/actions/ai-document.actions";
import type { Contact, Product, AnalyticAccount } from "@prisma/client";
import { BillCreateHeaderFields } from "./bill-create-header-fields";
import { BillCreateItemsTable } from "./bill-create-items-table";
import { BillCreateSummary } from "./bill-create-summary";
import { useBillCreateForm } from "./use-bill-create-form";

interface BillCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendors: Contact[];
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  purchaseOrders: Array<{ id: string; poNumber: string; vendorId: string }>;
  analyticAccounts: AnalyticAccount[];
  onSuccess: () => void;
}

export function BillCreateDialog({
  open,
  onOpenChange,
  vendors,
  products,
  taxRates,
  purchaseOrders,
  analyticAccounts,
  onSuccess,
}: BillCreateDialogProps) {
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
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl border border-border shadow-2xl bg-[#F8FAFC]">
        <div className="bg-white px-6 py-5 border-b border-border sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-light text-teal flex items-center justify-center border border-teal/15 flex-shrink-0">
              <Receipt className="h-5 w-5 text-teal" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-navy">Record Vendor Bill</DialogTitle>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-light text-teal border border-teal/20">
                  Accounts Payable
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Record materials and furniture goods procurement invoices received from registered suppliers.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <AiFileUploader
            onParsedData={handleAiParsedBill}
            parseAction={parseVendorBillAction}
            label="Auto-Fill Bill with AI Document Scan"
            description="Drop vendor invoice PDF or bill photo to auto-detect supplier, dates, bill number, and line items"
          />

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

          <BillCreateItemsTable
            formLines={formLines}
            productOptions={productOptions}
            taxRates={taxRates}
            onAddLine={handleAddLine}
            onRemoveLine={handleRemoveLine}
            onLineChange={handleLineChange}
          />

          <BillCreateSummary
            subtotal={formCalculations.subtotal}
            totalDiscount={formCalculations.totalDiscount}
            cgst={formCalculations.cgst}
            sgst={formCalculations.sgst}
            roundOff={formCalculations.roundOff}
            grandTotal={formCalculations.grandTotal}
          />
        </div>

        <div className="bg-white px-6 py-4 border-t border-border sticky bottom-0 z-10 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="h-9 px-4 text-xs font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSaveBill(true)}
            disabled={submitting}
            className="h-9 px-4 text-xs text-navy font-semibold hover:bg-slate-200/70 cursor-pointer"
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleSaveBill(false)}
            disabled={submitting}
            className="h-9 px-5 text-xs bg-navy hover:bg-navy/90 text-white font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Posting Bill...
              </>
            ) : (
              <>
                <Receipt className="w-3.5 h-3.5" />
                Post Bill & Update AP
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
