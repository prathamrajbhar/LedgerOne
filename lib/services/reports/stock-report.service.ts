import { prisma } from "@/lib/prisma";

export interface StockReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  type: string;
  stock: number;
  reorderPoint: number;
  cost: number;
  salesPrice: number;
  totalValuation: number;
  status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
}

export interface StockCategorySummary {
  category: string;
  totalItems: number;
  totalQuantity: number;
  totalValuation: number;
}

export interface StockReport {
  generatedAt: Date;
  items: StockReportItem[];
  categorySummaries: StockCategorySummary[];
  summary: {
    totalProducts: number;
    totalUnitsInStock: number;
    totalStockValuation: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export class StockReportService {
  async generate(): Promise<StockReport> {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
      },
      include: {
        category: true,
      },
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    });

    const items: StockReportItem[] = products.map((product) => {
      const stock = product.stock;
      const reorderPoint = product.reorderPoint;
      const cost = Number(product.cost);
      const salesPrice = Number(product.salesPrice);
      const totalValuation = Math.round(stock * cost * 100) / 100;

      const status: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" =
        stock === 0
          ? "OUT_OF_STOCK"
          : stock <= reorderPoint
          ? "LOW_STOCK"
          : "IN_STOCK";

      return {
        id: product.id,
        name: product.name,
        sku: product.sku || "N/A",
        category: product.category.name,
        type: product.type,
        stock,
        reorderPoint,
        cost,
        salesPrice,
        totalValuation,
        status,
      };
    });

    // Compute category aggregations
    const categoryMap = new Map<string, StockCategorySummary>();
    for (const item of items) {
      const existing = categoryMap.get(item.category) || {
        category: item.category,
        totalItems: 0,
        totalQuantity: 0,
        totalValuation: 0,
      };

      existing.totalItems += 1;
      existing.totalQuantity += item.stock;
      existing.totalValuation = Math.round((existing.totalValuation + item.totalValuation) * 100) / 100;
      categoryMap.set(item.category, existing);
    }

    const categorySummaries = Array.from(categoryMap.values()).sort((a, b) =>
      a.category.localeCompare(b.category)
    );

    const totalProducts = items.length;
    const totalUnitsInStock = items.reduce((sum, item) => sum + item.stock, 0);
    const totalStockValuation =
      Math.round(items.reduce((sum, item) => sum + item.totalValuation, 0) * 100) / 100;
    const inStockCount = items.filter((item) => item.status === "IN_STOCK").length;
    const lowStockCount = items.filter((item) => item.status === "LOW_STOCK").length;
    const outOfStockCount = items.filter((item) => item.status === "OUT_OF_STOCK").length;

    return {
      generatedAt: new Date(),
      items,
      categorySummaries,
      summary: {
        totalProducts,
        totalUnitsInStock,
        totalStockValuation,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
    };
  }
}

export const stockReportService = new StockReportService();
