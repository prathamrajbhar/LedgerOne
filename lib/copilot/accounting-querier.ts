import { prisma } from "@/lib/prisma";
import { JournalEntryStatus, AccountType } from "@prisma/client";

export interface AccountBalanceSummary {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
  normalSide: "DEBIT" | "CREDIT";
}

export interface InventoryValuationItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  cost: number;
  salesPrice: number;
  valuation: number;
}

export async function getAccountBalancesQuery(accountNameOrCode?: string) {
  const whereClause = accountNameOrCode
    ? {
        isArchived: false,
        OR: [
          { name: { contains: accountNameOrCode, mode: "insensitive" as const } },
          { code: { contains: accountNameOrCode, mode: "insensitive" as const } },
        ],
      }
    : { isArchived: false };

  const accounts = await prisma.chartOfAccount.findMany({
    where: whereClause,
    include: {
      journalEntryLines: {
        where: { journalEntry: { status: JournalEntryStatus.POSTED } },
        select: { debit: true, credit: true },
      },
    },
    orderBy: { code: "asc" },
    take: accountNameOrCode ? 10 : 20,
  });

  const debitNormalTypes = new Set<AccountType>([
    AccountType.ASSET,
    AccountType.BANK,
    AccountType.CASH,
    AccountType.EXPENSES,
    AccountType.OTHER_EXPENSES,
  ]);

  const accountSummaries: AccountBalanceSummary[] = accounts.map((acc) => {
    const totalDebit = acc.journalEntryLines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = acc.journalEntryLines.reduce((sum, line) => sum + Number(line.credit), 0);
    const isDebitNormal = debitNormalTypes.has(acc.type);
    const netBalance = isDebitNormal ? totalDebit - totalCredit : totalCredit - totalDebit;

    return {
      id: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      totalDebit,
      totalCredit,
      netBalance,
      normalSide: isDebitNormal ? "DEBIT" : "CREDIT",
    };
  });

  const aggregateDebit = accountSummaries.reduce((sum, a) => sum + a.totalDebit, 0);
  const aggregateCredit = accountSummaries.reduce((sum, a) => sum + a.totalCredit, 0);

  return {
    accountsCount: accountSummaries.length,
    aggregateDebit,
    aggregateCredit,
    accounts: accountSummaries,
  };
}

export async function getInventoryValuationQuery() {
  const products = await prisma.product.findMany({
    where: { isArchived: false },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      cost: true,
      salesPrice: true,
      category: { select: { name: true } },
    },
    orderBy: { stock: "desc" },
  });

  let totalValuation = 0;
  let totalStockUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const items: InventoryValuationItem[] = products.map((p) => {
    const cost = Number(p.cost);
    const valuation = cost * p.stock;
    totalValuation += valuation;
    totalStockUnits += p.stock;

    if (p.stock <= 0) outOfStockCount++;
    else if (p.stock <= 10) lowStockCount++;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku || "N/A",
      stock: p.stock,
      cost,
      salesPrice: Number(p.salesPrice),
      valuation,
    };
  });

  items.sort((a, b) => b.valuation - a.valuation);

  return {
    totalValuation,
    totalProducts: products.length,
    totalStockUnits,
    lowStockCount,
    outOfStockCount,
    topValuedItems: items.slice(0, 5),
  };
}

export async function getDocumentPdfLinkQuery(documentNumber: string) {
  const cleanId = documentNumber.trim();

  // 1. Search Customer Invoice
  const invoice = await prisma.customerInvoice.findFirst({
    where: { OR: [{ id: cleanId }, { invoiceNumber: cleanId }] },
    include: { customer: { select: { name: true } } },
  });

  if (invoice) {
    return {
      found: true,
      documentType: "INVOICE" as const,
      documentId: invoice.id,
      documentNumber: invoice.invoiceNumber,
      downloadUrl: `/api/invoices/${invoice.id}/download`,
      partyName: invoice.customer?.name || "Customer",
      total: Number(invoice.total),
      amountDue: Number(invoice.amountDue),
      status: invoice.status,
      paymentStatus: invoice.paymentStatus,
      issueDate: invoice.invoiceDate.toISOString().split("T")[0],
    };
  }

  // 2. Search Vendor Bill
  const bill = await prisma.vendorBill.findFirst({
    where: { OR: [{ id: cleanId }, { billNumber: cleanId }] },
    include: { vendor: { select: { name: true } } },
  });

  if (bill) {
    return {
      found: true,
      documentType: "BILL" as const,
      documentId: bill.id,
      documentNumber: bill.billNumber,
      downloadUrl: `/api/bills/${bill.id}/download`,
      partyName: bill.vendor?.name || "Vendor",
      total: Number(bill.total),
      amountDue: Number(bill.amountDue),
      status: bill.status,
      paymentStatus: bill.paymentStatus,
      issueDate: bill.billDate.toISOString().split("T")[0],
    };
  }

  return {
    found: false,
    message: `Document '${cleanId}' was not found in customer invoices or vendor bills.`,
  };
}
