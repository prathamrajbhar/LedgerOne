"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createProductAction, updateProductAction } from "@/app/actions/product.actions";

export interface ProductFormDataShape {
  id?: string;
  name?: string;
  type?: "GOODS" | "SERVICE" | "COMBO";
  categoryId?: string;
  sku?: string;
  material?: string;
  dimensions?: string;
  cost?: string | number;
  salesPrice?: string | number;
  stock?: string | number;
  reorderPoint?: string | number;
}

interface ProductFormProps {
  initialData?: ProductFormDataShape;
  categories: Array<{ id: string; name: string }>;
  isEdit?: boolean;
}

export function ProductForm({ initialData, categories, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    type: (initialData?.type || "GOODS") as "GOODS" | "SERVICE" | "COMBO",
    categoryId: initialData?.categoryId || (categories[0]?.id || ""),
    sku: initialData?.sku || "",
    material: initialData?.material || "",
    dimensions: initialData?.dimensions || "",
    cost: initialData?.cost || "",
    salesPrice: initialData?.salesPrice || "",
    stock: initialData?.stock || "0",
    reorderPoint: initialData?.reorderPoint || "10",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.salesPrice) newErrors.salesPrice = "Sales price is required";
    if (!formData.cost) newErrors.cost = "Cost price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        type: formData.type,
        categoryId: formData.categoryId,
        sku: formData.sku.trim() || undefined,
        material: formData.material.trim() || undefined,
        dimensions: formData.dimensions.trim() || undefined,
        salesPrice: parseFloat(formData.salesPrice.toString()),
        cost: parseFloat(formData.cost.toString()),
        stock: parseInt(formData.stock.toString()) || 0,
        reorderPoint: parseInt(formData.reorderPoint.toString()) || 10,
      };

      let result;
      if (isEdit && initialData?.id) {
        result = await updateProductAction({
          id: initialData.id,
          ...productData,
        });
      } else {
        result = await createProductAction(productData);
      }

      if (result.success) {
        toast.success(
          isEdit
            ? `Product "${formData.name}" updated successfully.`
            : `Product "${formData.name}" created successfully.`
        );
        router.push("/products");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save product");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <PageHeader
        title={isEdit ? `Edit: ${formData.name}` : "Add Product"}
        description="Configure product specifications, pricing, and inventory thresholds."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <Card className="p-6 bg-white shadow-card">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Product Overview
            </CardTitle>
            <CardDescription>
              Name, category, and stock keeping unit (SKU)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Product Name"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="e.g. Teak Wood 6-Seater Dining Table"
                error={errors.name}
              />
            </div>

            <FormSelect
              label="Product Type"
              required
              value={formData.type}
              onValueChange={(val) => setFormData({ ...formData, type: val as "GOODS" | "SERVICE" | "COMBO" })}
              options={[
                { value: "GOODS", label: "Goods (Physical Product)" },
                { value: "SERVICE", label: "Service" },
                { value: "COMBO", label: "Combo (Goods + Service)" },
              ]}
            />

            <FormSelect
              label="Category"
              required
              value={formData.categoryId}
              onValueChange={(val) => {
                setFormData({ ...formData, categoryId: val });
                if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
              }}
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              error={errors.categoryId}
            />

            <FormInput
              label="SKU Code"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. FUR-DIN-001"
            />
          </CardContent>
        </Card>

        {/* Material & Specifications */}
        <Card className="p-6 bg-white shadow-card">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Specifications & Material
            </CardTitle>
            <CardDescription>
              Material type, dimensions, and product details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Material / Finish"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              placeholder="e.g. Solid Teak Wood + Natural Matte PU Finish"
            />

            <FormInput
              label="Dimensions (L x W x H)"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              placeholder="e.g. 180cm x 90cm x 75cm"
            />
          </CardContent>
        </Card>

        {/* Pricing & Stock Levels */}
        <Card className="p-6 bg-white shadow-card">
          <CardHeader className="p-0 pb-4 border-b border-border">
            <CardTitle className="text-sm font-bold text-foreground">
              Cost, Pricing & Inventory Control
            </CardTitle>
            <CardDescription>
              Standard accounting cost price and sales price in INR
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Cost Price (₹)"
              type="number"
              required
              value={formData.cost}
              onChange={(e) => {
                setFormData({ ...formData, cost: e.target.value });
                if (errors.cost) setErrors({ ...errors, cost: "" });
              }}
              placeholder="18500"
              error={errors.cost}
            />

            <FormInput
              label="Selling Price (₹)"
              type="number"
              required
              value={formData.salesPrice}
              onChange={(e) => {
                setFormData({ ...formData, salesPrice: e.target.value });
                if (errors.salesPrice) setErrors({ ...errors, salesPrice: "" });
              }}
              placeholder="32000"
              error={errors.salesPrice}
            />

            <FormInput
              label="Initial Stock Count"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
            />

            <FormInput
              label="Reorder Alert Threshold"
              type="number"
              value={formData.reorderPoint}
              onChange={(e) => setFormData({ ...formData, reorderPoint: e.target.value })}
              placeholder="10"
              helperText="Triggers low-stock alert when remaining inventory reaches this."
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/products">
            <Button type="button" variant="secondary" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={loading}
            size="sm"
            className="bg-navy hover:bg-navy-hover text-white gap-1.5"
          >
            <Save className="h-4 w-4" />
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
