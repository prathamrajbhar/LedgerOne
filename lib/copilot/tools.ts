import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { dashboardService } from "@/lib/services/dashboard.service";
import { DocumentStatus, PaymentStatus } from "@prisma/client";

export interface CopilotUserContext {
  userId: string;
  name?: string | null;
  email: string;
  role: string;
}

export function createCopilotTools(userContext: CopilotUserContext) {
  return {
    // 1. READ TOOL: User and Workspace context
    getUserContext: tool({
      description: "Get information about the currently authenticated user, active role, permissions, and company profile.",
      inputSchema: z.object({}),
      execute: async () => {
        const companySettings = await prisma.companySettings.findFirst({
          select: {
            companyName: true,
            address: true,
            baseCurrency: true,
          },
        });

        return {
          user: {
            id: userContext.userId,
            name: userContext.name || "User",
            email: userContext.email,
            role: userContext.role,
          },
          company: companySettings || {
            companyName: "LedgerOne Enterprise",
            baseCurrency: "INR",
          },
        };
      },
    }),

    // 2. READ TOOL: Live Financial KPIs & Health
    getFinancialKPIs: tool({
      description: "Fetch live financial KPIs including total revenue, expenses, net profit, accounts receivable, payables, and overdue invoices.",
      inputSchema: z.object({
        periodMonths: z.number().min(1).max(12).default(6).describe("Number of months for historical overview"),
      }),
      execute: async ({ periodMonths }: { periodMonths: number }) => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const kpis = await dashboardService.getKPIs(startOfYear, now);
        const overview = await dashboardService.getMonthlyOverview(periodMonths || 6);

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
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 5,
          orderBy: { dueDate: "asc" },
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
          recentTrends: overview.slice(-3),
          overdueInvoicesCount: overdueInvoices.length,
          sampleOverdueInvoices: overdueInvoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customer?.name || "Unknown",
            customerEmail: inv.customer?.email || "",
            amountDue: Number(inv.amountDue),
            dueDate: inv.dueDate.toISOString().split("T")[0],
          })),
        };
      },
    }),

    // 3. READ TOOL: Universal ERP Record Search
    searchERPRecords: tool({
      description: "Search products, contacts (customers/vendors), or customer invoices in LedgerOne database.",
      inputSchema: z.object({
        query: z.string().describe("Search term or name or code to find"),
        category: z.enum(["ALL", "PRODUCTS", "CONTACTS", "INVOICES"]).default("ALL").describe("Record type category"),
      }),
      execute: async ({ query, category }: { query: string; category: "ALL" | "PRODUCTS" | "CONTACTS" | "INVOICES" }) => {
        const cleanQuery = query.trim();
        const results: {
          products?: Array<{ id: string; name: string; sku: string | null; stock: number; salesPrice: number; status: string }>;
          contacts?: Array<{ id: string; name: string; email: string; type: string; phone: string | null }>;
          invoices?: Array<{ id: string; invoiceNumber: string; customerName: string; total: number; amountDue: number; status: string }>;
        } = {};

        if (category === "ALL" || category === "PRODUCTS") {
          const products = await prisma.product.findMany({
            where: {
              OR: [
                { name: { contains: cleanQuery, mode: "insensitive" } },
                { sku: { contains: cleanQuery, mode: "insensitive" } },
                { material: { contains: cleanQuery, mode: "insensitive" } },
              ],
              isArchived: false,
            },
            take: 5,
            select: {
              id: true,
              name: true,
              sku: true,
              stock: true,
              reorderPoint: true,
              salesPrice: true,
            },
          });

          results.products = products.map((p) => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            stock: p.stock,
            salesPrice: Number(p.salesPrice),
            status: p.stock === 0 ? "OUT_OF_STOCK" : p.stock <= p.reorderPoint ? "LOW_STOCK" : "IN_STOCK",
          }));
        }

        if (category === "ALL" || category === "CONTACTS") {
          const contacts = await prisma.contact.findMany({
            where: {
              OR: [
                { name: { contains: cleanQuery, mode: "insensitive" } },
                { email: { contains: cleanQuery, mode: "insensitive" } },
                { phone: { contains: cleanQuery, mode: "insensitive" } },
              ],
              isArchived: false,
            },
            take: 5,
            select: {
              id: true,
              name: true,
              email: true,
              type: true,
              phone: true,
            },
          });

          results.contacts = contacts.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            type: c.type,
            phone: c.phone,
          }));
        }

        if (category === "ALL" || category === "INVOICES") {
          const invoices = await prisma.customerInvoice.findMany({
            where: {
              OR: [
                { invoiceNumber: { contains: cleanQuery, mode: "insensitive" } },
                { customer: { name: { contains: cleanQuery, mode: "insensitive" } } },
              ],
            },
            take: 5,
            select: {
              id: true,
              invoiceNumber: true,
              total: true,
              amountDue: true,
              status: true,
              paymentStatus: true,
              customer: {
                select: { name: true },
              },
            },
            orderBy: { createdAt: "desc" },
          });

          results.invoices = invoices.map((inv) => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customer?.name || "Unknown",
            total: Number(inv.total),
            amountDue: Number(inv.amountDue),
            status: `${inv.status} (${inv.paymentStatus})`,
          }));
        }

        return results;
      },
    }),

    // 4. WRITE ACTION TOOL: Create new Contact (Sensitive - requires user approval)
    createContactAction: tool({
      description: "Propose creating a new Customer or Vendor contact in the LedgerOne database. Requires interactive user approval before database write.",
      inputSchema: z.object({
        name: z.string().min(2).describe("Full name or company name of the contact"),
        email: z.string().email().describe("Email address for invoices and communications"),
        type: z.enum(["CUSTOMER", "VENDOR", "BOTH"]).describe("Whether this contact is a Customer or Vendor"),
        phone: z.string().optional().describe("Contact phone number"),
        city: z.string().optional().describe("City location"),
      }),
    }),

    // 5. WRITE ACTION TOOL: Send Overdue Invoice Payment Reminder (Sensitive - requires user approval)
    sendInvoicePaymentReminder: tool({
      description: "Propose sending an official payment reminder email with PDF details to the customer of an invoice. Requires interactive user approval before dispatch.",
      inputSchema: z.object({
        invoiceId: z.string().describe("The ID or Invoice Number of the Customer Invoice (e.g. 'INV-2026-4009')"),
        customNote: z.string().optional().describe("Optional friendly reminder message to append"),
      }),
    }),

    // 6. CLIENT-SIDE NAVIGATION TOOL (Omits execute so client intercepts it)
    navigateTo: tool({
      description: "Navigate the user directly to an ERP page, report, invoice, customer, or settings screen. For invoices, use '/invoices/<invoiceNumber>' or '/invoices/<id>' (e.g. '/invoices/INV-2026-4009'). For bills, use '/bills/<billNumber>' or '/bills/<id>'.",
      inputSchema: z.object({
        path: z.string().describe("The internal route path (e.g., '/invoices', '/invoices/INV-2026-4009', '/dashboard', '/products/new', '/reports/profit-loss', '/settings/users-management')"),
        label: z.string().describe("Human readable title of the page being navigated to (e.g. 'Customer Invoices', 'Invoice INV-2026-4009', 'Profit & Loss Statement')"),
        description: z.string().optional().describe("Brief explanation of why the user is being navigated there"),
      }),
    }),
  };
}
