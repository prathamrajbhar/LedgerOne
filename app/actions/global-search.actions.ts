"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  category: "Customers" | "Vendors" | "Invoices" | "Bills" | "Products" | "Accounts" | "Pages & Actions";
  href: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "destructive" | "outline";
}

const QUICK_ACTIONS: Array<{
  keywords: string[];
  title: string;
  subtitle: string;
  category: "Pages & Actions";
  href: string;
  badge?: string;
}> = [
  {
    keywords: ["create invoice", "new invoice", "invoices", "bill customer", "sales"],
    title: "Customer Invoices",
    subtitle: "View and create customer invoices & receivables",
    category: "Pages & Actions",
    href: "/invoices",
    badge: "Action",
  },
  {
    keywords: ["record expense", "expenses", "spend", "slip", "petrol", "utilities"],
    title: "Record Expense",
    subtitle: "Record operational costs and scan receipts with AI",
    category: "Pages & Actions",
    href: "/expenses",
    badge: "Action",
  },
  {
    keywords: ["vendor bills", "create bill", "supplier bill", "payables", "purchases"],
    title: "Vendor Bills",
    subtitle: "Manage supplier bills and AI document scan",
    category: "Pages & Actions",
    href: "/bills",
    badge: "Action",
  },
  {
    keywords: ["purchase order", "new po", "procurement", "order timber"],
    title: "Purchase Orders",
    subtitle: "Procure raw timber, fabrics, and hardware",
    category: "Pages & Actions",
    href: "/purchases",
    badge: "Action",
  },
  {
    keywords: ["profit and loss", "p&l", "income statement", "revenue", "reports"],
    title: "Profit & Loss Statement",
    subtitle: "Income, operational expenses & net margin report",
    category: "Pages & Actions",
    href: "/reports/profit-loss",
    badge: "Report",
  },
  {
    keywords: ["balance sheet", "assets", "liabilities", "equity", "financial report"],
    title: "Balance Sheet Statement",
    subtitle: "Assets, liabilities and owner equity snapshot",
    category: "Pages & Actions",
    href: "/reports/balance-sheet",
    badge: "Report",
  },
  {
    keywords: ["budget report", "budgets", "cost center", "variance"],
    title: "Budget Performance",
    subtitle: "Variance analysis and analytic account tracking",
    category: "Pages & Actions",
    href: "/reports/budget-report",
    badge: "Report",
  },
  {
    keywords: ["journal entries", "general ledger", "debit credit", "manual entry"],
    title: "Journal Entries",
    subtitle: "Double-entry general ledger journal transactions",
    category: "Pages & Actions",
    href: "/journal-entries",
    badge: "Ledger",
  },
  {
    keywords: ["chart of accounts", "gl accounts", "coa", "bank accounts"],
    title: "Chart of Accounts",
    subtitle: "General ledger account hierarchy & balances",
    category: "Pages & Actions",
    href: "/accounts",
    badge: "Master",
  },
  {
    keywords: ["users", "user management", "invite contact", "portal credentials", "roles"],
    title: "Users Management",
    subtitle: "Staff permissions, roles & portal credentials",
    category: "Pages & Actions",
    href: "/settings/users-management",
    badge: "Settings",
  },
];

