import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = {
    id: params.id,
    name: "Teak Wood 6-Seater Dining Table",
    category: "Dining",
    sku: "FUR-DIN-001",
    material: "Solid Teak Wood + Natural Matte PU Finish",
    dimensions: "180cm x 90cm x 75cm",
    cost: 18500,
    salesPrice: 32000,
    stock: 14,
    reorderPoint: 5,
    taxRate: "18% GST",
    status: "IN_STOCK",
  };

  const margin = product.salesPrice - product.cost;
  const marginPercent = ((margin / product.salesPrice) * 100).toFixed(1);

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
        description={`SKU: ${product.sku} · Category: ${product.category}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/products/new`}>
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                <Edit className="h-3.5 w-3.5" />
                Edit Product
              </Button>
            </Link>
            <Link href="/sales/invoices/new">
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
          <p className="text-xl font-bold text-foreground mt-1">₹{product.salesPrice.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Incl. 18% GST</span>
        </Card>
        <Card className="p-4 bg-white shadow-card">
          <span className="text-xs text-muted-foreground font-medium">Cost Price (BOM)</span>
          <p className="text-xl font-bold text-foreground mt-1">₹{product.cost.toLocaleString("en-IN")}</p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">Raw material & labor</span>
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
            <StatusBadge status={product.status} />
          </div>
        </Card>
      </div>

      {/* Specifications */}
      <Card className="p-5 bg-white shadow-card">
        <CardTitle className="text-sm font-bold text-foreground mb-4 pb-2 border-b border-border">
          Manufacturing Specifications
        </CardTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Primary Material</span>
            <span className="font-semibold text-foreground">{product.material}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Dimensions</span>
            <span className="font-semibold text-foreground">{product.dimensions}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Reorder Threshold</span>
            <span className="font-semibold text-foreground">{product.reorderPoint} units</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Applicable Tax</span>
            <span className="font-semibold text-foreground">{product.taxRate}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
