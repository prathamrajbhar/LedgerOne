"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { ArrowLeft, Save, Package, Layers, IndianRupee, Sliders } from "lucide-react";
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

    const costNum = parseFloat(formData.cost.toString());
    const salesPriceNum = parseFloat(formData.salesPrice.toString());
    const stockNum = parseFloat(formData.stock.toString());
    const reorderPointNum = parseFloat(formData.reorderPoint.toString());

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (formData.cost === "" || formData.cost === null || formData.cost === undefined) {
      newErrors.cost = "Cost price is required";
    } else if (isNaN(costNum) || costNum < 0) {
      newErrors.cost = "Cost price must be 0 or a positive value";
    }

    if (formData.salesPrice === "" || formData.salesPrice === null || formData.salesPrice === undefined) {
      newErrors.salesPrice = "Sales price is required";
    } else if (isNaN(salesPriceNum) || salesPriceNum < 0) {
      newErrors.salesPrice = "Selling price must be 0 or a positive value";
    }

    if (formData.stock !== "" && (isNaN(stockNum) || stockNum < 0)) {
      newErrors.stock = "Initial stock count cannot be negative";
    }

    if (formData.reorderPoint !== "" && (isNaN(reorderPointNum) || reorderPointNum < 0)) {
      newErrors.reorderPoint = "Reorder alert threshold cannot be negative";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please provide valid positive values");
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
        salesPrice: Math.max(0, parseFloat(formData.salesPrice.toString())),
        cost: Math.max(0, parseFloat(formData.cost.toString())),
        stock: Math.max(0, parseInt(formData.stock.toString(), 10) || 0),
        reorderPoint: Math.max(0, parseInt(formData.reorderPoint.toString(), 10) || 10),
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb / Action Bar */}
      <div className="flex items-center justify-between">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Products Catalog
          </Button>
        </Link>
        <span className="text-xs text-muted-foreground bg-white/80 px-2.5 py-1 rounded-full border border-border">
          {isEdit ? "Editing Mode" : "New Inventory Entry"}
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#EBF3F9] text-navy flex items-center justify-center flex-shrink-0 border border-navy/10">
            <Package className="h-6 w-6 text-navy" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F2942] tracking-tight">
                {isEdit ? `Edit: ${formData.name}` : "Create New Product"}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#E3F3F3] text-[#167C80]">
                Furniture ERP
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Configure product specifications, pricing, bill of materials, and stock control thresholds.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          <Link href="/products">
            <Button type="button" variant="outline" size="sm" className="text-xs">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            size="sm"
            className="bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm px-4"
          >
            <Save className="h-3.5 w-3.5" />
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Product"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Core Product Information & Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Overview & Identity */}
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
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder="e.g. Teak Wood 6-Seater Dining Table"
                    error={errors.name}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormSelect
                    label="Product Category"
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

                  <FormSelect
                    label="Product Type"
                    required
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val as "GOODS" | "SERVICE" | "COMBO" })}
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
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. FUR-DIN-001"
                    helperText="Unique identifier for barcode tracking and inventory reports."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Material & Specifications */}
            <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
              <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-[#E3F3F3] text-[#167C80] flex items-center justify-center">
                    <Layers className="h-3.5 w-3.5 text-[#167C80]" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Material & Physical Specifications
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Provide dimensional and material details for furniture craftsmanship.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Right Column: Pricing & Inventory Control */}
          <div className="space-y-6">
            {/* Section 3: Pricing Structure */}
            <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
              <CardHeader className="p-5 bg-surface-subtle/50 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Cost & Selling Price
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Accounting valuation in INR
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <FormInput
                  label="Cost Price (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.cost}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      setFormData({ ...formData, cost: val });
                      if (errors.cost) setErrors({ ...errors, cost: "" });
                    }
                  }}
                  placeholder="18500"
                  error={errors.cost}
                />

                <FormInput
                  label="Selling Price (₹)"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.salesPrice}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) {
                      setFormData({ ...formData, salesPrice: val });
                      if (errors.salesPrice) setErrors({ ...errors, salesPrice: "" });
                    }
                  }}
                  placeholder="32000"
                  error={errors.salesPrice}
                />

                {/* Estimated Margin Pill */}
                {formData.salesPrice && formData.cost && parseFloat(formData.salesPrice.toString()) > 0 && (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Estimated Margin:</span>
                    <span className="font-bold text-[#167C80]">
                      {(
                        ((parseFloat(formData.salesPrice.toString()) - parseFloat(formData.cost.toString())) /
                          parseFloat(formData.salesPrice.toString())) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 4: Inventory Thresholds */}
            <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
              <CardHeader className="p-5 bg-surface-subtle/50 border-b border-border/80">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sliders className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Inventory Control
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Initial quantity and reorder thresholds
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <FormInput
                  label="Initial Stock Count"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "." || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val, 10) >= 0) {
                      setFormData({ ...formData, stock: val });
                      if (errors.stock) setErrors({ ...errors, stock: "" });
                    }
                  }}
                  placeholder="0"
                  error={errors.stock}
                />

                <FormInput
                  label="Reorder Alert Point"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.reorderPoint}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "." || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val, 10) >= 0) {
                      setFormData({ ...formData, reorderPoint: val });
                      if (errors.reorderPoint) setErrors({ ...errors, reorderPoint: "" });
                    }
                  }}
                  placeholder="10"
                  helperText="Alerts trigger when warehouse stock falls to this level."
                  error={errors.reorderPoint}
                />
              </CardContent>
            </Card>

            {/* Bottom Actions for Mobile / Sidebar */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Link href="/products" className="w-full sm:w-auto">
                <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="w-full sm:w-auto bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Product"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
