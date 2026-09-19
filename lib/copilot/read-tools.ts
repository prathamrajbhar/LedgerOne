import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dashboardService } from "@/lib/services/dashboard.service";
import { DocumentStatus, PaymentStatus } from "@prisma/client";
import { CopilotUserContext } from "./types";
import { inspectERPDocument } from "./document-inspector";
import { executePlatformQuery } from "./platform-querier";

export function createCopilotReadTools(userContext: CopilotUserContext) {
  return {
    // 1. User & Workspace Profile
    getUserContext: tool({
      description: "Get authenticated user details, permissions, company name, address, and base currency.",
      inputSchema: z.object({}),
      execute: async () => {
        const company = await prisma.companySettings.findFirst({
          select: { companyName: true, address: true, baseCurrency: true },
        });
        return {
          user: { id: userContext.userId, name: userContext.name || "User", email: userContext.email, role: userContext.role },
          company: company || { companyName: "LedgerOne Enterprise", baseCurrency: "INR" },
        };
      },
    }),

    // 2. Live Financial Pulse & Exact Operational Counts
    getFinancialKPIs: tool({
      description: "Fetch real-time financial KPIs (Revenue, Net Profit, AR, AP, Cash) AND exact counts of pending vendor bills, overdue invoices, low stock items, and open orders.",
      inputSchema: z.object({
        periodMonths: z.number().min(1).max(12).default(6).describe("Historical trend months"),
      }),
      execute: async ({ periodMonths }: { periodMonths: number }) => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const kpis = await dashboardService.getKPIs(startOfYear, now);
        const overview = await dashboardService.getMonthlyOverview(periodMonths || 6);

        // Pending & Overdue Vendor Bills (Accounts Payable breakdown)
        const pendingBills = await prisma.vendorBill.findMany({
          where: {
            status: DocumentStatus.CONFIRMED,
            paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
          },
          select: {
            id: true,
            billNumber: true,
            amountDue: true,
            dueDate: true,
            vendor: { select: { name: true } },
          },
          orderBy: { dueDate: "asc" },
        });

        const pendingBillsCount = pendingBills.length;
        const pendingBillsTotal = pendingBills.reduce((acc, b) => acc + Number(b.amountDue), 0);
        const overdueBills = pendingBills.filter((b) => b.dueDate < now);

        // Overdue Customer Invoices (Accounts Receivable breakdown)
        const overdueInvoices = await prisma.customerInvoice.findMany({
          where: {
            status: DocumentStatus.CONFIRMED,
            paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
            dueDate: { lt: now },
          },
          select: {
            id: true,
            invoiceNumber: true,
            amountDue: true,
            dueDate: true,
            customer: { select: { name: true } },
          },
          orderBy: { dueDate: "asc" },
          take: 5,
        });

        // Inventory health
        const lowStockCount = await prisma.product.count({
          where: { isArchived: false, stock: { lte: 10, gt: 0 } },
        });
        const outOfStockCount = await prisma.product.count({
          where: { isArchived: false, stock: { lte: 0 } },
        });

        return {
          financialSummary: {
            totalRevenue: Number(kpis.totalRevenue),
            totalExpenses: Number(kpis.totalExpenses),
            netProfit: Number(kpis.netProfit),
            accountsReceivable: Number(kpis.accountsReceivable),
            accountsPayable: Number(kpis.accountsPayable),
            cashBalance: Number(kpis.cashBalance),
          },
          payablesPulse: {
            pendingBillsCount,
            pendingBillsTotal,
            overdueBillsCount: overdueBills.length,
            urgentBills: pendingBills.slice(0, 5).map((b) => ({
              billNumber: b.billNumber,
              vendorName: b.vendor.name,
              amountDue: Number(b.amountDue),
              dueDate: b.dueDate.toISOString().split("T")[0],
            })),
          },
          receivablesPulse: {
            overdueInvoicesCount: overdueInvoices.length,
            urgentInvoices: overdueInvoices.map((inv) => ({
              invoiceNumber: inv.invoiceNumber,
              customerName: inv.customer?.name || "Unknown",
              amountDue: Number(inv.amountDue),
              dueDate: inv.dueDate.toISOString().split("T")[0],
            })),
          },
          inventoryPulse: { lowStockCount, outOfStockCount },
          recentTrends: overview.slice(-3),
        };
      },
    }),

    // 3. Universal Platform Query & Count Tool
    queryPlatformRecords: tool({
      description: "Query and count any platform records (BILLS, INVOICES, SALES_ORDERS, PURCHASE_ORDERS, PRODUCTS, CONTACTS). Returns exact counts and records.",
      inputSchema: z.object({
        category: z.enum(["BILLS", "INVOICES", "SALES_ORDERS", "PURCHASE_ORDERS", "PRODUCTS", "CONTACTS"]),
        search: z.string().optional().describe("Search term, code, or name"),
        status: z.string().optional().describe("Filter by status (e.g. DRAFT, CONFIRMED, CANCELLED)"),
        paymentStatus: z.string().optional().describe("Filter by payment status (NOT_PAID, PARTIAL, PAID)"),
        limit: z.number().min(1).max(20).default(5),
      }),
      execute: async (params) => {
        return executePlatformQuery(params);
      },
    }),

    // 4. Deep Document Inspection
    getDocumentDetails: tool({
      description: "Deep inspection of any invoice, bill, sales order, or purchase order by ID or document number.",
      inputSchema: z.object({
        identifier: z.string().describe("The document number (e.g. 'INV-2026-4009', 'BILL-2026-2001') or record ID"),
      }),
      execute: async ({ identifier }: { identifier: string }) => {
        const details = await inspectERPDocument(identifier);
        if (!details) {
          return { found: false, message: `Document '${identifier}' was not found in the ERP database.` };
        }
        return { found: true, details };
      },
    }),

    // 5. Budget Status
    getBudgetStatus: tool({
      description: "Inspect active budgets, committed versus achieved amounts, and variance percentages.",
      inputSchema: z.object({}),
      execute: async () => {
        const budgets = await prisma.budget.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            lines: {
              include: { analyticAccount: { select: { name: true } } },
            },
          },
        });

        return {
          budgetCount: budgets.length,
          budgets: budgets.map((b) => ({
            id: b.id,
            name: b.name,
            status: b.status,
            period: `${b.startDate.toISOString().split("T")[0]} to ${b.endDate.toISOString().split("T")[0]}`,
            lines: b.lines.map((l) => ({
              account: l.analyticAccount.name,
              committed: Number(l.committedAmount),
              achieved: Number(l.achievedAmount),
              percent: Number(l.achievedPercent),
            })),
          })),
        };
      },
    }),
  };
}
