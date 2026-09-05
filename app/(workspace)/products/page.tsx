import * as React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { getProductsAction, getProductCategoriesAction } from "@/app/actions/product.actions";
import { ProductsPageClient } from "./products-page-client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; category?: string };
}) {
  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const categoryId = searchParams.category || "";

  const [productsResult, categoriesResult] = await Promise.all([
    getProductsAction({
      search,
      categoryId: categoryId && categoryId !== "ALL" ? categoryId : undefined,
      page,
      limit: 20,
      includeArchived: false,
    }),
    getProductCategoriesAction(),
  ]);

  if (!productsResult.success) {
    return (
      <div className="space-y-5">
        <PageHeader
          title="Products & Inventory"
          description="Catalog of furniture collections, manufacturing costs, selling prices, and live stock tracking."
        />
        <div className="text-center py-12 text-red-600">
          Error loading products: {productsResult.error}
        </div>
      </div>
    );
  }

  const products = productsResult.data?.data || [];
  const total = productsResult.data?.total || 0;
  const totalPages = productsResult.data?.totalPages || 1;
  const categories = categoriesResult.success ? categoriesResult.data || [] : [];

  return (
    <ProductsPageClient
      initialProducts={products}
      initialCategories={categories}
      initialPage={page}
      initialSearch={search}
      initialCategoryId={categoryId}
      totalPages={totalPages}
      totalItems={total}
    />
  );
}

