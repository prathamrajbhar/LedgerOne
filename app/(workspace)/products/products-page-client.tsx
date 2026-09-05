"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, LayoutGrid, List, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ProductsTable, FurnitureProductItem } from "./products-table";
import { ProductsKanban } from "./products-kanban";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsPageClientProps {
  initialProducts: FurnitureProductItem[];
  initialCategories: Array<{ id: string; name: string }>;
  initialPage: number;
  initialSearch: string;
  initialCategoryId: string;
  totalPages: number;
  totalItems: number;
}

export function ProductsPageClient({
  initialProducts,
  initialCategories,
  initialPage,
  initialSearch,
  initialCategoryId,
  totalPages,
  totalItems,
}: ProductsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = React.useState<"list" | "kanban">("list");
  const [search, setSearch] = React.useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = React.useState(initialCategoryId || "ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<"ACTIVE" | "ARCHIVED">(
    searchParams.get("status") === "ARCHIVED" ? "ARCHIVED" : "ACTIVE"
  );

  const updateSearchParams = React.useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== "ALL" && value !== "ACTIVE") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearchSubmit = () => {
    updateSearchParams({ search, page: "1" });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    updateSearchParams({ category: categoryId, page: "1" });
  };

  const handlePageChange = (page: number) => {
    updateSearchParams({ page: page.toString() });
  };

  const categories = [
    { id: "ALL", name: "All Collections" },
    ...initialCategories.map((cat) => ({ id: cat.id, name: cat.name })),
  ];

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
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit();
              }
            }}
            placeholder="Search by product name, SKU, or material..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-white text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Category Pills & View Mode */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto">
          {/* Collection/Category Dropdown */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => handleCategoryChange(val)}
          >
            <SelectTrigger className="h-9 min-w-[150px] text-xs bg-white border-border text-foreground font-medium">
              <SelectValue placeholder="All Collections" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Active vs Archived status toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-[#F6F7F9] border border-border flex-shrink-0">
            <button
              onClick={() => {
                setSelectedStatus("ACTIVE");
                updateSearchParams({ status: "ACTIVE", page: "1" });
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                selectedStatus === "ACTIVE"
                  ? "bg-white text-navy font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setSelectedStatus("ARCHIVED");
                updateSearchParams({ status: "ARCHIVED", page: "1" });
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                selectedStatus === "ARCHIVED"
                  ? "bg-white text-amber-700 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Archived
            </button>
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
        <ProductsTable products={initialProducts} />
      ) : (
        <ProductsKanban products={initialProducts} />
      )}

      {/* Pagination */}
      <Pagination
        currentPage={initialPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
