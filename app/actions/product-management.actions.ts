"use server";

import { revalidatePath } from "next/cache";
import { productService } from "@/lib/services/product.service";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guard";
import { ProductActionResult } from "./product.actions";

export async function archiveProductAction(id: string): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:write");
    await productService.archive(id);
    revalidatePath("/products");
    return {
      success: true,
      data: { message: "Product archived successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Product not found" };
    }
    if (error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to archive product. Please try again." };
  }
}

export async function restoreProductAction(id: string): Promise<ProductActionResult> {
  try {
    await requirePermission("masters:write");
    await productService.restore(id);
    revalidatePath("/products");
    return {
      success: true,
      data: { message: "Product restored successfully" },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return { success: false, error: "Product not found" };
    }
    if (error instanceof ConflictError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to restore product. Please try again." };
  }
}

export async function checkCanDeleteProductAction(id: string): Promise<ProductActionResult<{ canDelete: boolean }>> {
  try {
    await requirePermission("masters:read");
    const canDelete = await productService.canDelete(id);
    return {
      success: true,
      data: { canDelete },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to check product usage";
    return { success: false, error: message };
  }
}

export async function getProductUsageDetailsAction(id: string): Promise<ProductActionResult<Awaited<ReturnType<typeof productService.getUsageDetails>>>> {
  try {
    await requirePermission("masters:read");
    const details = await productService.getUsageDetails(id);
    return { success: true, data: details };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get product usage details";
    return { success: false, error: message };
  }
}

export async function deleteProductDependencyAction(type: string, id: string, lineId?: string): Promise<ProductActionResult> {
  try {
    await requirePermission("settings:manage");
    await productService.deleteDependency(type, id, lineId);
    revalidatePath("/products");
    return {
      success: true,
      data: { message: "Related document line removed successfully" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to remove dependency";
    return { success: false, error: message };
  }
}

export async function deleteProductAction(id: string): Promise<ProductActionResult> {
  try {
    await requirePermission("settings:manage");

    const canDelete = await productService.canDelete(id);
    if (!canDelete) {
      return {
        success: false,
        error: "Cannot delete product referenced in purchase orders, sales orders, bills, or invoices. Please archive instead.",
      };
    }

    await prisma.product.delete({ where: { id } });
    revalidatePath("/products");
    return {
      success: true,
      data: { message: "Product deleted permanently" },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete product";
    return { success: false, error: message };
  }
}
