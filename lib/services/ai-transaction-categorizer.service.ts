import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

export interface CategorizeTransactionInput {
  memo: string;
  amount?: number;
  type?: "DEBIT" | "CREDIT" | "EXPENSE" | "INCOME";
}

export interface CategorizeTransactionResult {
  accountId: string;
  accountName: string;
  accountCode: string;
  analyticAccountId?: string;
  analyticAccountName?: string;
  confidence: number;
  reasoning: string;
  isAiGenerated: boolean;
}

export class AiTransactionCategorizerService {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key" || apiKey.length < 10) {
      return null;
    }
    if (!this.client) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  /**
   * Categorize a raw transaction memo/description to GL Account & Analytic Account
   */
  async categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionResult> {
    const memo = (input.memo || "").trim();
    if (!memo) {
      throw new Error("Transaction description or memo is required for AI categorization");
    }

    // Fetch Chart of Accounts & Analytic Accounts
    const [accounts, analyticAccounts] = await Promise.all([
      prisma.chartOfAccount.findMany({ where: { isArchived: false } }),
      prisma.analyticAccount.findMany(),
    ]);

    if (accounts.length === 0) {
      throw new Error("No active Chart of Accounts found in the database");
    }

    const client = this.getClient();

    if (client) {
      try {
        const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });

        const formattedAccounts = accounts.map((a) => ({ id: a.id, code: a.code, name: a.name, type: a.type }));
        const formattedAnalytics = analyticAccounts.map((a) => ({ id: a.id, name: a.name, type: a.type }));

        const prompt = `You are an expert ERP accounting AI for LedgerOne.
Categorize the following transaction memo into the most appropriate Chart of Account and Analytic Account (cost center).

Transaction Details:
- Memo: "${memo}"
- Amount: ${input.amount ? `₹${input.amount}` : "Not specified"}
- Hint Type: ${input.type || "General"}

Available Chart of Accounts:
${JSON.stringify(formattedAccounts)}

Available Analytic Accounts:
${JSON.stringify(formattedAnalytics)}

Return ONLY a valid raw JSON object (strictly NO markdown code blocks, no backticks, no commentary) with this exact schema:
{
  "accountId": "exact string ID from Available Chart of Accounts",
  "accountName": "exact account name",
  "accountCode": "exact account code",
  "analyticAccountId": "exact string ID from Available Analytic Accounts or null",
  "analyticAccountName": "exact analytic account name or null",
  "confidence": 0.95,
  "reasoning": "1 short sentence explaining why this account best fits the transaction memo"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanedJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanedJson);

        const matchedAccount = accounts.find((a) => a.id === parsed.accountId) || accounts[0];
        const matchedAnalytic = analyticAccounts.find((a) => a.id === parsed.analyticAccountId);

        return {
          accountId: matchedAccount.id,
          accountName: matchedAccount.name,
          accountCode: matchedAccount.code,
          analyticAccountId: matchedAnalytic?.id,
          analyticAccountName: matchedAnalytic?.name,
          confidence: Number(parsed.confidence) || 0.92,
          reasoning: parsed.reasoning || `Categorized under ${matchedAccount.name} based on memo context.`,
          isAiGenerated: true,
        };
      } catch (err) {
        console.warn("Gemini AI categorization failed, falling back to smart heuristic matcher:", err);
      }
    }

    // Heuristic Fallback Matcher
    return this.fallbackCategorize(memo, accounts, analyticAccounts);
  }

  private fallbackCategorize(
    memo: string,
    accounts: Array<{ id: string; code: string; name: string; type: string }>,
    analyticAccounts: Array<{ id: string; name: string; type: string }>
  ): CategorizeTransactionResult {
    const text = memo.toLowerCase();

    // 1. Vehicle / Fuel
    if (text.includes("fuel") || text.includes("petrol") || text.includes("diesel") || text.includes("hpcl") || text.includes("iocl") || text.includes("bpcl") || text.includes("cab") || text.includes("uber") || text.includes("travel")) {
      const acc = accounts.find((a) => a.name.toLowerCase().includes("fuel") || a.name.toLowerCase().includes("vehicle") || a.name.toLowerCase().includes("travel") || a.type === "EXPENSE");
      const analytic = analyticAccounts.find((a) => a.name.toLowerCase().includes("logistics") || a.name.toLowerCase().includes("delivery") || a.type === "EXPENSE");
      if (acc) {
        return {
          accountId: acc.id,
          accountName: acc.name,
          accountCode: acc.code,
          analyticAccountId: analytic?.id,
          analyticAccountName: analytic?.name,
          confidence: 0.88,
          reasoning: "Matched fuel/vehicle keywords from transaction memo.",
          isAiGenerated: false,
        };
      }
    }

    // 2. Utilities / Electricity / Power
    if (text.includes("electric") || text.includes("power") || text.includes("water") || text.includes("internet") || text.includes("wifi") || text.includes("jio") || text.includes("airtel") || text.includes("utility")) {
      const acc = accounts.find((a) => a.name.toLowerCase().includes("utility") || a.name.toLowerCase().includes("electric") || a.name.toLowerCase().includes("communication") || a.type === "EXPENSE");
      const analytic = analyticAccounts.find((a) => a.name.toLowerCase().includes("workshop") || a.name.toLowerCase().includes("office") || a.type === "EXPENSE");
      if (acc) {
        return {
          accountId: acc.id,
          accountName: acc.name,
          accountCode: acc.code,
          analyticAccountId: analytic?.id,
          analyticAccountName: analytic?.name,
          confidence: 0.86,
          reasoning: "Matched utility/communication keywords from transaction memo.",
          isAiGenerated: false,
        };
      }
    }

    // 3. Raw Materials / Timber / Wood / Sawmill
    if (text.includes("timber") || text.includes("wood") || text.includes("plywood") || text.includes("sawmill") || text.includes("plank") || text.includes("log") || text.includes("hardware") || text.includes("supplier")) {
      const acc = accounts.find((a) => a.name.toLowerCase().includes("cost of goods") || a.name.toLowerCase().includes("material") || a.name.toLowerCase().includes("purchase") || a.type === "EXPENSE");
      const analytic = analyticAccounts.find((a) => a.name.toLowerCase().includes("timber") || a.name.toLowerCase().includes("raw material") || a.type === "EXPENSE");
      if (acc) {
        return {
          accountId: acc.id,
          accountName: acc.name,
          accountCode: acc.code,
          analyticAccountId: analytic?.id,
          analyticAccountName: analytic?.name,
          confidence: 0.90,
          reasoning: "Matched raw materials / timber keywords from transaction memo.",
          isAiGenerated: false,
        };
      }
    }

    // 4. Default fallback
    const defaultExpenseAcc = accounts.find((a) => a.type === "EXPENSE") || accounts[0];
    const defaultAnalytic = analyticAccounts[0];

    return {
      accountId: defaultExpenseAcc.id,
      accountName: defaultExpenseAcc.name,
      accountCode: defaultExpenseAcc.code,
      analyticAccountId: defaultAnalytic?.id,
      analyticAccountName: defaultAnalytic?.name,
      confidence: 0.70,
      reasoning: `Mapped to default general ledger account ${defaultExpenseAcc.name}.`,
      isAiGenerated: false,
    };
  }
}

export const aiTransactionCategorizerService = new AiTransactionCategorizerService();
