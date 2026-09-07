"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPurchaseOrderAction } from "@/app/actions/purchase.actions";
import { PurchaseNewHeader } from "./components/purchase-new-header";
import { PurchaseNewMeta } from "./components/purchase-new-meta";
import { PurchaseNewLines, PurchaseLineItem } from "./components/purchase-new-lines";
import { PurchaseNewSummary } from "./components/purchase-new-summary";

interface ContactItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface ProductItem {
  id: string;
  name: string;
  sku?: string | null;
  cost: unknown;
}

interface AnalyticAccountItem {
  id: string;
  name: string;
}

interface PurchaseCreateClientProps {
  vendors: ContactItem[];
  products: ProductItem[];
  analyticAccounts: AnalyticAccountItem[];
}

export function PurchaseCreateClient({
  vendors,
  products,
  analyticAccounts,
}: PurchaseCreateClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [vendorId, setVendorId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [lines, setLines] = React.useState<PurchaseLineItem[]>([
    {
      id: crypto.randomUUID(),
      productId: "",
      analyticAccountId: analyticAccounts[0]?.id || "",
      quantity: 1,
      unitPrice: 0,
    },
  ]);

  const vendorOptions = React.useMemo(() => {
    return vendors.map((v) => ({
      value: v.id,
      label: v.name,
      subLabel: [v.email, v.phone].filter(Boolean).join(" • ") || undefined,
    }));
  }, [vendors]);

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

  const analyticAccountOptions = React.useMemo(() => {
    return analyticAccounts.map((a) => ({
      value: a.id,
      label: a.name,
    }));
  }, [analyticAccounts]);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: "",
        analyticAccountId: analyticAccounts[0]?.id || "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length <= 1) {
      toast.error("At least one material line is required");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLineChange = (
    id: string,
    field: keyof PurchaseLineItem,
    value: string | number
  ) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const current = { ...line, [field]: value };

        if (field === "productId" && value) {
          const product = products.find((p) => p.id === value);
          if (product) {
            current.unitPrice = Number(product.cost) || 0;
          }
        }

        return current;
      })
    );
  };

  const grandTotal = React.useMemo(() => {
    return lines.reduce(
      (sum, l) => sum + (l.quantity || 0) * (l.unitPrice || 0),
      0
    );
  }, [lines]);

  const handleSave = async () => {
    if (!vendorId) {
      toast.error("Please select a vendor");
      return;
    }
    const invalidLines = lines.filter(
      (l) => !l.productId || !l.analyticAccountId || l.quantity <= 0 || l.unitPrice < 0
    );
    if (invalidLines.length > 0) {
      toast.error("Please ensure all rows have a product, cost center, valid quantity and cost");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createPurchaseOrderAction({
        vendorId,
        orderDate: new Date(orderDate),
        lines: lines.map((l) => ({
          productId: l.productId,
          analyticAccountId: l.analyticAccountId,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      });

      if (result.success && result.data) {
        toast.success(`Purchase Order ${(result.data as { poNumber: string }).poNumber} created!`);
        router.push("/purchases");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create purchase order");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <PurchaseNewHeader
        submitting={submitting}
        onSave={handleSave}
        onCancel={() => router.push("/purchases")}
      />

      <PurchaseNewMeta
        vendorId={vendorId}
        onVendorChange={setVendorId}
        vendorOptions={vendorOptions}
        orderDate={orderDate}
        onOrderDateChange={setOrderDate}
      />

      <PurchaseNewLines
        lines={lines}
        productOptions={productOptions}
        analyticAccountOptions={analyticAccountOptions}
        onAddLine={handleAddLine}
        onRemoveLine={handleRemoveLine}
        onLineChange={handleLineChange}
      />

      <PurchaseNewSummary total={grandTotal} itemCount={lines.length} />
    </div>
  );
}
