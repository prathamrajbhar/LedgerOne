"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  createStandaloneBillAction,
  confirmBillAction,
} from "@/app/actions/purchase.actions";
import type { ParsedVendorBillResult } from "@/lib/services/ai-document-parser.service";
import type { FormBillLineRow, VendorBillWithRelations } from "../bills-types";
import type { Contact, Product, AnalyticAccount } from "@prisma/client";

interface UseBillCreateFormParams {
  vendors: Contact[];
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  purchaseOrders: Array<{ id: string; poNumber: string; vendorId: string }>;
  analyticAccounts: AnalyticAccount[];
  onSuccess: () => void;
  onClose: () => void;
}

export function useBillCreateForm({
  vendors,
  products,
  taxRates,
  purchaseOrders,
  analyticAccounts,
  onSuccess,
  onClose,
}: UseBillCreateFormParams) {
  const [formVendor, setFormVendor] = React.useState("");
  const [formPurchaseOrder, setFormPurchaseOrder] = React.useState("");
  const [formVendorBillNumber, setFormVendorBillNumber] = React.useState("");
  const [formBillDate, setFormBillDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [formDueDate, setFormDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formPaymentTerms, setFormPaymentTerms] = React.useState("NET_30");
  const [submitting, setSubmitting] = React.useState(false);

  const [formLines, setFormLines] = React.useState<FormBillLineRow[]>([
    {
      productId: "",
      analyticAccountId: "",
      description: "",
      quantity: 1,
      unit: "pcs",
      unitCost: "",
      taxRateId: "",
      discountPercent: 0,
    },
  ]);

  const handleAddLine = () => {
    setFormLines((prev) => [
      ...prev,
      {
        productId: "",
        analyticAccountId: "",
        description: "",
        quantity: 1,
        unit: "pcs",
        unitCost: "",
        taxRateId: "",
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (formLines.length <= 1) {
      toast.error("A bill must have at least one line item");
      return;
    }
    setFormLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleLineChange = (idx: number, field: keyof FormBillLineRow, value: string | number) => {
    setFormLines((prev) => {
      const updated = [...prev];
      const target = { ...updated[idx] };

      if (field === "productId") {
        target.productId = String(value);
        const selectedProduct = products.find((p) => p.id === value);
        if (selectedProduct) {
          target.unitCost = Number(selectedProduct.cost);
          target.description = selectedProduct.name;
        }
      } else if (field === "quantity" || field === "unitCost" || field === "discountPercent") {
        target[field] = value === "" ? "" : Number(value);
      } else {
        target[field] = value as never;
      }

      updated[idx] = target;
      return updated;
    });
  };

  const formCalculations = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    formLines.forEach((line) => {
      const qty = Number(line.quantity) || 0;
      const cost = Number(line.unitCost) || 0;
      const discPercent = Number(line.discountPercent) || 0;
      const baseAmount = qty * cost;
      const discountAmt = (baseAmount * discPercent) / 100;
      const lineTaxable = Math.max(0, baseAmount - discountAmt);

      const taxRate = taxRates.find((t) => t.id === line.taxRateId);
      const taxPercent = taxRate ? taxRate.percentage : 0;
      const taxAmt = (lineTaxable * taxPercent) / 100;

      subtotal += baseAmount;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const preRound = subtotal - totalDiscount + totalTax;
    const grandTotal = Math.round(preRound * 100) / 100;
    const roundOff = Math.round((Math.round(grandTotal) - grandTotal) * 100) / 100;
    const finalGrandTotal = Math.max(0, grandTotal + roundOff);

    return { subtotal, totalDiscount, totalTax, cgst, sgst, roundOff, grandTotal: finalGrandTotal };
  }, [formLines, taxRates]);

  const vendorOptions = React.useMemo(() => {
    return vendors.map((v) => ({
      value: v.id,
      label: v.name,
      subLabel: [v.email, v.phone].filter(Boolean).join(" • ") || undefined,
    }));
  }, [vendors]);

  const purchaseOrderOptions = React.useMemo(() => {
    const filtered = purchaseOrders.filter((po) => !formVendor || po.vendorId === formVendor);
    return [
      { value: "", label: "Direct Bill (No PO)" },
      ...filtered.map((po) => ({ value: po.id, label: po.poNumber })),
    ];
  }, [purchaseOrders, formVendor]);

  const handlePurchaseOrderChange = (poId: string) => {
    setFormPurchaseOrder(poId);
    if (!poId) return;

    const selectedPo = (purchaseOrders as Array<{
      id: string;
      poNumber: string;
      vendorId: string;
      lines?: Array<{
        productId: string;
        quantity: number | string;
        unitPrice: number | string;
        analyticAccountId?: string;
      }>;
    }>).find((po) => po.id === poId || po.poNumber === poId);

    if (selectedPo) {
      if (selectedPo.vendorId) {
        setFormVendor(selectedPo.vendorId);
      }
      if (selectedPo.lines && selectedPo.lines.length > 0) {
        const linesFromPo: FormBillLineRow[] = selectedPo.lines.map((l) => {
          const prod = products.find((p) => p.id === l.productId);
          return {
            productId: l.productId,
            analyticAccountId: l.analyticAccountId || analyticAccounts[0]?.id || "",
            description: prod?.name || "PO Item",
            quantity: Number(l.quantity) || 1,
            unit: "pcs",
            unitCost: Number(l.unitPrice) || 0,
            taxRateId: "",
            discountPercent: 0,
          };
        });
        setFormLines(linesFromPo);
        toast.info(`Imported ${linesFromPo.length} item(s) from PO #${selectedPo.poNumber}`);
      }
    }
  };

  const productOptions = React.useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.name,
      subLabel: [
        p.sku ? `SKU: ${p.sku}` : null,
        p.cost ? `Cost: ₹${Number(p.cost).toLocaleString("en-IN")}` : null,
      ].filter(Boolean).join(" • ") || undefined,
    }));
  }, [products]);

  const handleAiParsedBill = (raw: unknown) => {
    const parsed = raw as ParsedVendorBillResult;
    if (!parsed) return;

    if (parsed.vendorName) {
      const match = vendors.find(
        (v) =>
          v.name.toLowerCase().includes(parsed.vendorName!.toLowerCase()) ||
          parsed.vendorName!.toLowerCase().includes(v.name.toLowerCase())
      );
      if (match) {
        setFormVendor(match.id);
        toast.success(`Matched vendor: ${match.name}`);
      }
    }
    if (parsed.billNumber) setFormVendorBillNumber(parsed.billNumber);
    if (parsed.billDate) setFormBillDate(parsed.billDate);
    if (parsed.dueDate) setFormDueDate(parsed.dueDate);

    if (parsed.lines && parsed.lines.length > 0) {
      const newLines: FormBillLineRow[] = parsed.lines.map((aiLine) => {
        let matchedProductId = aiLine.productId || "";
        let matchedUnitCost: number | "" = aiLine.unitPrice > 0 ? aiLine.unitPrice : 0;
        let matchedDesc = aiLine.productName || "";

        if (!matchedProductId && products.length > 0) {
          const pMatch = products.find(
            (p) =>
              p.name.toLowerCase().includes(aiLine.productName.toLowerCase()) ||
              aiLine.productName.toLowerCase().includes(p.name.toLowerCase())
          );
          if (pMatch) {
            matchedProductId = pMatch.id;
            matchedDesc = pMatch.name;
            if (matchedUnitCost === 0 && pMatch.cost) {
              matchedUnitCost = Number(pMatch.cost);
            }
          }
        }

        return {
          productId: matchedProductId,
          analyticAccountId: aiLine.analyticAccountId || analyticAccounts[0]?.id || "",
          description: matchedDesc,
          quantity: aiLine.quantity > 0 ? aiLine.quantity : 1,
          unit: "pcs",
          unitCost: matchedUnitCost,
          taxRateId: taxRates[0]?.id || "",
          discountPercent: 0,
        };
      });
      setFormLines(newLines);
      toast.success(`Populated ${newLines.length} line items from AI scan`);
    }
  };

  const handleSaveBill = async (asDraft = false) => {
    if (!formVendor) {
      toast.error("Please select a vendor");
      return;
    }

    const validLines = formLines.filter(
      (l) => l.productId && Number(l.quantity) > 0 && Number(l.unitCost) >= 0
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one complete material/product item with unit cost and quantity");
      return;
    }

    setSubmitting(true);
    try {
      const defaultAnalyticId = analyticAccounts[0]?.id;
      if (!defaultAnalyticId) {
        toast.error("No analytic account found. Please create one first.");
        setSubmitting(false);
        return;
      }

      const res = await createStandaloneBillAction({
        vendorId: formVendor,
        purchaseOrderId: formPurchaseOrder || undefined,
        billDate: new Date(formBillDate),
        dueDate: new Date(formDueDate),
        billNumber: formVendorBillNumber || undefined,
        lines: validLines.map((line) => {
          const qty = Number(line.quantity);
          const rawCost = Number(line.unitCost);
          const disc = Number(line.discountPercent) || 0;
          const effectiveUnitCost = disc > 0 ? rawCost * (1 - disc / 100) : rawCost;

          return {
            productId: line.productId,
            analyticAccountId: line.analyticAccountId || defaultAnalyticId,
            quantity: qty,
            unitPrice: effectiveUnitCost,
          };
        }),
      });

      if (!res.success || !res.data) {
        toast.error(res.error || "Failed to create vendor bill");
        return;
      }

      const createdBill = res.data as unknown as VendorBillWithRelations;

      if (!asDraft) {
        const confirmRes = await confirmBillAction(createdBill.id);
        if (confirmRes.success) {
          toast.success(
            `Vendor Bill #${createdBill.billNumber} posted & Accounts Payable updated!`
          );
        } else {
          toast.warning("Bill created as Draft, but could not be auto-confirmed.");
        }
      } else {
        toast.success(`Draft Vendor Bill #${createdBill.billNumber} saved successfully`);
      }

      onClose();
      onSuccess();
    } catch {
      toast.error("Unexpected error saving vendor bill");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formVendor,
    setFormVendor,
    formPurchaseOrder,
    setFormPurchaseOrder: handlePurchaseOrderChange,
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
  };
}
