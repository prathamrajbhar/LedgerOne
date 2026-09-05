"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { ArrowLeft, Save, Package, Layers, IndianRupee, Sliders, Upload, Image as ImageIcon, X, Loader2, Ruler } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
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

function parseDimensions(raw?: string) {
  if (!raw) return { length: "", width: "", height: "", unit: "cm" };
  // Pattern matching: e.g. "180cm x 90cm x 75cm" or "180 x 90 x 75 cm" or "180 x 90 x 75 mm" or "72 x 36 x 30 in"
  const unitMatch = raw.match(/(cm|mm|in|ft|m)\b/i);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : "cm";

  // Extract all numbers
  const nums = raw.match(/(\d+(\.\d+)?)/g);
  if (nums && nums.length >= 3) {
    return {
      length: nums[0] || "",
      width: nums[1] || "",
      height: nums[2] || "",
      unit,
    };
  }
  if (nums && nums.length === 2) {
    return {
      length: nums[0] || "",
      width: nums[1] || "",
      height: "",
      unit,
    };
  }
  if (nums && nums.length === 1) {
    return {
      length: nums[0] || "",
      width: "",
      height: "",
      unit,
    };
  }
  return { length: "", width: "", height: "", unit: "cm" };
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

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const initialDims = parseDimensions(initialData?.dimensions);

  const [formData, setFormData] = React.useState({
    name: initialData?.name || "",
    type: (initialData?.type || "GOODS") as "GOODS" | "SERVICE" | "COMBO",
    categoryId: initialData?.categoryId || (categories[0]?.id || ""),
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

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Invalid file format. Please upload JPG, PNG, WEBP or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit.");
      return;
    }

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/products/upload", {
        method: "POST",
        body: data,
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to upload image");
      }

      setFormData((prev) => ({ ...prev, image: resJson.url }));
      toast.success("Product image uploaded to S3 successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to upload product image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

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
      // Build synthesized dimensions string from individual parameters if provided
      let finalDimensions = formData.dimensions.trim();
      if (formData.length || formData.width || formData.height) {
        const parts = [];
        if (formData.length) parts.push(`${formData.length}${formData.dimensionUnit}`);
        if (formData.width) parts.push(`${formData.width}${formData.dimensionUnit}`);
        if (formData.height) parts.push(`${formData.height}${formData.dimensionUnit}`);
        finalDimensions = parts.join(" × ");
      }

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
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className={isModal ? "space-y-4" : "space-y-6 max-w-5xl mx-auto pb-12"}>
      {/* Top Breadcrumb / Action Bar */}
      {!isModal && (
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
      )}

      {/* Hero Header Card */}
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
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Core Product Information & Specifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Product Image Upload Section */}
            {isAdmin && (
              <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
                <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
                        <ImageIcon className="h-3.5 w-3.5 text-teal" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">
                          Product Image (Admin Only)
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          Upload a high-resolution catalog photo stored securely in AWS S3.
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal/10 text-teal px-2 py-0.5 rounded-full border border-teal/20">
                      Admin Access
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-5 sm:p-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageFileChange}
                  />

                  {formData.image ? (
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border/80 bg-[#F9FAFB]">
                      <div className="relative h-28 w-28 rounded-xl overflow-hidden border border-border bg-white flex-shrink-0 shadow-sm group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image}
                          alt={formData.name || "Product image"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 flex-1 text-center sm:text-left">
                        <p className="text-xs font-semibold text-foreground break-all line-clamp-1">
                          {formData.image.split("/").pop()}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Image uploaded and linked to this product. It will be showcased in the catalog and product details.
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingImage}
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs h-8 gap-1.5"
                          >
                            {uploadingImage ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Upload className="h-3.5 w-3.5" />
                            )}
                            Change Photo
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={uploadingImage}
                            onClick={handleRemoveImage}
                            className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                          >
                            <X className="h-3.5 w-3.5" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !uploadingImage && fileInputRef.current?.click()}
                      className={`border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-teal/50 hover:bg-teal-light/20 transition-all cursor-pointer ${
                        uploadingImage ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      <div className="mx-auto h-12 w-12 rounded-full bg-teal-light text-teal flex items-center justify-center mb-3">
                        {uploadingImage ? (
                          <Loader2 className="h-6 w-6 animate-spin text-teal" />
                        ) : (
                          <Upload className="h-6 w-6 text-teal" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        {uploadingImage ? "Uploading to S3..." : "Click to upload product image"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Supported formats: JPEG, PNG, WEBP, GIF (Max size 5MB)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
              <CardContent className="p-5 sm:p-6 space-y-5">
                <div>
                  <FormInput
                    label="Material / Finish"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. Solid Teak Wood + Natural Matte PU Finish"
                    helperText="Primary wood species, upholstery fabric, metal grade, or paint finish."
                  />
                </div>

                {/* Individual Dimension Parameters */}
                <div className="p-4 rounded-xl border border-border/80 bg-[#F9FAFB]/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                        <Ruler className="h-3.5 w-3.5 text-teal" />
                      </div>
                      <label className="text-xs font-semibold text-foreground">
                        Physical Dimensions (Individual Parameters)
                      </label>
                    </div>
                    {/* Measurement Unit Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">Unit:</span>
                      <select
                        value={formData.dimensionUnit}
                        onChange={(e) => {
                          const unit = e.target.value;
                          setFormData((prev) => {
                            const parts = [];
                            if (prev.length) parts.push(`${prev.length}${unit}`);
                            if (prev.width) parts.push(`${prev.width}${unit}`);
                            if (prev.height) parts.push(`${prev.height}${unit}`);
                            return {
                              ...prev,
                              dimensionUnit: unit,
                              dimensions: parts.join(" × "),
                            };
                          });
                        }}
                        aria-label="Dimension Unit"
                        className="h-7 px-2 text-xs font-semibold rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-navy"
                      >
                        <option value="cm">cm (Centimeters)</option>
                        <option value="mm">mm (Millimeters)</option>
                        <option value="in">in (Inches)</option>
                        <option value="ft">ft (Feet)</option>
                        <option value="m">m (Meters)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormInput
                      label={`Length (${formData.dimensionUnit})`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.length}
                      onChange={(e) => {
                        const len = e.target.value;
                        setFormData((prev) => {
                          const parts = [];
                          if (len) parts.push(`${len}${prev.dimensionUnit}`);
                          if (prev.width) parts.push(`${prev.width}${prev.dimensionUnit}`);
                          if (prev.height) parts.push(`${prev.height}${prev.dimensionUnit}`);
                          return {
                            ...prev,
                            length: len,
                            dimensions: parts.join(" × "),
                          };
                        });
                      }}
                      placeholder="e.g. 180"
                    />

                    <FormInput
                      label={`Width / Depth (${formData.dimensionUnit})`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.width}
                      onChange={(e) => {
                        const w = e.target.value;
                        setFormData((prev) => {
                          const parts = [];
                          if (prev.length) parts.push(`${prev.length}${prev.dimensionUnit}`);
                          if (w) parts.push(`${w}${prev.dimensionUnit}`);
                          if (prev.height) parts.push(`${prev.height}${prev.dimensionUnit}`);
                          return {
                            ...prev,
                            width: w,
                            dimensions: parts.join(" × "),
                          };
                        });
                      }}
                      placeholder="e.g. 90"
                    />

                    <FormInput
                      label={`Height (${formData.dimensionUnit})`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.height}
                      onChange={(e) => {
                        const h = e.target.value;
                        setFormData((prev) => {
                          const parts = [];
                          if (prev.length) parts.push(`${prev.length}${prev.dimensionUnit}`);
                          if (prev.width) parts.push(`${prev.width}${prev.dimensionUnit}`);
                          if (h) parts.push(`${h}${prev.dimensionUnit}`);
                          return {
                            ...prev,
                            height: h,
                            dimensions: parts.join(" × "),
                          };
                        });
                      }}
                      placeholder="e.g. 75"
                    />
                  </div>

                  {/* Formatted Dimension Preview Pill */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-border text-xs">
                    <span className="text-[11px] text-muted-foreground">Combined Dimension:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {formData.length || formData.width || formData.height ? (
                        [
                          formData.length ? `${formData.length}${formData.dimensionUnit}` : null,
                          formData.width ? `${formData.width}${formData.dimensionUnit}` : null,
                          formData.height ? `${formData.height}${formData.dimensionUnit}` : null,
                        ]
                          .filter(Boolean)
                          .join(" × ")
                      ) : (
                        <span className="text-muted-foreground/60 italic font-sans text-[11px]">
                          Enter L × W × H parameters above
                        </span>
                      )}
                    </span>
                  </div>
                </div>
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
              {isModal ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-xs"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              ) : (
                <Link href="/products" className="w-full sm:w-auto">
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs">
                    Cancel
                  </Button>
                </Link>
              )}
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
