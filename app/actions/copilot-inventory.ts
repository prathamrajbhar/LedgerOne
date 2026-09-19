"use server";

import { prisma } from "@/lib/prisma";
import { ProductType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { CopilotActionResult } from "./copilot.actions";

export async function handleCreateProduct(input: Record<string, unknown>): Promise<CopilotActionResult> {
  try {
    const name = String(input.name || "").trim();
    const salesPrice = Math.max(0, Number(input.salesPrice || 0));
    const cost = Math.max(0, Number(input.cost || 0));
    const initialStock = Math.max(0, Number(input.initialStock || 0));
    const sku = input.sku ? String(input.sku).trim() : `SKU-${Date.now().toString().slice(-6)}`;

    if (!name) return { success: false, error: "Product name is required." };

    let category = await prisma.productCategory.findFirst();
    if (!category) {
      category = await prisma.productCategory.create({ data: { name: "General Catalog" } });
    }

    const product = await prisma.product.create({
      data: {
        name,
        salesPrice,
        cost,
        stock: initialStock,
        type: ProductType.GOODS,
        categoryId: category.id,
        sku,
      },
    });

    try {
      revalidatePath("/products");
    } catch {
      // safe fallback
    }

    return {
      success: true,
      action: "createProductAction",
      message: `Product '${product.name}' (SKU: ${product.sku}) created at ₹${salesPrice.toLocaleString("en-IN")} with initial stock ${initialStock}.`,
      product: { id: product.id, name: product.name, sku: product.sku, salesPrice, stock: initialStock },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to create product." };
  }
}

export async function handleAdjustStock(input: Record<string, unknown>): Promise<CopilotActionResult> {
  try {
    const query = String(input.productNameOrSku || "").trim();
    const newStock = Math.max(0, Number(input.newStockQuantity ?? 0));
    const reason = input.reason ? String(input.reason).trim() : "Physical count adjustment";

    if (!query) return { success: false, error: "Product name or SKU is required." };

    const product = await prisma.product.findFirst({
      where: {
        isArchived: false,
        OR: [
          { id: query },
          { sku: { equals: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    if (!product) return { success: false, error: `Product '${query}' not found in active catalog.` };

    const oldStock = product.stock;
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: { stock: newStock },
    });

    try {
      revalidatePath("/products");
      revalidatePath(`/products/${product.id}`);
    } catch {
      // safe fallback
    }

    return {
      success: true,
      action: "adjustStockAction",
      message: `Stock for '${updated.name}' adjusted from ${oldStock} to ${newStock} units (${reason}).`,
      product: { id: updated.id, name: updated.name, oldStock, newStock },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message || "Failed to adjust inventory stock." };
  }
}
