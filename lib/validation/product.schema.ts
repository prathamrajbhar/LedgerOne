import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  type: z.enum(["GOODS", "SERVICE", "COMBO"]).default("GOODS"),
  categoryId: z.string().min(1, "Category is required"),
  sku: z.string().optional(),
  material: z.string().optional(),
  dimensions: z.string().optional(),
  salesPrice: z.coerce.number().min(0, "Sales price cannot be negative"),
  cost: z.coerce.number().min(0, "Cost price cannot be negative"),
  stock: z.coerce.number().int().min(0, "Stock must be at least 0").default(0),
  reorderPoint: z.coerce.number().int().min(0).default(5),
  image: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
