"use client";

import * as React from "react";
import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";

interface ProductOverviewFieldsetProps {
  name: string;
  onNameChange: (val: string) => void;
  categoryId: string;
  onCategoryIdChange: (val: string) => void;
  type: "GOODS" | "SERVICE" | "COMBO";
  onTypeChange: (val: "GOODS" | "SERVICE" | "COMBO") => void;
  sku: string;
  onSkuChange: (val: string) => void;
  categories: Array<{ id: string; name: string }>;
  errors: Record<string, string>;
}

export function ProductOverviewFieldset({
  name,
  onNameChange,
  categoryId,
  onCategoryIdChange,
  type,
  onTypeChange,
  sku,
  onSkuChange,
  categories,
  errors,
}: ProductOverviewFieldsetProps) {
  return (
    <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-navy/10 text-navy flex items-center justify-center">
            <Package className="h-3.5 w-3.5 text-navy" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Product Overview & Identity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Define the product name, catalog classification, and tracking SKU.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <FormInput
            label="Product Name"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Teak Wood 6-Seater Dining Table"
            error={errors.name}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Product Category"
            required
            value={categoryId}
            onValueChange={onCategoryIdChange}
            options={categories.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
            error={errors.categoryId}
          />

          <FormSelect
            label="Product Type"
            required
            value={type}
            onValueChange={(val) => onTypeChange(val as "GOODS" | "SERVICE" | "COMBO")}
            options={[
              { value: "GOODS", label: "Goods (Physical Product)" },
              { value: "SERVICE", label: "Service (Assembly/Finishing)" },
              { value: "COMBO", label: "Combo (Goods + Installation)" },
            ]}
          />
        </div>

        <div>
          <FormInput
            label="SKU Code"
            value={sku}
            onChange={(e) => onSkuChange(e.target.value)}
            placeholder="e.g. FUR-DIN-001"
            helperText="Unique identifier for barcode tracking and inventory reports."
          />
        </div>
      </CardContent>
    </Card>
  );
}
