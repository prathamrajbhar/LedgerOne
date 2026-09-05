import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getProductByIdAction } from "@/app/actions/product.actions";
import { notFound } from "next/navigation";
import { Product, ProductCategory } from "@prisma/client";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const result = await getProductByIdAction(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const product = result.data as Product & { category: ProductCategory };
  const margin = Number(product.salesPrice) - Number(product.cost);
  const marginPercent = ((margin / Number(product.salesPrice)) * 100).toFixed(1);

  const status = product.stock === 0
    ? "OUT_OF_STOCK"
    : product.stock <= product.reorderPoint
    ? "LOW_STOCK"
    : "IN_STOCK";

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <PageHeader
        title={product.name}
        description={`${product.sku ? `SKU: ${product.sku} · ` : ""}Category: ${product.category.name} · Type: ${product.type}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/products/${product.id}/edit`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                Edit Product
              </Button>
            </Link>
            <Link href="/invoices">
              <Button size="sm" className="bg-navy hover:bg-navy-hover text-white gap-1.5 text-xs">
                Add to Invoice
              </Button>
            </Link>
          </div>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Selling Price</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{Number(product.salesPrice).toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Per unit</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Cost Price</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{Number(product.cost).toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Per unit</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Gross Margin</span>
          <p className="text-xl font-bold text-success mt-1">₹{margin.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-success font-semibold block mt-0.5">{marginPercent}% profit</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Inventory Count</span>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xl font-bold text-foreground">{product.stock} units</p>
          </div>
          <div className="mt-1">
            <StatusBadge status={status} />
          </div>
        </Card>
      </div>

      {/* Specifications */}
      <Card className="p-5 bg-white shadow-card">
        <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border">
          Product Specifications
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {product.material && (
            <div>
              <span className="text-muted-foreground block text-[11px]">Material</span>
              <span className="font-semibold text-foreground">{product.material}</span>
            </div>
          )}
          {product.dimensions && (
            <div>
              <span className="text-muted-foreground block text-[11px]">Dimensions</span>
              <span className="font-semibold text-foreground">{product.dimensions}</span>
            </div>
          )}
          <div>
            <span className="text-muted-foreground block text-[11px]">Reorder Threshold</span>
            <span className="font-semibold text-foreground">{product.reorderPoint} units</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Product Type</span>
            <span className="font-semibold text-foreground">{product.type}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

