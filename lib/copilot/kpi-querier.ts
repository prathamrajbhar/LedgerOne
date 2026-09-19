import { prisma } from "@/lib/prisma";
import { dashboardService } from "@/lib/services/dashboard.service";
import { DocumentStatus, PaymentStatus } from "@prisma/client";

export async function getFinancialKPIsData(periodMonths: number = 6) {
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
}
