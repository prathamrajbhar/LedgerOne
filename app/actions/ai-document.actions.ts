"use server";

import { prisma } from "@/lib/prisma";
import { aiDocumentParserService, ParsedVendorBillResult, ParsedExpenseResult } from "@/lib/services/ai-document-parser.service";
import { requireRole } from "@/lib/auth/session";

export interface AiParseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to parse an uploaded vendor bill (PDF or image)
 */
export async function parseVendorBillAction(formData: FormData): Promise<AiParseResponse<ParsedVendorBillResult>> {
  try {
    await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No document file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = buffer.toString("base64");
    const mimeType = file.type || "application/pdf";
    const fileName = file.name;

    // Load available vendors, products, and analytic accounts from DB
    const [vendors, products, analytics] = await Promise.all([
      prisma.contact.findMany({
        where: { type: "VENDOR", isArchived: false },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: { isArchived: false },
        select: { id: true, name: true, sku: true, cost: true },
      }),
      prisma.analyticAccount.findMany({
        select: { id: true, name: true },
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      cost: p.cost ? Number(p.cost) : 0,
    }));

    const parsed = await aiDocumentParserService.parseVendorBill({
      fileBase64,
      mimeType,
      fileName,
      availableVendors: vendors,
      availableProducts: formattedProducts,
      availableAnalytics: analytics,
    });

    return { success: true, data: parsed };
  } catch (error) {
    console.error("Error in parseVendorBillAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze document with AI",
    };
  }
}

/**
 * Server action to parse an uploaded expense receipt (PDF or image)
 */
export async function parseExpenseReceiptAction(formData: FormData): Promise<AiParseResponse<ParsedExpenseResult>> {
  try {
    await requireRole(["ADMINISTRATOR", "ACCOUNTANT"]);

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No receipt file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBase64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const fileName = file.name;

    // Load expense accounts and journals
    const [accounts, journals] = await Promise.all([
      prisma.chartOfAccount.findMany({
        where: {
          type: { in: ["EXPENSES", "OTHER_EXPENSES"] },
          isArchived: false,
        },
        select: { id: true, name: true },
      }),
      prisma.journal.findMany({
        where: {
          type: { in: ["BANK", "CASH"] },
        },
        select: { id: true, name: true },
      }),
    ]);

    const parsed = await aiDocumentParserService.parseExpenseReceipt({
      fileBase64,
      mimeType,
      fileName,
      availableAccounts: accounts,
      availableJournals: journals,
    });

    return { success: true, data: parsed };
  } catch (error) {
    console.error("Error in parseExpenseReceiptAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse receipt with AI",
    };
  }
}