export async function globalSearchAction(query: string): Promise<{
  success: boolean;
  data: SearchResultItem[];
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, data: [], error: "Unauthorized" };
    }

    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Return default top navigation shortcuts
      const defaultShortcuts: SearchResultItem[] = QUICK_ACTIONS.slice(0, 6).map((item, idx) => ({
        id: `qa-${idx}`,
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        href: item.href,
        badge: item.badge,
        badgeVariant: "outline",
      }));
      return { success: true, data: defaultShortcuts };
    }

    // Match quick actions
    const matchedActions: SearchResultItem[] = QUICK_ACTIONS.filter(
      (action) =>
        action.title.toLowerCase().includes(trimmed) ||
        action.subtitle.toLowerCase().includes(trimmed) ||
        action.keywords.some((kw) => kw.includes(trimmed))
    ).map((action, idx) => ({
      id: `action-${idx}`,
      title: action.title,
      subtitle: action.subtitle,
      category: action.category,
      href: action.href,
      badge: action.badge,
      badgeVariant: "outline",
    }));

    // Query DB entities in parallel with limit
    const [contacts, products, invoices, bills, accounts] = await Promise.all([
      // 1. Contacts (Customers & Vendors)
      prisma.contact.findMany({
        where: {
          isArchived: false,
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
            { phone: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { name: "asc" },
      }),

      // 2. Products
      prisma.product.findMany({
        where: {
          isArchived: false,
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { sku: { contains: trimmed, mode: "insensitive" } },
            { category: { name: { contains: trimmed, mode: "insensitive" } } },
          ],
        },
        take: 5,
        include: { category: true },
        orderBy: { name: "asc" },
      }),

      // 3. Customer Invoices
      prisma.customerInvoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: trimmed, mode: "insensitive" } },
            { customer: { name: { contains: trimmed, mode: "insensitive" } } },
          ],
        },
        take: 5,
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      }),

      // 4. Vendor Bills
      prisma.vendorBill.findMany({
        where: {
          OR: [
            { billNumber: { contains: trimmed, mode: "insensitive" } },
            { vendor: { name: { contains: trimmed, mode: "insensitive" } } },
          ],
        },
        take: 5,
        include: { vendor: true },
        orderBy: { createdAt: "desc" },
      }),

      // 5. Chart of Accounts
      prisma.chartOfAccount.findMany({
        where: {
          isArchived: false,
          OR: [
            { code: { contains: trimmed, mode: "insensitive" } },
            { name: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { code: "asc" },
      }),
    ]);

    const results: SearchResultItem[] = [...matchedActions];

    // Format Contacts
    contacts.forEach((contact) => {
      const isCustomer = contact.type === "CUSTOMER";
      results.push({
        id: `contact-${contact.id}`,
        title: contact.name,
        subtitle: [contact.email, contact.phone].filter(Boolean).join(" • ") || undefined,
        category: isCustomer ? "Customers" : "Vendors",
        href: `/contacts?type=${contact.type}&search=${encodeURIComponent(contact.name)}`,
        badge: isCustomer ? "Customer" : "Vendor",
        badgeVariant: isCustomer ? "default" : "outline",
      });
    });

    // Format Products
    products.forEach((prod) => {
      results.push({
        id: `prod-${prod.id}`,
        title: prod.name,
        subtitle: `SKU: ${prod.sku || "N/A"} • Category: ${prod.category?.name || "General"} • Stock: ${prod.stock} units`,
        category: "Products",
        href: `/products?search=${encodeURIComponent(prod.name)}`,
        badge: `₹${Number(prod.salesPrice).toLocaleString("en-IN")}`,
        badgeVariant: "success",
      });
    });

    // Format Invoices
    invoices.forEach((inv) => {
      results.push({
        id: `inv-${inv.id}`,
        title: `${inv.invoiceNumber} - ${inv.customer.name}`,
        subtitle: `Date: ${new Date(inv.invoiceDate).toLocaleDateString()} • Due: ₹${Number(inv.amountDue).toLocaleString("en-IN")}`,
        category: "Invoices",
        href: `/invoices?search=${encodeURIComponent(inv.invoiceNumber)}`,
        badge: `₹${Number(inv.total).toLocaleString("en-IN")} (${inv.paymentStatus})`,
        badgeVariant: inv.paymentStatus === "PAID" ? "success" : "warning",
      });
    });

    // Format Bills
    bills.forEach((bill) => {
      results.push({
        id: `bill-${bill.id}`,
        title: `${bill.billNumber} - ${bill.vendor.name}`,
        subtitle: `Due: ${new Date(bill.dueDate).toLocaleDateString()} • Due: ₹${Number(bill.amountDue).toLocaleString("en-IN")}`,
        category: "Bills",
        href: `/bills`,
        badge: `₹${Number(bill.total).toLocaleString("en-IN")} (${bill.paymentStatus})`,
        badgeVariant: bill.paymentStatus === "PAID" ? "success" : "warning",
      });
    });

    // Format Chart of Accounts
    accounts.forEach((acc) => {
      results.push({
        id: `acc-${acc.id}`,
        title: `${acc.code} - ${acc.name}`,
        subtitle: `Account Type: ${acc.type.replace("_", " ")}`,
        category: "Accounts",
        href: `/accounts?search=${encodeURIComponent(acc.code)}`,
        badge: acc.type,
        badgeVariant: "outline",
      });
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("Global search error:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Failed to perform global search",
    };
  }
}
