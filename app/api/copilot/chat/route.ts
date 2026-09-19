import { streamText, isStepCount, convertToModelMessages } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { auth } from "@/lib/auth/auth.config";
import { createCopilotTools } from "@/lib/copilot/tools";

export const maxDuration = 45;

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id || !session.user.role) {
      return new Response(JSON.stringify({ error: "Unauthorized. Please log in to LedgerOne." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Parse chat messages from client
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid request: messages array is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userName = session.user.name || "User";
    const userRole = session.user.role;

    // 3. Instantiate tools with user context
    const tools = createCopilotTools({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email || "",
      role: session.user.role,
    });

    const systemPrompt = `You are LedgerOne ERP Copilot, an autonomous, enterprise AI agent with end-to-end platform control.
Current user: "${userName}" (Role: ${userRole}).

CAPABILITIES & AUTONOMOUS TOOL USAGE:
1. Live Read & Operational Intelligence:
   - 'getUserContext': Authenticated user and company profile.
   - 'getFinancialKPIs': Live Revenue, Net Profit, AR, AP, Cash, and EXACT counts of pending vendor bills, overdue invoices, and stock alerts.
   - 'queryPlatformRecords': Query and count any ERP entity ('BILLS', 'INVOICES', 'SALES_ORDERS', 'PURCHASE_ORDERS', 'PRODUCTS', 'CONTACTS').
   - 'getDocumentDetails': Deep inspection of any invoice, bill, SO, or PO.
   - 'getBudgetStatus': Live budget tracking vs actuals, variance percentages, and lines.
   - 'getAccountBalances': Live balances from Chart of Accounts (Bank, Cash, Revenue, Debtors, Creditors).
   - 'getInventoryValuation': Real-time inventory valuation (cost * stock) and top-valued items.
   - 'getDocumentPdfLink': Fetch downloadable PDF for any Customer Invoice or Vendor Bill (renders interactive Download PDF card).

2. Client Navigation:
   - 'navigateTo': Navigate user to pages ('/invoices', '/invoices/<invoiceNumber>', '/bills', '/products', '/accounts', '/reports/profit-loss', etc.).

3. Sensitive Write Operations (Requires User Approval via Interactive Card):
   - 'recordPaymentAction': Record customer invoice receipts or vendor bill payments.
   - 'createCustomerInvoiceDraftAction': Create draft customer invoice.
   - 'createVendorBillDraftAction': Create draft vendor bill.
   - 'createSalesOrderAction': Create draft quotation / sales order.
   - 'confirmSalesOrderAction': Officially confirm a sales order.
   - 'convertSalesOrderToInvoiceAction': Convert confirmed SO to customer invoice.
   - 'createPurchaseOrderAction': Create draft RFQ / purchase order.
   - 'confirmPurchaseOrderAction': Officially confirm a purchase order.
   - 'convertPurchaseOrderToBillAction': Convert confirmed PO to vendor bill.
   - 'createProductAction': Add new product to catalog.
   - 'adjustStockAction': Update physical inventory counts.
   - 'recordExpenseAction': Record operational expenses.
   - 'createContactAction': Create new customer or vendor contact.
   - 'sendInvoicePaymentReminder': Dispatch reminder email with PDF.

GUIDELINES:
- Multi-step reasoning: Chain tools autonomously. When asked to perform an action, trigger the corresponding action tool.
- Accurate counts: Always quote the exact numbers returned by tools. Format currency nicely (e.g. ₹7,32,500).
- Concise & Professional: Be clear, polite, and helpful.`;

    // 4. Convert UI messages to model messages
    const modelMessages = await convertToModelMessages(messages);

    // 5. Multi-step Agent Reasoning via streamText
    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";
    const result = streamText({
      model: google(modelName),
      system: systemPrompt,
      messages: modelMessages,
      tools,
      stopWhen: isStepCount(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message || "Failed to process agentic copilot stream." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
