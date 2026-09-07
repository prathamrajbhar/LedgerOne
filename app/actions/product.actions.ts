"use server";

import { revalidatePath } from "next/cache";
import { productService, CreateProductInput, UpdateProductInput, ListProductsParams } from "@/lib/services/product.service";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/utils/errors";
import { requirePermission } from "@/lib/auth/guard";
import {
  archiveProductAction as archiveProduct,
  restoreProductAction as restoreProduct,
  checkCanDeleteProductAction as checkCanDelete,
  getProductUsageDetailsAction as getUsageDetails,
  deleteProductDependencyAction as deleteDependency,
  deleteProductAction as deleteProduct,
} from "./product-management.actions";
import {
  getProductCategoriesAction as fetchCategories,
  getInventoryMetricsAction as fetchMetrics,
  getRestockAlertsAction as fetchAlerts,
} from "./product-metrics.actions";

export interface ProductActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function archiveProductAction(id: string) {
  return archiveProduct(id);
}

export async function restoreProductAction(id: string) {
  return restoreProduct(id);
}

export async function checkCanDeleteProductAction(id: string) {
  return checkCanDelete(id);
}

export async function getProductUsageDetailsAction(id: string) {
  return getUsageDetails(id);
}

export async function deleteProductDependencyAction(type: string, id: string, lineId?: string) {
  return deleteDependency(type, id, lineId);
}

export async function deleteProductAction(id: string) {
  return deleteProduct(id);
}

export async function getProductCategoriesAction() {
  return fetchCategories();
}

export async function getInventoryMetricsAction() {
  return fetchMetrics();
}

export async function getRestockAlertsAction() {
  return fetchAlerts();
}

export async function getProductsAction(params?: ListProductsParams): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:read");
    const result = await productService.list(params || {});

    const transformedData = result.data.map((product) => {
      const stock = product.stock;
      const reorderPoint = product.reorderPoint;
      const status = stock === 0
        ? "OUT_OF_STOCK"
        : stock <= reorderPoint
        ? "LOW_STOCK"
        : "IN_STOCK";

      return {
        id: product.id,
        name: product.name,
        type: product.type,
        category: product.category.name,
        categoryId: product.categoryId,
        sku: product.sku || "",
        material: product.material || "",
        dimensions: product.dimensions || "",
        cost: Number(product.cost),
        salesPrice: Number(product.salesPrice),
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        status,
        isArchived: product.isArchived,
        image: product.image,
      };
    });

    return {
      success: true,
      data: {
        data: transformedData,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  } catch {
    return {
      success: false,
      error: "Failed to fetch products. Please try again.",
    };
  }
}

export async function getProductByIdAction(id: string): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:read");
    const product = await productService.findById(id);
    return { success: true, data: product };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Product not found" };
    }
    return { success: false, error: "Failed to fetch product details. Please try again." };
  }
}

export async function createProductAction(input: CreateProductInput): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:write");
    const product = await productService.create(input);
    revalidatePath("/products");
    return { success: true, data: product };
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create product. Please try again." };
  }
}

export async function updateProductAction(input: UpdateProductInput): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:write");
    const product = await productService.update(input);
    revalidatePath("/products");
    revalidatePath(`/products/${input.id}`);
    return { success: true, data: product };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Product not found" };
    }
    if (error instanceof ValidationError || error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update product. Please try again." };
  }
}
