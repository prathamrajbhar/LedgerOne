import { prisma } from "@/lib/prisma";
import { DocumentStatus, PaymentStatus } from "@prisma/client";

/**
 * Get products and inventory summary statistics from the database.
 * Returns product counts, stock levels, low-stock & out-of-stock counts, categories, and sanitized item list.
 */
export async function getProductsSummary(searchQuery?: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        ...(searchQuery
          ? {
              OR: [
                { name: { contains: searchQuery, mode: "insensitive" } },
                { material: { contains: searchQuery, mode: "insensitive" } },
                { category: { name: { contains: searchQuery, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: { name: "asc" },
    });

    const totalProducts = products.length;
    const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= p.reorderPoint);
    const outOfStockItems = products.filter((p) => p.stock === 0);
    const healthyStockItems = products.filter((p) => p.stock > p.reorderPoint);

    // Group counts by category
    const categoryCounts: Record<string, number> = {};
    products.forEach((p) => {
      const catName = p.category.name;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });

    return {
      success: true,
      totalProducts,
      healthyStockCount: healthyStockItems.length,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      categories: categoryCounts,
      lowStockDetails: lowStockItems.map((p) => ({
        name: p.name,
        stock: p.stock,
        reorderPoint: p.reorderPoint,
        category: p.category.name,
        salesPrice: `₹${Number(p.salesPrice).toLocaleString("en-IN")}`,
      })),
      outOfStockDetails: outOfStockItems.map((p) => ({
        name: p.name,
        category: p.category.name,
        salesPrice: `₹${Number(p.salesPrice).toLocaleString("en-IN")}`,
      })),
      sampleProducts: products.slice(0, 15).map((p) => ({
        name: p.name,
        type: p.type,
        category: p.category.name,
        stock: p.stock,
        status: p.stock === 0 ? "Out of Stock" : p.stock <= p.reorderPoint ? "Low Stock" : "In Stock",
        salesPrice: `₹${Number(p.salesPrice).toLocaleString("en-IN")}`,
      })),
    };
  } catch (error) {
    console.error("Error in getProductsSummary DB tool:", error);
    return { success: false, error: "Failed to fetch products summary from database" };
  }
}

/**
 * Get contacts (customers and vendors) summary statistics.
 */
export async function getContactsSummary(typeFilter?: "CUSTOMER" | "VENDOR") {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        isArchived: false,
        ...(typeFilter ? { type: { in: [typeFilter, "BOTH"] } } : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        email: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    });

    const customers = contacts.filter((c) => c.type === "CUSTOMER" || c.type === "BOTH");
    const vendors = contacts.filter((c) => c.type === "VENDOR" || c.type === "BOTH");

    return {
      success: true,
      totalContacts: contacts.length,
      totalCustomers: customers.length,
      totalVendors: vendors.length,
      contactsList: contacts.slice(0, 12).map((c) => ({
        name: c.name,
        type: c.type,
        email: c.email,
        phone: c.phone || "N/A",
      })),
    };
  } catch (error) {
    console.error("Error in getContactsSummary DB tool:", error);
    return { success: false, error: "Failed to fetch contacts summary from database" };
  }
}

/**
 * Get customer invoices summary statistics.
 */
export async function getInvoicesSummary() {
  try {
    const invoices = await prisma.customerInvoice.findMany({
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        total: true,
        amountDue: true,
        status: true,
        paymentStatus: true,
        customer: { select: { name: true } },
      },
      orderBy: { invoiceDate: "desc" },
    });

    const totalInvoices = invoices.length;
    const confirmed = invoices.filter((i) => i.status === DocumentStatus.CONFIRMED);
    const drafts = invoices.filter((i) => i.status === DocumentStatus.DRAFT);

    const paidInvoices = confirmed.filter((i) => i.paymentStatus === PaymentStatus.PAID);
    const partialInvoices = confirmed.filter((i) => i.paymentStatus === PaymentStatus.PARTIAL);
    const unpaidInvoices = confirmed.filter((i) => i.paymentStatus === PaymentStatus.NOT_PAID);

    const today = new Date();
    const overdueInvoices = confirmed.filter(
      (i) => i.paymentStatus !== PaymentStatus.PAID && i.dueDate < today
    );

    const totalReceivables = unpaidInvoices.reduce((acc, i) => acc + Number(i.amountDue), 0) +
      partialInvoices.reduce((acc, i) => acc + Number(i.amountDue), 0);

    return {
      success: true,
      totalInvoices,
      draftCount: drafts.length,
      confirmedCount: confirmed.length,
      paidCount: paidInvoices.length,
      unpaidCount: unpaidInvoices.length,
      partialCount: partialInvoices.length,
      overdueCount: overdueInvoices.length,
      totalReceivables: `₹${totalReceivables.toLocaleString("en-IN")}`,
      recentInvoices: invoices.slice(0, 8).map((i) => ({
        invoiceNumber: i.invoiceNumber,
        customer: i.customer.name,
        total: `₹${Number(i.total).toLocaleString("en-IN")}`,
        amountDue: `₹${Number(i.amountDue).toLocaleString("en-IN")}`,
        status: i.status,
        paymentStatus: i.paymentStatus,
      })),
    };
  } catch (error) {
    console.error("Error in getInvoicesSummary DB tool:", error);
    return { success: false, error: "Failed to fetch invoices summary from database" };
  }
}

