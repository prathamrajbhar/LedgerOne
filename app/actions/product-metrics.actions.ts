"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guard";
import { ProductActionResult } from "./product.actions";

export async function getProductCategoriesAction(): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:read");
    const categories = await prisma.productCategory.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: categories };
  } catch {
    return { success: false, error: "Failed to fetch categories. Please try again." };
  }
}

export async function getInventoryMetricsAction(): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:read");
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      select: { stock: true, reorderPoint: true },
    });

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
        total: products.length,
        lowStock,
        inStock,
        outOfStock,
      },
    };
  } catch {
    return { success: false, error: "Failed to fetch inventory metrics. Please try again." };
  }
}

export async function getRestockAlertsAction(): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:read");
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        stock: { lte: prisma.product.fields.reorderPoint },
      },
      include: { category: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
    });

    const transformedData = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || "",
      category: product.category.name,
      stock: product.stock,
      reorderPoint: product.reorderPoint,
      status: product.stock === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
    }));

    return { success: true, data: transformedData };
  } catch {
    return { success: false, error: "Failed to fetch restock alerts. Please try again." };
  }
}
