import { ProductForm } from "../../product-form";
import { getProductByIdAction, getProductCategoriesAction } from "@/app/actions/product.actions";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [productResult, categoriesResult] = await Promise.all([
    getProductByIdAction(params.id),
    getProductCategoriesAction(),
  ]);

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  if (!categoriesResult.success || !categoriesResult.data || categoriesResult.data.length === 0) {
    return (
      <div className="space-y-5">
        <div className="text-center py-12 text-red-600">
          Error: No product categories found. Please create categories first.
        </div>
      </div>
    );
  }

  const product = productResult.data;

  const initialData = {
    id: product.id,
    name: product.name,
    type: product.type as "GOODS" | "SERVICE" | "COMBO",
    categoryId: product.categoryId,
    sku: product.sku || "",
    material: product.material || "",
    dimensions: product.dimensions || "",
    cost: Number(product.cost),
    salesPrice: Number(product.salesPrice),
    stock: product.stock,
    reorderPoint: product.reorderPoint,
  };

  return <ProductForm initialData={initialData} categories={categoriesResult.data} isEdit />;
}