/**
 * Get vendor bills and orders summary statistics.
 */
export async function getBillsAndOrdersSummary() {
  try {
    const [bills, purchaseOrders, salesOrders] = await Promise.all([
      prisma.vendorBill.findMany({
        select: {
          id: true,
          billNumber: true,
          total: true,
          amountDue: true,
          status: true,
          paymentStatus: true,
          vendor: { select: { name: true } },
        },
        orderBy: { billDate: "desc" },
      }),
      prisma.purchaseOrder.findMany({
        select: {
          id: true,
          poNumber: true,
          total: true,
          status: true,
          vendor: { select: { name: true } },
        },
      }),
      prisma.salesOrder.findMany({
        select: {
          id: true,
          soNumber: true,
          total: true,
          status: true,
          customer: { select: { name: true } },
        },
      }),
    ]);

    const totalPayables = bills
      .filter((b) => b.status === DocumentStatus.CONFIRMED && b.paymentStatus !== PaymentStatus.PAID)
      .reduce((acc, b) => acc + Number(b.amountDue), 0);

    return {
      success: true,
      totalVendorBills: bills.length,
      totalPayables: `₹${totalPayables.toLocaleString("en-IN")}`,
      totalPurchaseOrders: purchaseOrders.length,
      totalSalesOrders: salesOrders.length,
      recentBills: bills.slice(0, 5).map((b) => ({
        billNumber: b.billNumber,
        vendor: b.vendor.name,
        total: `₹${Number(b.total).toLocaleString("en-IN")}`,
        status: b.status,
        paymentStatus: b.paymentStatus,
      })),
      recentSalesOrders: salesOrders.slice(0, 5).map((s) => ({
        orderNumber: s.soNumber,
        customer: s.customer.name,
        total: `₹${Number(s.total).toLocaleString("en-IN")}`,
        status: s.status,
      })),
    };
  } catch (error) {
    console.error("Error in getBillsAndOrdersSummary DB tool:", error);
    return { success: false, error: "Failed to fetch bills/orders summary from database" };
  }
}

/**
 * Get high-level financial overview KPIs safely.
 */
export async function getFinancialOverview() {
  try {
    const [confirmedInvoices, confirmedBills, accounts] = await Promise.all([
      prisma.customerInvoice.aggregate({
        where: { status: DocumentStatus.CONFIRMED },
        _sum: { total: true, amountDue: true },
      }),
      prisma.vendorBill.aggregate({
        where: { status: DocumentStatus.CONFIRMED },
        _sum: { total: true, amountDue: true },
      }),
      prisma.chartOfAccount.findMany({
        select: { code: true, name: true, type: true },
      }),
    ]);

    const totalRevenue = Number(confirmedInvoices._sum.total || 0);
    const totalExpenses = Number(confirmedBills._sum.total || 0);
    const netProfit = totalRevenue - totalExpenses;
    const accountsReceivable = Number(confirmedInvoices._sum.amountDue || 0);
    const accountsPayable = Number(confirmedBills._sum.amountDue || 0);

    const accountTypeCounts: Record<string, number> = {};
    accounts.forEach((acc) => {
      accountTypeCounts[acc.type] = (accountTypeCounts[acc.type] || 0) + 1;
    });

    return {
      success: true,
      totalRevenue: `₹${totalRevenue.toLocaleString("en-IN")}`,
      totalExpenses: `₹${totalExpenses.toLocaleString("en-IN")}`,
      netProfit: `₹${netProfit.toLocaleString("en-IN")}`,
      accountsReceivable: `₹${accountsReceivable.toLocaleString("en-IN")}`,
      accountsPayable: `₹${accountsPayable.toLocaleString("en-IN")}`,
      totalChartOfAccounts: accounts.length,
      accountTypesBreakdown: accountTypeCounts,
    };
  } catch (error) {
    console.error("Error in getFinancialOverview DB tool:", error);
    return { success: false, error: "Failed to fetch financial overview from database" };
  }
}
