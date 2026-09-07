"use client";

import * as React from "react";
import { toast } from "sonner";
import { createStandaloneInvoiceAction } from "@/app/actions/sales.actions";
import type { FormLineRow } from "../invoices-types";
import type { Contact, Product } from "@prisma/client";

interface UseInvoiceCreateFormParams {
  customers: Contact[];
  salesOrders: Array<{ id: string; soNumber: string; customerId: string }>;
  products: Product[];
  taxRates: Array<{ id: string; name: string; percentage: number }>;
  onSuccess: () => void;
  onClose: () => void;
}

export function useInvoiceCreateForm({
  customers,
  salesOrders,
  products,
  taxRates,
  onSuccess,
  onClose,
}: UseInvoiceCreateFormParams) {
  const [formCustomer, setFormCustomer] = React.useState("");
  const [formSalesOrder, setFormSalesOrder] = React.useState("");
  const [formInvoiceDate, setFormInvoiceDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [formDueDate, setFormDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [formPaymentTerms, setFormPaymentTerms] = React.useState("NET_30");
  const [formNotes, setFormNotes] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  const [formLines, setFormLines] = React.useState<FormLineRow[]>([
    {
      productId: "",
      description: "",
      quantity: 1,
      unitPrice: "",
      taxRateId: taxRates[0]?.id || "",
      discountPercent: 0,
    },
  ]);

  const customerOptions = React.useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: c.name,
      subLabel: c.phone || c.email || undefined,
    }));
  }, [customers]);

  const salesOrderOptions = React.useMemo(() => {
    const availableOrders = salesOrders.filter(
      (so) => !formCustomer || so.customerId === formCustomer
    );
    return [
      { value: "", label: "Direct Invoice (No Sales Order)" },
      ...availableOrders.map((so) => ({
        value: so.soNumber,
        label: so.soNumber,
      })),
    ];
  }, [salesOrders, formCustomer]);

  const productOptions = React.useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.name,
      subLabel: p.sku
        ? `SKU: ${p.sku} • ₹${Number(p.salesPrice || 0).toLocaleString("en-IN")}`
        : `₹${Number(p.salesPrice || 0).toLocaleString("en-IN")}`,
    }));
  }, [products]);

  const handleAddLine = () => {
    setFormLines((prev) => [
      ...prev,
      {
        productId: "",
        description: "",
        quantity: 1,
        unitPrice: "",
        taxRateId: taxRates[0]?.id || "",
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (formLines.length === 1) {
      toast.error("An invoice requires at least one product row");
      return;
    }
    setFormLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index: number, field: keyof FormLineRow, value: unknown) => {
    setFormLines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === "productId") {
        const selProd = products.find((p) => p.id === value);
        if (selProd) {
          current.description = selProd.name;
          current.unitPrice = Number(selProd.salesPrice) || 0;
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  const formCalculations = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    formLines.forEach((line) => {
      const qty = Number(line.quantity) || 0;
      const price = Number(line.unitPrice) || 0;
      const discountPct = Number(line.discountPercent) || 0;

      const baseAmount = qty * price;
      const discountAmt = (baseAmount * discountPct) / 100;
      const discountedAmount = Math.max(0, baseAmount - discountAmt);

      const taxRateObj = taxRates.find((t) => t.id === line.taxRateId);
      const taxRate = taxRateObj ? Number(taxRateObj.percentage) : 0;
      const taxAmt = (discountedAmount * taxRate) / 100;

      subtotal += baseAmount;
      totalDiscount += discountAmt;
      totalTax += taxAmt;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

    return {
      subtotal,
      totalDiscount,
      totalTax,
      cgst,
      sgst,
      grandTotal,
    };
  }, [formLines, taxRates]);

  const handleSaveInvoice = async (asDraft = false) => {
    if (!formCustomer) {
      toast.error("Please select a customer");
      return;
    }

    const validLines = formLines.filter(
      (l) => l.productId && Number(l.quantity) > 0 && Number(l.unitPrice) >= 0
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one product with price and quantity");
      return;
    }

    setCreating(true);
    try {
      const invoiceLines = validLines.map((l) => {
        const qty = Number(l.quantity);
        const rawPrice = Number(l.unitPrice);
        const disc = Number(l.discountPercent) || 0;
        const effectiveUnitPrice = disc > 0 ? rawPrice * (1 - disc / 100) : rawPrice;

        return {
          productId: l.productId,
          description: l.description || "Furniture Item",
          quantity: qty,
          unitPrice: effectiveUnitPrice,
          taxRateId: l.taxRateId || undefined,
        };
      });

      const result = await createStandaloneInvoiceAction({
        customerId: formCustomer,
        invoiceDate: new Date(formInvoiceDate),
        dueDate: new Date(formDueDate),
        invoiceReference: formSalesOrder ? `SO-${formSalesOrder}` : undefined,
        notes: formNotes || undefined,
        lines: invoiceLines,
      });

      if (result.success && result.data) {
        toast.success(
          `Customer Invoice ${result.data.invoiceNumber} created successfully${
            asDraft ? " as Draft" : ""
          }`
        );
        onClose();
        // Reset form
        setFormCustomer("");
        setFormSalesOrder("");
        setFormNotes("");
        setFormLines([
          {
            productId: "",
            description: "",
            quantity: 1,
            unitPrice: "",
            taxRateId: taxRates[0]?.id || "",
            discountPercent: 0,
          },
        ]);
        onSuccess();
      } else {
        toast.error(result.error || "Failed to generate invoice");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setCreating(false);
    }
  };

  return {
    formCustomer,
    setFormCustomer,
    formSalesOrder,
    setFormSalesOrder,
    formInvoiceDate,
    setFormInvoiceDate,
    formDueDate,
    setFormDueDate,
    formPaymentTerms,
    setFormPaymentTerms,
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
  };
}
