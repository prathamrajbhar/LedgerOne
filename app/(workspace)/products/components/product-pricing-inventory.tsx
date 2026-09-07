"use client";

import * as React from "react";
import { IndianRupee, Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";

interface ProductPricingInventoryProps {
  cost: string | number;
  onCostChange: (val: string) => void;
  salesPrice: string | number;
  onSalesPriceChange: (val: string) => void;
  stock: string | number;
  onStockChange: (val: string) => void;
  reorderPoint: string | number;
  onReorderPointChange: (val: string) => void;
  errors: Record<string, string>;
}

export function ProductPricingInventory({
  cost,
  onCostChange,
  salesPrice,
  onSalesPriceChange,
  stock,
  onStockChange,
  reorderPoint,
  onReorderPointChange,
  errors,
}: ProductPricingInventoryProps) {
  const costNum = parseFloat(cost.toString()) || 0;
  const priceNum = parseFloat(salesPrice.toString()) || 0;
  const estimatedMargin = priceNum > 0 ? (((priceNum - costNum) / priceNum) * 100).toFixed(1) : null;

  return (
    <div className="space-y-6">
      {/* Pricing Structure */}
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
            value={cost}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseFloat(val) >= 0) {
                onCostChange(val);
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
            value={salesPrice}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseFloat(val) >= 0) {
                onSalesPriceChange(val);
              }
            }}
            placeholder="32000"
            error={errors.salesPrice}
          />

          {salesPrice && cost && priceNum > 0 && (
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Estimated Margin:</span>
              <span className="font-bold text-[#167C80]">{estimatedMargin}%</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inventory Thresholds */}
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
            value={stock}
            onKeyDown={(e) => {
              if (
                e.key === "-" ||
                e.key === "." ||
                e.key === "e" ||
                e.key === "E" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseInt(val, 10) >= 0) {
                onStockChange(val);
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
            value={reorderPoint}
            onKeyDown={(e) => {
              if (
                e.key === "-" ||
                e.key === "." ||
                e.key === "e" ||
                e.key === "E" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseInt(val, 10) >= 0) {
                onReorderPointChange(val);
              }
            }}
            placeholder="10"
            helperText="Alerts trigger when warehouse stock falls to this level."
            error={errors.reorderPoint}
          />
        </CardContent>
      </Card>
    </div>
  );
}
