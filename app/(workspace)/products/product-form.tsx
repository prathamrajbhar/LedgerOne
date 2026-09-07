"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { createProductAction, updateProductAction } from "@/app/actions/product.actions";
import { parseDimensions, formatDimensions } from "@/lib/utils/product-dimensions";
import { ProductImageUploader } from "./components/product-image-uploader";
import { ProductOverviewFieldset } from "./components/product-overview-fieldset";
import { ProductDimensionsFieldset } from "./components/product-dimensions-fieldset";
import { ProductPricingInventory } from "./components/product-pricing-inventory";

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
  image?: string | null;
}

interface ProductFormProps {
  initialData?: ProductFormDataShape;
  categories: Array<{ id: string; name: string }>;
  isEdit?: boolean;
  isModal?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({
  initialData,
  categories,
  isEdit,
  isModal = false,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === UserRole.ADMINISTRATOR;

  const initialDims = parseDimensions(initialData?.dimensions);

  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    type: (initialData?.type || "GOODS") as "GOODS" | "SERVICE" | "COMBO",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    sku: initialData?.sku || "",
    material: initialData?.material || "",
    dimensions: initialData?.dimensions || "",
    length: initialDims.length,
    width: initialDims.width,
    height: initialDims.height,
    dimensionUnit: initialDims.unit,
    cost: initialData?.cost || "",
    salesPrice: initialData?.salesPrice || "",
    stock: initialData?.stock || "0",
    reorderPoint: initialData?.reorderPoint || "10",
    image: initialData?.image || "",
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
      const finalDimensions = formatDimensions(
        formData.length,
        formData.width,
        formData.height,
        formData.dimensionUnit,
        formData.dimensions
      );

      const productData = {
        name: formData.name.trim(),
        type: formData.type,
        categoryId: formData.categoryId,
        sku: formData.sku.trim() || undefined,
        material: formData.material.trim() || undefined,
        dimensions: finalDimensions || undefined,
        salesPrice: Math.max(0, parseFloat(formData.salesPrice.toString())),
        cost: Math.max(0, parseFloat(formData.cost.toString())),
        stock: Math.max(0, parseInt(formData.stock.toString(), 10) || 0),
        reorderPoint: Math.max(0, parseInt(formData.reorderPoint.toString(), 10) || 10),
        image: formData.image.trim() || null,
      };

      const result = isEdit && initialData?.id
        ? await updateProductAction({ id: initialData.id, ...productData })
        : await createProductAction(productData);

      if (result.success) {
        toast.success(
          isEdit
            ? `Product "${formData.name}" updated successfully.`
            : `Product "${formData.name}" created successfully.`
        );
        if (isModal) {
          onSuccess?.();
        } else {
          router.push("/products");
          router.refresh();
        }
      } else {
        toast.error(result.error || "Failed to save product");
        setLoading(false);
      }
    } catch {
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? "space-y-4" : "space-y-6 max-w-5xl mx-auto pb-12"}>
      {!isModal && (
        <div className="flex items-center justify-between">
          <Link href="/products">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Products Catalog
            </Button>
          </Link>
          <span className="text-xs text-muted-foreground bg-white/80 px-2.5 py-1 rounded-full border border-border">
            {isEdit ? "Editing Mode" : "New Inventory Entry"}
          </span>
        </div>
      )}

      {!isModal && (
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
              <Button type="button" variant="outline" size="sm" className="text-xs cursor-pointer">
                Cancel
              </Button>
            </Link>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              size="sm"
              className="bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm px-4 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Save Product"}
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isAdmin && (
              <ProductImageUploader
                image={formData.image}
                productName={formData.name}
                onImageChange={(img) => setFormData((prev) => ({ ...prev, image: img }))}
              />
            )}

            <ProductOverviewFieldset
              name={formData.name}
              onNameChange={(val) => {
                setFormData((prev) => ({ ...prev, name: val }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              categoryId={formData.categoryId}
              onCategoryIdChange={(val) => {
                setFormData((prev) => ({ ...prev, categoryId: val }));
                if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
              type={formData.type}
              onTypeChange={(val) => setFormData((prev) => ({ ...prev, type: val }))}
              sku={formData.sku}
              onSkuChange={(val) => setFormData((prev) => ({ ...prev, sku: val }))}
              categories={categories}
              errors={errors}
            />

            <ProductDimensionsFieldset
              material={formData.material}
              onMaterialChange={(val) => setFormData((prev) => ({ ...prev, material: val }))}
              length={formData.length}
              onLengthChange={(val) => setFormData((prev) => ({ ...prev, length: val }))}
              width={formData.width}
              onWidthChange={(val) => setFormData((prev) => ({ ...prev, width: val }))}
              height={formData.height}
              onHeightChange={(val) => setFormData((prev) => ({ ...prev, height: val }))}
              dimensionUnit={formData.dimensionUnit}
              onDimensionUnitChange={(unit) => setFormData((prev) => ({ ...prev, dimensionUnit: unit }))}
            />
          </div>

          <div className="space-y-6">
            <ProductPricingInventory
              cost={formData.cost}
              onCostChange={(val) => {
                setFormData((prev) => ({ ...prev, cost: val }));
                if (errors.cost) setErrors((prev) => ({ ...prev, cost: "" }));
              }}
              salesPrice={formData.salesPrice}
              onSalesPriceChange={(val) => {
                setFormData((prev) => ({ ...prev, salesPrice: val }));
                if (errors.salesPrice) setErrors((prev) => ({ ...prev, salesPrice: "" }));
              }}
              stock={formData.stock}
              onStockChange={(val) => {
                setFormData((prev) => ({ ...prev, stock: val }));
                if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
              }}
              reorderPoint={formData.reorderPoint}
              onReorderPointChange={(val) => {
                setFormData((prev) => ({ ...prev, reorderPoint: val }));
                if (errors.reorderPoint) setErrors((prev) => ({ ...prev, reorderPoint: "" }));
              }}
              errors={errors}
            />

            <div className="flex items-center justify-end gap-3 pt-1">
              {isModal ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs cursor-pointer"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              ) : (
                <Link href="/products" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs cursor-pointer">
                    Cancel
                  </Button>
                </Link>
              )}
              <Button
                type="submit"
                disabled={loading}
                size="sm"
                className="w-full sm:w-auto bg-navy hover:bg-navy-dark text-white text-xs gap-1.5 shadow-sm cursor-pointer"
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
