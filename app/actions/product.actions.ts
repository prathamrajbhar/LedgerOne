"use server";

import { revalidatePath } from "next/cache";
import { productService, CreateProductInput, UpdateProductInput, ListProductsParams } from "@/lib/services/product.service";
import { ValidationError, NotFoundError, ConflictError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";

export interface ProductActionResult<T = unknown> {
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
 * Check whether a product can be hard-deleted or has linked transactions with full breakdown
 */
export async function checkCanDeleteProductAction(id: string): Promise<ProductActionResult<{ canDelete: boolean }>> {
  try {
    const canDelete = await productService.canDelete(id);
    return {
      success: true,
      data: { canDelete },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check product usage";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Get detailed foreign key dependency breakdown for an archived product
 */
export async function getProductUsageDetailsAction(id: string): Promise<ProductActionResult<Awaited<ReturnType<typeof productService.getUsageDetails>>>> {
  try {
    const details = await productService.getUsageDetails(id);
    return {
      success: true,
      data: details,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get product usage details";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Delete or unlink a specific blocking transaction dependency for a product
 */
export async function deleteProductDependencyAction(type: string, id: string, lineId?: string): Promise<ProductActionResult> {
  try {
    await requireRole(["ADMINISTRATOR"]);
    await productService.deleteDependency(type, id, lineId);
    revalidatePath("/products");
    return {
      success: true,
      data: { message: "Related document line removed successfully" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove dependency";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Hard delete a product (Administrator only, records with zero transactions)
 */
export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  try {
    await requireRole(["ADMINISTRATOR"]);

    const canDelete = await productService.canDelete(id);
    if (!canDelete) {
      return {
        success: false,
        error: "Cannot delete product referenced in purchase orders, sales orders, bills, or invoices. Please archive instead.",
      };
    }

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/products");
    return {
      success: true,
      data: { message: "Product deleted permanently" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return {
      success: false,
      error: message,
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

/**
 * Get inventory metrics (total, low stock, in stock, out of stock counts)
 */
export async function getInventoryMetricsAction(): Promise<ProductActionResult> {
  try {
    // Fetch all non-archived products to compute metrics
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      select: {
        stock: true,
        reorderPoint: true,
      },
    });

    const total = products.length;
    let lowStock = 0;
    let outOfStock = 0;
    let inStock = 0;

    products.forEach((product) => {
      if (product.stock === 0) {
        outOfStock++;
      } else if (product.stock <= product.reorderPoint) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      success: true,
      data: {
        total,
        lowStock,
        inStock,
        outOfStock,
      },
    };
  } catch (error) {
    console.error("Error fetching inventory metrics:", error);
    return {
      success: false,
      error: "Failed to fetch inventory metrics. Please try again.",
    };
  }
}

/**
 * Get products requiring restock (stock <= reorderPoint)
 */
export async function getRestockAlertsAction(): Promise<ProductActionResult> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { lte: prisma.product.fields.reorderPoint },
      },
      include: {
        category: true,
      },
      orderBy: [
        { stock: "asc" },
        { name: "asc" },
      ],
    });

    const transformedData = products.map((product) => {
      const status = product.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK";

      return {
        id: product.id,
        name: product.name,
        sku: product.sku || "",
        category: product.category.name,
        stock: product.stock,
        reorderPoint: product.reorderPoint,
        status,
      };
    });

    return {
      success: true,
      data: transformedData,
    };
  } catch (error) {
    console.error("Error fetching restock alerts:", error);
    return {
      success: false,
      error: "Failed to fetch restock alerts. Please try again.",
    };
  }
}
