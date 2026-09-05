import { ProductForm } from "../product-form";
import { getProductCategoriesAction } from "@/app/actions/product.actions";
import { ProductCategory } from "@prisma/client";

export default async function NewProductPage() {
  const categoriesResult = await getProductCategoriesAction();
  const categories = (categoriesResult.data as ProductCategory[]) || [];

  if (!categoriesResult.success || categories.length === 0) {
    return (
      <div className="space-y-5">
        <div className="text-center py-12 text-red-600">
          Error: No product categories found. Please create categories first.
        </div>
      </div>
    );
  }

  return <ProductForm categories={categories} />;
}

