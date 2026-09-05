"use client";

import * as React from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { FurnitureProductItem } from "./products-table";

interface ProductsKanbanProps {
  products: FurnitureProductItem[];
}

export function ProductsKanban({ products }: ProductsKanbanProps) {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground bg-white rounded-xl border border-border">
        No furniture products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((item) => (
        <Card
          key={item.id}
          className="p-4 hover:border-navy hover:shadow-dropdown transition-all bg-white flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {item.image ? (
                  <div className="relative h-11 w-11 rounded-lg overflow-hidden border border-border bg-white flex-shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-light text-teal font-bold text-xs border border-teal/10 flex-shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <Badge variant="outline" className="text-[9px] bg-[#F6F7F9]">
                    {item.category}
                  </Badge>
                  <Link
                    href={`/products/${item.id}`}
                    className="font-semibold text-sm text-foreground hover:text-navy hover:underline line-clamp-1 mt-0.5 block"
                  >
                    {item.name}
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-3.5 space-y-1 text-xs text-muted-foreground border-t border-border/70 pt-3">
              <div className="flex justify-between">
                <span>SKU:</span>
                <span className="font-mono text-foreground font-medium">{item.sku}</span>
              </div>
              <div className="flex justify-between">
                <span>Material:</span>
                <span className="text-foreground">{item.material}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost Price:</span>
                <span className="text-foreground">₹{item.cost.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted-foreground block">Selling Price</span>
              <span className="font-bold text-base text-foreground">
                ₹{item.salesPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={item.status} />
              <span className="text-[10px] text-muted-foreground font-medium">
                {item.stock} in stock
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
