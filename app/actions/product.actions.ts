"use server";

import { revalidatePath } from "next/cache";
import { PrismaClient } from "@prisma/client";
import { productService, CreateProductInput, UpdateProductInput, ListProductsParams } from "@/lib/services/product.service";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/utils/errors";

const prisma = new PrismaClient();

export interface ProductActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get paginated list of products with optional filters
 */
export async function getProductsAction(params?: ListProductsParams): Promise<ProductActionResult> {
  try {
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
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      success: false,
      error: "Failed to fetch products. Please try again.",
    };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductByIdAction(id: string): Promise<ProductActionResult> {
  try {
    const product = await productService.findById(id);
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "Failed to fetch product details. Please try again.",
    };
  }
}

/**
 * Create a new product
 */
export async function createProductAction(input: CreateProductInput): Promise<ProductActionResult> {
  try {
    const product = await productService.create(input);

    revalidatePath("/products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error creating product:", error);
    return {
      success: false,
      error: "Failed to create product. Please try again.",
    };
  }
}

/**
 * Update an existing product
 */
export async function updateProductAction(input: UpdateProductInput): Promise<ProductActionResult> {
  try {
    const product = await productService.update(input);

    revalidatePath("/products");
    revalidatePath(`/products/${input.id}`);

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Failed to update product. Please try again.",
    };
  }
}

/**
 * Archive a product (soft delete)
 */
export async function archiveProductAction(id: string): Promise<ProductActionResult> {
  try {
    await productService.archive(id);

    revalidatePath("/products");

    return {
      success: true,
      data: { message: "Product archived successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error archiving product:", error);
    return {
      success: false,
      error: "Failed to archive product. Please try again.",
    };
  }
}

/**
 * Restore an archived product
 */
export async function restoreProductAction(id: string): Promise<ProductActionResult> {
  try {
    await productService.restore(id);

    revalidatePath("/products");

    return {
      success: true,
      data: { message: "Product restored successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        success: false,
        error: "Product not found",
      };
    }
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Error restoring product:", error);
    return {
      success: false,
      error: "Failed to restore product. Please try again.",
    };
  }
}

/**
 * Get all product categories
 */
export async function getProductCategoriesAction(): Promise<ProductActionResult> {
  try {
    const categories = await prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories. Please try again.",
    };
  }
}
