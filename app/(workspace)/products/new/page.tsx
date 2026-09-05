import { ProductForm } from "../product-form";
import { getProductCategoriesAction } from "@/app/actions/product.actions";

export default async function NewProductPage() {
  const categoriesResult = await getProductCategoriesAction();

  if (!categoriesResult.success || !categoriesResult.data || categoriesResult.data.length === 0) {
    return (
      <div className="space-y-5">
        <div className="text-center py-12 text-red-600">
          Error: No product categories found. Please create categories first.
        </div>
      </div>
    );
  }

  return <ProductForm categories={categoriesResult.data} />;
}

