import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CopilotUserContext } from "./types";
import { getFinancialKPIsData } from "./kpi-querier";
import { inspectERPDocument } from "./document-inspector";
import { executePlatformQuery } from "./platform-querier";
import {
  getAccountBalancesQuery,
  getInventoryValuationQuery,
  getDocumentPdfLinkQuery,
} from "./accounting-querier";

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
        return getFinancialKPIsData(periodMonths);
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

    // 6. Live Account Balances & Ledger Position
    getAccountBalances: tool({
      description: "Fetch live debit, credit, and net balances for accounts in the Chart of Accounts (e.g. 'Bank', 'Cash', 'Revenue', 'Debtors').",
      inputSchema: z.object({
        accountNameOrCode: z.string().optional().describe("Optional account name or code to filter (e.g. 'Bank', '1001')"),
      }),
      execute: async ({ accountNameOrCode }: { accountNameOrCode?: string }) => {
        return getAccountBalancesQuery(accountNameOrCode);
      },
    }),

    // 7. Inventory Valuation & Stock Health
    getInventoryValuation: tool({
      description: "Get real-time total inventory valuation (cost * stock), total stock units, and top-valued inventory items.",
      inputSchema: z.object({}),
      execute: async () => {
        return getInventoryValuationQuery();
      },
    }),

    // 8. Document PDF Link
    getDocumentPdfLink: tool({
      description: "Get a downloadable PDF link and preview data for any Customer Invoice or Vendor Bill by document number or ID.",
      inputSchema: z.object({
        documentNumber: z.string().describe("Invoice Number (e.g. 'INV-2026-4009') or Bill Number (e.g. 'BILL-2026-2001')"),
      }),
      execute: async ({ documentNumber }: { documentNumber: string }) => {
        return getDocumentPdfLinkQuery(documentNumber);
      },
    }),

    // 9. System Users & Access Audit
    getSystemUsersList: tool({
      description: "Query and inspect system users, their access roles (Administrator, Accountant, Portal Contact), login IDs, active status, and associated customer/vendor profiles.",
      inputSchema: z.object({
        role: z.enum(["ALL", "ADMINISTRATOR", "ACCOUNTANT", "CONTACT"]).default("ALL").describe("Filter by system role"),
        search: z.string().optional().describe("Search by user name, email, or login ID"),
        isActive: z.boolean().optional().describe("Filter by active/inactive status"),
      }),
      execute: async ({ role, search, isActive }: { role: "ALL" | "ADMINISTRATOR" | "ACCOUNTANT" | "CONTACT"; search?: string; isActive?: boolean }) => {
        const where: Record<string, unknown> = {};
        if (role !== "ALL") where.role = role;
        if (typeof isActive === "boolean") where.isActive = isActive;
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { loginId: { contains: search, mode: "insensitive" } },
          ];
        }

        const users = await prisma.user.findMany({
          where,
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            loginId: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            contact: { select: { id: true, name: true, type: true } },
          },
        });

        return {
          totalReturned: users.length,
          users: users.map((u) => ({
            id: u.id,
            loginId: u.loginId,
            name: u.name || "Unnamed",
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            associatedEntity: u.contact ? `${u.contact.name} (${u.contact.type})` : "Internal Staff",
          })),
        };
      },
    }),
  };
}
