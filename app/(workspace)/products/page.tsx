"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProductsTable, FurnitureProductItem } from "./products-table";
import { ProductsKanban } from "./products-kanban";
import { Pagination } from "@/components/ui/pagination";

const initialProducts: FurnitureProductItem[] = [
  {
    id: "prod-1",
    name: "Teak Wood 6-Seater Dining Table",
    category: "Dining",
    sku: "FUR-DIN-001",
    material: "Solid Teak Wood + Natural Oil Finish",
    cost: 18500,
    salesPrice: 32000,
    stock: 14,
    reorderPoint: 5,
    status: "IN_STOCK",
  },
  {
    id: "prod-2",
    name: "Milano 3-Seater Velvet Sofa (Navy Blue)",
    category: "Living Room",
    sku: "FUR-SOF-002",
    material: "Velvet Upholstery + Hardwood Frame",
    cost: 26000,
    salesPrice: 48000,
    stock: 8,
    reorderPoint: 4,
    status: "IN_STOCK",
  },
  {
    id: "prod-3",
    name: "Ergonomic High-Back Executive Chair",
    category: "Office",
    sku: "FUR-OFF-003",
    material: "Breathable Mesh + Aluminium Base",
    cost: 7200,
    salesPrice: 14500,
    stock: 4,
    reorderPoint: 6,
    status: "LOW_STOCK",
  },
  {
    id: "prod-4",
    name: "Nordic Solid Oak King Size Bed",
    category: "Bedroom",
    sku: "FUR-BED-004",
    material: "European White Oak",
    cost: 32000,
    salesPrice: 56000,
    stock: 0,
    reorderPoint: 3,
    status: "OUT_OF_STOCK",
  },
  {
    id: "prod-5",
    name: "Modern 4-Door Wardrobe with Mirror",
    category: "Bedroom",
    sku: "FUR-WAR-005",
    material: "Engineered Wood + Walnut Laminate",
    cost: 22000,
    salesPrice: 38500,
    stock: 6,
    reorderPoint: 4,
    status: "IN_STOCK",
  },
  {
    id: "prod-6",
    name: "Marble Top Round Coffee Table",
    category: "Living Room",
    sku: "FUR-COF-006",
    material: "Italian Marble + Brass Legs",
    cost: 11000,
    salesPrice: 21000,
    stock: 3,
    reorderPoint: 4,
    status: "LOW_STOCK",
  },
];

export default function ProductsPage() {
  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("ALL");
  const [page, setPage] = React.useState(1);

  const categories = ["ALL", "Living Room", "Dining", "Bedroom", "Office"];

  const filteredProducts = initialProducts.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.material.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products & Inventory"
        description="Catalog of furniture collections, manufacturing costs, selling prices, and live stock tracking."
        actions={
          <Link href="/products/new">
            <Button className="bg-navy hover:bg-navy-hover text-white text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-border shadow-card">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, SKU, or wood type..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Category Pills & View Mode */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-white text-navy font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "ALL" ? "All Collections" : cat}
              </button>
            ))}
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border flex-shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white text-navy shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-navy shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product List or Kanban */}
      {viewMode === "list" ? (
        <ProductsTable products={filteredProducts} />
      ) : (
        <ProductsKanban products={filteredProducts} />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={1}
        totalItems={filteredProducts.length}
        onPageChange={setPage}
      />
    </div>
  );
}
