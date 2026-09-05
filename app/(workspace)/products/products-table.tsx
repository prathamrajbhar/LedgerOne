"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export interface FurnitureProductItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  material: string;
  cost: number;
  salesPrice: number;
  stock: number;
  reorderPoint: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

interface ProductsTableProps {
  products: FurnitureProductItem[];
  onStockAdjust?: (product: FurnitureProductItem) => void;
}

export function ProductsTable({ products, onStockAdjust: _onStockAdjust }: ProductsTableProps) {
  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-[#F9FAFB] text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Product & SKU</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Material / Finish</th>
              <th className="py-3.5 px-4 text-right">Cost Price</th>
              <th className="py-3.5 px-4 text-right">Selling Price</th>
              <th className="py-3.5 px-4 text-center">Stock Level</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-xs">
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  No furniture products found.
                </td>
              </tr>
            ) : (
              products.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-primary-light/30 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-light text-teal font-bold text-xs border border-teal/10 flex-shrink-0">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="font-semibold text-foreground hover:text-navy hover:underline block"
                        >
                          {item.name}
                        </Link>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {item.sku}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="outline" className="text-[10px] bg-[#F6F7F9]">
                      {item.category}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {item.material}
                  </td>
                  <td className="py-3.5 px-4 text-right text-muted-foreground">
                    ₹{item.cost.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-foreground">
                    ₹{item.salesPrice.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-center font-semibold text-foreground">
                    {item.stock} units
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/products/${item.id}`}>View Specs</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toast.info(`Stock adjustment initiated for ${item.sku}`)}
                        >
                          Adjust Stock Count
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices`}>Create Invoice Line</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
