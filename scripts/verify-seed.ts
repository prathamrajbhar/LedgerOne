import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function check() {
  const models = [
    "companySettings",
    "chartOfAccount",
    "journal",
    "taxRate",
    "analyticAccount",
    "productCategory",
    "product",
    "user",
    "contact",
    "purchaseOrder",
    "purchaseOrderLine",
    "vendorBill",
    "vendorBillLine",
    "billPayment",
    "salesOrder",
    "salesOrderLine",
    "customerInvoice",
    "customerInvoiceLine",
    "invoicePayment",
    "paymentGatewayTransaction",
    "journalEntry",
    "journalEntryLine",
    "budget",
    "budgetLine",
    "billEmailLog",
    "invoiceEmailLog",
  ];

  console.log("--- Checking all 26 model row counts ---");
  let allPopulated = true;
  for (const m of models) {
    const count = await (prisma as any)[m].count();
    console.log(`  ${m.padEnd(26)}: ${count} rows`);
    if (count === 0) allPopulated = false;
  }

  console.log("\n--- Checking General Ledger Debit vs Credit Balance ---");
  const sums = await prisma.journalEntryLine.aggregate({
    _sum: { debit: true, credit: true },
  });
  const debit = Number(sums._sum.debit);
  const credit = Number(sums._sum.credit);
  console.log("Total Debits : ₹" + debit.toLocaleString("en-IN"));
  console.log("Total Credits: ₹" + credit.toLocaleString("en-IN"));
  const diff = debit - credit;
  console.log("Balance Difference (must be 0):", diff);

  if (allPopulated && diff === 0) {
    console.log("\n🎉 VALIDATION PASSED: All 26 models populated and General Ledger perfectly balanced!");
  } else {
    console.error("\n❌ VALIDATION FAILED!");
    process.exit(1);
  }
}

check()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
