"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSalesOrderAction } from "@/app/actions/sales.actions";
import { SalesNewHeader } from "./components/sales-new-header";
import { SalesNewMeta } from "./components/sales-new-meta";
import { SalesNewLines, SalesLineItem } from "./components/sales-new-lines";
import { SalesNewSummary } from "./components/sales-new-summary";

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
  salesPrice: unknown;
}

interface SalesCreateClientProps {
  customers: ContactItem[];
  products: ProductItem[];
}

export function SalesCreateClient({
  customers,
  products,
}: SalesCreateClientProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [customerId, setCustomerId] = React.useState("");
  const [orderDate, setOrderDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = React.useState("");
  const [lines, setLines] = React.useState<SalesLineItem[]>([
    { productId: "", description: "", quantity: 1, unitPrice: 0 },
  ]);

  const customerOptions = React.useMemo(() => {
    return customers.map((c) => ({
      value: c.id,
      label: c.name,
      subLabel: [c.email, c.phone].filter(Boolean).join(" • ") || undefined,
    }));
  }, [customers]);

  const productOptions = React.useMemo(() => {
    return products.map((p) => ({
      value: p.id,
      label: p.name,
      subLabel: [
        p.sku ? `SKU: ${p.sku}` : null,
        p.salesPrice ? `₹${Number(p.salesPrice).toLocaleString("en-IN")}` : null,
      ].filter(Boolean).join(" • ") || undefined,
    }));
  }, [products]);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      { productId: "", description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) {
      toast.error("At least one product line is required");
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineChange = (
    index: number,
    field: keyof SalesLineItem,
    value: string | number
  ) => {
    setLines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === "productId" && value) {
        const product = products.find((p) => p.id === value);
        if (product) {
          current.description = product.name;
          current.unitPrice = Number(product.salesPrice) || 0;
        }
      }

      updated[index] = current;
      return updated;
    });
  };

  const grandTotal = React.useMemo(() => {
    return lines.reduce(
      (sum, l) => sum + (l.quantity || 0) * (l.unitPrice || 0),
      0
    );
  }, [lines]);

  const handleSave = async () => {
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    const invalidLines = lines.filter(
      (l) => !l.productId || l.quantity <= 0 || l.unitPrice < 0
    );
    if (invalidLines.length > 0) {
      toast.error("Please ensure all line items have a product, quantity and price");
      return;
    }

    setLoading(true);
    try {
      const result = await createSalesOrderAction({
        customerId,
        orderDate: new Date(orderDate),
        notes: notes.trim() || undefined,
        lines: lines.map((l) => ({
          productId: l.productId,
          description: l.description || "Furniture item",
          quantity: l.quantity,
          unitPrice: l.unitPrice,
        })),
      });

      if (result.success && result.data) {
        toast.success(`Sales Order ${(result.data as { soNumber: string }).soNumber} created!`);
        router.push("/sales");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create sales order");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <SalesNewHeader
        loading={loading}
        onSave={handleSave}
        onCancel={() => router.push("/sales")}
      />

      <SalesNewMeta
        customerId={customerId}
        onCustomerChange={setCustomerId}
        customerOptions={customerOptions}
        orderDate={orderDate}
        onOrderDateChange={setOrderDate}
        notes={notes}
        onNotesChange={setNotes}
      />

      <SalesNewLines
        lines={lines}
        productOptions={productOptions}
        onAddLine={handleAddLine}
        onRemoveLine={handleRemoveLine}
        onLineChange={handleLineChange}
      />

      <SalesNewSummary total={grandTotal} itemCount={lines.length} />
    </div>
  );
}
