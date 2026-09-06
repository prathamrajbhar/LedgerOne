import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mock for GoogleGenerativeAI
const { mockGenerateContent, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockGenerateContent = vi.fn();
  const mockGetGenerativeModel = vi.fn().mockReturnValue({
    generateContent: mockGenerateContent,
  });
  return { mockGenerateContent, mockGetGenerativeModel };
});

vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

import { aiDocumentParserService } from "../ai-document-parser.service";

describe("AiDocumentParserService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  describe("parseVendorBill", () => {
    it("should throw error if GEMINI_API_KEY is not configured or placeholder", async () => {
      process.env.GEMINI_API_KEY = "your-gemini-api-key";

      await expect(
        aiDocumentParserService.parseVendorBill({
          fileBase64: "dGVzdA==",
          mimeType: "application/pdf",
          fileName: "bill.pdf",
          availableVendors: [{ id: "v1", name: "Wood Inc" }],
          availableProducts: [{ id: "p1", name: "Oak Table" }],
          availableAnalytics: [{ id: "a1", name: "Showroom" }],
        })
      ).rejects.toThrow("Google Gemini API key is missing or unconfigured");
    });

    it("should successfully parse vendor bill and match system products/vendors without fake fallbacks", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyFakeKeyForTesting123456789";

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              vendorName: "Acme Timber Co",
              matchedVendorId: null,
              billNumber: "INV-9921",
              billDate: "2026-03-15",
              dueDate: "2026-04-15",
              totalAmount: 5000,
              lines: [
                {
                  productName: "Premium Teak Planks",
                  matchedProductId: null,
                  quantity: 10,
                  unitPrice: 500,
                  lineTotal: 5000,
                },
              ],
            }),
        },
      });

      const result = await aiDocumentParserService.parseVendorBill({
        fileBase64: "dGVzdA==",
        mimeType: "application/pdf",
        fileName: "Acme_Invoice.pdf",
        availableVendors: [
          { id: "v1", name: "Acme Timber Co" },
          { id: "v2", name: "Delta Supplies" },
        ],
        availableProducts: [
          { id: "p1", name: "Premium Teak Planks", sku: "TEAK-01", cost: 450 },
        ],
        availableAnalytics: [{ id: "a1", name: "Manufacturing Operations" }],
      });

      expect(result.vendorName).toBe("Acme Timber Co");
      expect(result.vendorId).toBe("v1");
      expect(result.billNumber).toBe("INV-9921");
      expect(result.billDate).toBe("2026-03-15");
      expect(result.dueDate).toBe("2026-04-15");
      expect(result.totalAmount).toBe(5000);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].productId).toBe("p1");
      expect(result.lines[0].analyticAccountId).toBe("a1");
      expect(result.lines[0].quantity).toBe(10);
      expect(result.lines[0].unitPrice).toBe(500);
      expect(result.lines[0].lineTotal).toBe(5000);
    });

    it("should throw error if Gemini OCR fails", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyFakeKeyForTesting123456789";

      mockGenerateContent.mockRejectedValueOnce(new Error("Network connection timeout"));

      await expect(
        aiDocumentParserService.parseVendorBill({
          fileBase64: "dGVzdA==",
          mimeType: "image/png",
          fileName: "receipt.png",
          availableVendors: [],
          availableProducts: [],
          availableAnalytics: [],
        })
      ).rejects.toThrow("Gemini Vision OCR extraction failed: Network connection timeout");
    });
  });

  describe("parseExpenseReceipt", () => {
    it("should throw error if GEMINI_API_KEY is not set", async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(
        aiDocumentParserService.parseExpenseReceipt({
          fileBase64: "dGVzdA==",
          mimeType: "image/jpeg",
          fileName: "receipt.jpg",
          availableAccounts: [{ id: "acc1", name: "Fuel & Transportation" }],
          availableJournals: [{ id: "j1", name: "Cash" }],
        })
      ).rejects.toThrow("Google Gemini API key is missing or unconfigured");
    });

    it("should parse expense receipt and match category account", async () => {
      process.env.GEMINI_API_KEY = "AIzaSyFakeKeyForTesting123456789";

      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () =>
            JSON.stringify({
              merchantName: "Shell Petrol Station",
              description: "Delivery truck diesel fuel refill",
              amount: 3200,
              expenseDate: "2026-03-01",
              matchedAccountId: null,
            }),
        },
      });

      const result = await aiDocumentParserService.parseExpenseReceipt({
        fileBase64: "dGVzdA==",
        mimeType: "image/jpeg",
        fileName: "fuel_slip.jpg",
        availableAccounts: [
          { id: "acc1", name: "Vehicle Fuel & Travel Expense" },
          { id: "acc2", name: "Office Stationery" },
        ],
        availableJournals: [{ id: "j1", name: "Petty Cash" }],
      });

      expect(result.merchantName).toBe("Shell Petrol Station");
      expect(result.description).toBe("Delivery truck diesel fuel refill");
      expect(result.amount).toBe(3200);
      expect(result.expenseDate).toBe("2026-03-01");
      expect(result.recommendedAccountId).toBe("acc1");
      expect(result.recommendedAccountName).toBe("Vehicle Fuel & Travel Expense");
    });
  });
});
