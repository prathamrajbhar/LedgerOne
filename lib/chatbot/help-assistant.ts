import { GoogleGenerativeAI, Content, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import {
  getProductsSummary,
  getContactsSummary,
  getInvoicesSummary,
  getBillsAndOrdersSummary,
  getFinancialOverview,
} from "./db-tools";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are the intelligent LedgerOne AI Assistant for accounting, ERP, inventory, and business operations.

CAPABILITIES & DATABASE ACCESS:
1. You have SAFE access to real-time company operational and database statistics via tool functions:
   - getProductsSummary: Returns total product counts, stock levels, low-stock alerts, out-of-stock items, and catalog categories.
   - getContactsSummary: Returns customer and vendor counts and sanitized contact summaries.
   - getInvoicesSummary: Returns customer invoice counts, payment statuses, total receivables, and recent invoice numbers.
   - getBillsAndOrdersSummary: Returns vendor bill totals, payables, purchase order and sales order statuses.
   - getFinancialOverview: Returns high-level financial KPIs (revenue, expenses, net profit, accounts receivable/payable totals).
2. Always call the appropriate database tool whenever a user asks about company products, inventory counts, stock availability, low-stock items, invoices, customers, vendors, sales, or financial statistics.
3. Use the returned live database data to answer questions directly, accurately, and thoroughly with specific numbers.

DATA SECURITY & PRIVACY RULES:
- NEVER leak user password hashes, secret API keys, authentication tokens, system credentials, or database connections.
- If a user asks for secret credentials, politely explain that sensitive security tokens are strictly restricted.

RESPONSE FORMATTING:
- Format responses cleanly with Markdown (bold text, key-value bullets, numbers).
- When suggesting follow-up questions or example queries to the user, wrap each question in single quotes as a bullet item (e.g. * 'How many products do we have in stock?'). Limit suggestions to 3-4 top relevant queries.
- Be helpful, conversational, precise, and practical.`;

// Define Gemini Tool Function Declarations
const productsToolDeclaration: FunctionDeclaration = {
  name: "getProductsSummary",
  description: "Get product counts, stock levels, low-stock & out-of-stock alerts, categories, and item catalog details.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      searchQuery: {
        type: SchemaType.STRING,
        description: "Optional product name or material search query",
      },
    },
  },
};

const contactsToolDeclaration: FunctionDeclaration = {
  name: "getContactsSummary",
  description: "Get customer and vendor counts, active contacts, and sanitized party directory.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      typeFilter: {
        type: SchemaType.STRING,
        description: "Optional filter for CUSTOMER or VENDOR",
      },
    },
  },
};

const invoicesToolDeclaration: FunctionDeclaration = {
  name: "getInvoicesSummary",
  description: "Get customer invoice statistics, draft/confirmed counts, paid/unpaid statuses, overdue count, and total receivables.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

const billsOrdersToolDeclaration: FunctionDeclaration = {
  name: "getBillsAndOrdersSummary",
  description: "Get vendor bills, purchase orders, sales orders counts, and total payables.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

const financialOverviewToolDeclaration: FunctionDeclaration = {
  name: "getFinancialOverview",
  description: "Get high-level financial KPIs: revenue, expenses, net profit, accounts receivable, payables, and chart of accounts overview.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
};

export class HelpAssistant {
  private client: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI {
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY must be configured to use Help Assistant");
      }
      this.client = new GoogleGenerativeAI(apiKey);
    }
    return this.client;
  }

  /**
   * Execute DB tool based on function call name
   */
  private async executeDbTool(name: string, args: Record<string, unknown>) {
    switch (name) {
      case "getProductsSummary":
        return await getProductsSummary(args.searchQuery as string | undefined);
      case "getContactsSummary":
        return await getContactsSummary(args.typeFilter as "CUSTOMER" | "VENDOR" | undefined);
      case "getInvoicesSummary":
        return await getInvoicesSummary();
      case "getBillsAndOrdersSummary":
        return await getBillsAndOrdersSummary();
      case "getFinancialOverview":
        return await getFinancialOverview();
      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  /**
   * Fallback database query synthesizer when Gemini API is unavailable or rate-limited
   */
  private async generateDatabaseFallbackResponse(message: string): Promise<string> {
    const lower = message.toLowerCase();

    if (lower.includes("product") || lower.includes("stock") || lower.includes("chair") || lower.includes("furniture") || lower.includes("inventory") || lower.includes("catalog") || lower.includes("item")) {
      const data = await getProductsSummary();
      if (!data.success) {
        return "I encountered an error fetching live product data from the database. Please try again in a moment.";
      }

      let response = `### 📦 LedgerOne Live Inventory Summary\n\n`;
      response += `We currently have **${data.totalProducts} total products** registered in your catalog.\n\n`;
      response += `* **In Stock (Healthy):** ${data.healthyStockCount} items\n`;
      response += `* **Low Stock Warning:** ${data.lowStockCount} items\n`;
      response += `* **Out of Stock:** ${data.outOfStockCount} items\n\n`;

      if (data.lowStockCount && data.lowStockCount > 0 && data.lowStockDetails) {
        response += `#### ⚠️ Low Stock Items needing attention:\n`;
        data.lowStockDetails.forEach((item) => {
          response += `* **${item.name}** (${item.category}): ${item.stock} in stock (Reorder point: ${item.reorderPoint}) — ${item.salesPrice}\n`;
        });
        response += `\n`;
      }

      if (data.sampleProducts && data.sampleProducts.length > 0) {
        response += `#### 📋 Current Catalog Sample:\n`;
        data.sampleProducts.slice(0, 6).forEach((item) => {
          response += `* **${item.name}** | Category: ${item.category} | Stock: ${item.stock} | Price: ${item.salesPrice}\n`;
        });
      }

      return response;
    }

    if (lower.includes("customer") || lower.includes("vendor") || lower.includes("contact") || lower.includes("party")) {
      const data = await getContactsSummary();
      if (!data.success) {
        return "I encountered an error fetching contacts from the database.";
      }

      let response = `### 👥 LedgerOne Contacts Summary\n\n`;
      response += `You have **${data.totalContacts} total active contacts** registered in LedgerOne:\n`;
      response += `* **Customers:** ${data.totalCustomers}\n`;
      response += `* **Vendors/Suppliers:** ${data.totalVendors}\n\n`;

      if (data.contactsList && data.contactsList.length > 0) {
        response += `#### 📇 Registered Contacts:\n`;
        data.contactsList.slice(0, 5).forEach((c) => {
          response += `* **${c.name}** (${c.type}) — ${c.email}\n`;
        });
      }

      return response;
    }

    if (lower.includes("invoice") || lower.includes("receivable") || lower.includes("sale order") || lower.includes("due")) {
      const data = await getInvoicesSummary();
      if (!data.success) {
        return "I encountered an error fetching invoice details from the database.";
      }

      let response = `### 🧾 Customer Invoices & Receivables Overview\n\n`;
      response += `* **Total Invoices:** ${data.totalInvoices}\n`;
      response += `* **Paid Invoices:** ${data.paidCount}\n`;
      response += `* **Unpaid Invoices:** ${data.unpaidCount}\n`;
      response += `* **Overdue Invoices:** ${data.overdueCount}\n`;
      response += `* **Total Accounts Receivable:** **${data.totalReceivables}**\n\n`;

      if (data.recentInvoices && data.recentInvoices.length > 0) {
        response += `#### 📄 Recent Customer Invoices:\n`;
        data.recentInvoices.slice(0, 4).forEach((inv) => {
          response += `* **${inv.invoiceNumber}** — ${inv.customer} | Total: ${inv.total} | Status: **${inv.status}** (${inv.paymentStatus})\n`;
        });
      }

      return response;
    }

    if (lower.includes("revenue") || lower.includes("expense") || lower.includes("profit") || lower.includes("kpi") || lower.includes("balance") || lower.includes("financial")) {
      const data = await getFinancialOverview();
      if (!data.success) {
        return "I encountered an error fetching financial overview statistics.";
      }

      let response = `### 📊 Financial Overview (Live Database)\n\n`;
      response += `* **Total Revenue (Confirmed Invoices):** **${data.totalRevenue}**\n`;
      response += `* **Total Expenses (Confirmed Bills):** **${data.totalExpenses}**\n`;
      response += `* **Net Profit:** **${data.netProfit}**\n`;
      response += `* **Outstanding Receivables:** ${data.accountsReceivable}\n`;
      response += `* **Outstanding Payables:** ${data.accountsPayable}\n\n`;
      response += `* **Total Chart of Accounts:** ${data.totalChartOfAccounts} accounts configured\n`;

      return response;
    }

    // Default friendly accounting & navigation assistance
    return (
      "I am your LedgerOne Smart ERP & Accounting Assistant! I have live database integration with your catalog, inventory, invoices, contacts, and financial records.\n\n" +
      "You can ask me questions like:\n" +
      "* **'How many products do we have in stock?'**\n" +
      "* **'Which items are currently low on stock?'**\n" +
      "* **'What is our total revenue and net profit?'**\n" +
      "* **'Show me customer invoice & receivable summaries'**\n" +
      "* **'How many customers and vendors are registered?'**"
    );
  }

  async ask(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      const client = this.getClient();

      // Convert conversation history to Gemini format
      const history: Content[] = conversationHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const model = client.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        tools: [
          {
            functionDeclarations: [
              productsToolDeclaration,
              contactsToolDeclaration,
              invoicesToolDeclaration,
              billsOrdersToolDeclaration,
              financialOverviewToolDeclaration,
            ],
          },
        ],
      });

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(message);
      let response = result.response;

      // Handle function calls if model invokes any tool
      const functionCalls = response.functionCalls();
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        const toolResult = await this.executeDbTool(call.name, call.args as Record<string, unknown>);

        // Send tool output back to model to synthesize final answer
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: call.name,
              response: { result: toolResult },
            },
          },
        ]);

        const finalText = followUp.response.text();
        if (finalText) {
          return finalText;
        }
      }

      const text = response.text();
      if (text) {
        return text;
      }

      // If text empty, fall back to direct DB synthesis
      return await this.generateDatabaseFallbackResponse(message);
    } catch (error) {
      console.warn("Gemini API call failed or unavailable, using live DB synthesizer fallback:", error);
      // Fallback guarantees accurate database answers even if Gemini key is not set or rate-limited!
      return await this.generateDatabaseFallbackResponse(message);
    }
  }
}

export const helpAssistant = new HelpAssistant();
