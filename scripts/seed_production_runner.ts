/**
 * Production Seeding Runner for LedgerOne (https://ledger-one-gold.vercel.app/)
 * 
 * Executes full real-world business flows through domain services:
 * - Master Data: Settings, Chart of Accounts, Journals, Tax Rates, Analytic Accounts
 * - Catalog: Product Categories and 23+ Indian Furniture Items
 * - Contacts & Users: 45 Indian Contacts with @yopmail.com emails & Portal user accounts
 * - Purchase Cycle: POs -> Confirm -> Vendor Bills -> Confirm -> Bill Payments
 * - Sales Cycle: SOs -> Confirm -> Customer Invoices -> Confirm -> Invoice Payments
 * - General Ledger: Balanced Double-Entry Journal Entries (automatic & manual)
 * - Budgets: FY26-27 Budgets with Analytic Lines & Revision tracking
 */

import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { companySettingsService } from "@/lib/services/company-settings.service";
import { chartOfAccountsService } from "@/lib/services/chart-of-accounts.service";
import { journalService } from "@/lib/services/journal.service";
import { taxRateService } from "@/lib/services/tax-rate.service";
import { analyticAccountService } from "@/lib/services/analytic-account.service";
import { productService } from "@/lib/services/product.service";
import { contactService } from "@/lib/services/contact.service";
import { authService } from "@/lib/services/auth.service";
import { purchaseOrderService } from "@/lib/services/purchase-order.service";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { salesOrderService } from "@/lib/services/sales-order.service";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { paymentService } from "@/lib/services/payment.service";
import { journalEntryService } from "@/lib/services/journal-entry.service";
import { budgetService } from "@/lib/services/budget.service";
import {
  AccountType,
  JournalType,
  TaxApplicability,
  AnalyticAccountType,
  ContactType,
  UserRole,
  PaymentMethod,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const PAYLOAD_FILE = path.join(process.cwd(), "scripts", "production_seed_payload.json");

interface ContactItem {
  name: string;
  type: "CUSTOMER" | "VENDOR" | "BOTH";
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  pincodE?: string;
  portalPassword?: string;
}

interface ProductItem {
  name: string;
  category: string;
  type: "GOODS" | "SERVICE" | "COMBO";
  sku: string;
  cost: number;
  salesPrice: number;
  stock: number;
  reorderPoint: number;
  material?: string;
}

interface SeedPayload {
  company: {
    companyName: string;
    address: string;
    baseCurrency: string;
    fiscalYearStartMonth: number;
    poNumberPrefix: string;
    billNumberPrefix: string;
    soNumberPrefix: string;
    invoiceNumberPrefix: string;
    jeNumberPrefix: string;
  };
  categories: string[];
  chart_of_accounts: Array<{ code: string; name: string; type: AccountType }>;
  tax_rates: Array<{ name: string; percentage: number; applicability: TaxApplicability }>;
  analytic_accounts: Array<{ name: string; type: AnalyticAccountType }>;
  journals: Array<{ code: string; name: string; type: JournalType; accountCode: string }>;
  products: ProductItem[];
  contacts: ContactItem[];
}

async function main() {
  console.log("================================================================================");
  console.log("⚡ STARTING PRODUCTION DATA SEEDING PIPELINE: REAL-WORLD FLOW VIA DOMAIN APIS ⚡");
  console.log("================================================================================\n");

  if (!fs.existsSync(PAYLOAD_FILE)) {
    throw new Error(`Payload file not found at ${PAYLOAD_FILE}. Run generate_ai_dataset.py first.`);
  }

  const payload: SeedPayload = JSON.parse(fs.readFileSync(PAYLOAD_FILE, "utf-8"));

  // 1. Resolve Administrator User
  console.log("Step 1: Resolving Administrator User...");
  let adminUser = await prisma.user.findFirst({
    where: { role: UserRole.ADMINISTRATOR },
  });

  if (!adminUser) {
    adminUser = await authService.signUp({
      loginId: "admin001",
      email: "admin@ledgerone.in",
      password: "AdminPassword123!",
      name: "Chief Administrator",
      role: UserRole.ADMINISTRATOR,
    });
    console.log(`✓ Registered Administrator: ${adminUser.email} (${adminUser.loginId})`);
  } else {
    console.log(`✓ Using Existing Administrator: ${adminUser.email} (${adminUser.loginId})`);
  }

  // 2. Ensure Internal Accountant User
  console.log("\nStep 2: Ensuring Internal Accountant User...");
  let accountantUser = await prisma.user.findFirst({
    where: { role: UserRole.ACCOUNTANT },
  });

  if (!accountantUser) {
    accountantUser = await authService.createUser(
      {
        loginId: "acct001",
        email: "accountant@yopmail.com",
        password: "AccountantPass123!",
        name: "Lead Accountant",
        role: UserRole.ACCOUNTANT,
      },
      adminUser.id
    );
    console.log(`✓ Created Accountant: ${accountantUser.email} (${accountantUser.loginId})`);
  } else {
    console.log(`✓ Existing Accountant: ${accountantUser.email} (${accountantUser.loginId})`);
  }

  // 3. Setup Chart of Accounts
  console.log("\nStep 3: Configuring Chart of Accounts...");
  const accountMap = new Map<string, string>(); // code -> id

  for (const acc of payload.chart_of_accounts) {
    let existing = await prisma.chartOfAccount.findUnique({
      where: { code: acc.code },
    });
    if (!existing) {
      existing = await chartOfAccountsService.create({
        code: acc.code,
        name: acc.name,
        type: acc.type,
      });
    }
    accountMap.set(acc.code, existing.id);
  }
  console.log(`✓ Chart of Accounts ready: ${accountMap.size} accounts active.`);

  // 4. Update Company Settings (with AR Debtors and AP Creditors accounts)
  console.log("\nStep 4: Ensuring Company Settings & Base Currency (INR)...");
  const debtorsAccountId = accountMap.get("1050");
  const creditorsAccountId = accountMap.get("2000");

  await companySettingsService.update({
    companyName: payload.company.companyName,
    address: payload.company.address,
    baseCurrency: payload.company.baseCurrency,
    fiscalYearStartMonth: payload.company.fiscalYearStartMonth,
    poNumberPrefix: payload.company.poNumberPrefix,
    billNumberPrefix: payload.company.billNumberPrefix,
    soNumberPrefix: payload.company.soNumberPrefix,
    invoiceNumberPrefix: payload.company.invoiceNumberPrefix,
    jeNumberPrefix: payload.company.jeNumberPrefix,
    debtorsAccountId,
    creditorsAccountId,
  });
  console.log("✓ Company settings configured (Currency: INR ₹, AR: 1050, AP: 2000).");

  // 5. Setup Tax Rates
  console.log("\nStep 5: Configuring GST Tax Rates...");
  const taxRateMap = new Map<string, string>(); // percentage -> id

  for (const tr of payload.tax_rates) {
    let existing = await prisma.taxRate.findUnique({
      where: { name: tr.name },
    });
    if (!existing) {
      existing = await taxRateService.create({
        name: tr.name,
        percentage: tr.percentage,
        applicability: tr.applicability,
      });
    }
    taxRateMap.set(tr.percentage.toString(), existing.id);
  }
  console.log(`✓ Tax Rates ready: ${taxRateMap.size} rates configured.`);

  // 6. Setup Journals
  console.log("\nStep 6: Configuring Accounting Journals...");
  const journalMap = new Map<JournalType, string>();

  for (const j of payload.journals) {
    let existing = await prisma.journal.findUnique({
      where: { code: j.code },
    });
    const defaultAccountId = accountMap.get(j.accountCode);
    if (!defaultAccountId) {
      throw new Error(`Default account ${j.accountCode} not found for journal ${j.code}`);
    }

    if (!existing) {
      existing = await journalService.create({
        code: j.code,
        name: j.name,
        type: j.type,
        defaultAccountId,
      });
    }
    journalMap.set(j.type, existing.id);
  }
  console.log(`✓ Journals ready: Sales, Purchase, Bank, Cash.`);

  // 7. Setup Analytic Accounts (Cost Centers)
  console.log("\nStep 7: Configuring Analytic Accounts (Cost Centers)...");
  const analyticMap = new Map<string, { id: string; type: AnalyticAccountType }>();

  for (const aa of payload.analytic_accounts) {
    let existing = await prisma.analyticAccount.findUnique({
      where: { name: aa.name },
    });
    if (!existing) {
      existing = await analyticAccountService.create({
        name: aa.name,
        type: aa.type,
      });
    }
    analyticMap.set(aa.name, { id: existing.id, type: aa.type });
  }
  console.log(`✓ Analytic Accounts ready: ${analyticMap.size} cost centers active.`);

  // 8. Setup Product Categories & Products
  console.log("\nStep 8: Configuring Product Catalog (Furniture & Raw Materials)...");
  const categoryMap = new Map<string, string>();

  for (const catName of payload.categories) {
    let category = await prisma.productCategory.findUnique({
      where: { name: catName },
    });
    if (!category) {
      category = await prisma.productCategory.create({
        data: { name: catName },
      });
    }
    categoryMap.set(catName, category.id);
  }

  const productMap = new Map<string, { id: string; price: number; cost: number }>();

  for (const p of payload.products) {
    const categoryId = categoryMap.get(p.category);
    if (!categoryId) continue;

    let product = await prisma.product.findFirst({
      where: { sku: p.sku },
    });

    if (!product) {
      product = await productService.create({
        name: p.name,
        categoryId,
        type: p.type,
        sku: p.sku,
        cost: p.cost,
        salesPrice: p.salesPrice,
        stock: p.stock,
        reorderPoint: p.reorderPoint,
        material: p.material || null,
      });
    }
    productMap.set(p.sku, { id: product.id, price: Number(product.salesPrice), cost: Number(product.cost) });
  }
  console.log(`✓ Catalog ready: ${productMap.size} products across ${categoryMap.size} categories.`);

  // 9. Setup Contacts & Portal Users
  console.log("\nStep 9: Onboarding 45 Indian Contacts & Provisioning Portal Users...");
  const customerContacts: string[] = [];
  const vendorContacts: string[] = [];

  for (const c of payload.contacts) {
    const pincode = c.pincode || c.pincodE || "400001";
    let contact = await prisma.contact.findUnique({
      where: { email: c.email },
    });

    if (!contact) {
      contact = await contactService.create({
        name: c.name,
        type: c.type as ContactType,
        email: c.email,
        phone: c.phone || "+91 98200 00000",
        address: c.address || "Main Street",
        city: c.city || "Mumbai",
        state: c.state || "Maharashtra",
        pincode,
        createPortalUser: true,
        portalPassword: c.portalPassword || "PortalUser123!",
      });
    }

    if (contact.type === ContactType.CUSTOMER || contact.type === ContactType.BOTH) {
      customerContacts.push(contact.id);
    }
    if (contact.type === ContactType.VENDOR || contact.type === ContactType.BOTH) {
      vendorContacts.push(contact.id);
    }
  }

  const totalUsers = await prisma.user.count();
  const totalContacts = await prisma.contact.count();
  console.log(`✓ Contacts & Users status:`);
  console.log(`  - Total Contacts in System: ${totalContacts}`);
  console.log(`  - Total Authenticated Users in System: ${totalUsers} (Admin, Accountant + Portal Users)`);

  // 10. Purchase Cycle (POs -> Confirm -> Vendor Bills -> Confirm -> Bill Payments)
  console.log("\nStep 10: Executing Complete Purchase Cycle (Accounts Payable)...");
  const timberProduct = productMap.get("RAW-TEAK-001");
  const brassProduct = productMap.get("RAW-BRASS-001");
  const velvetProduct = productMap.get("RAW-FAB-001");
  const factoryAnalytic = analyticMap.get("Jodhpur Central Woodcraft Factory");
  const sawmillAnalytic = analyticMap.get("Raw Timber Sourcing & Seasoning");

  if (!timberProduct || !brassProduct || !velvetProduct || !factoryAnalytic || !sawmillAnalytic) {
    throw new Error("Missing required raw materials or cost centers for purchase cycle.");
  }

  const existingPOCount = await prisma.purchaseOrder.count();
  let createdBillsCount = 0;
  let paidBillsCount = 0;

  for (let i = existingPOCount; i < Math.min(12, vendorContacts.length); i++) {
    const vendorId = vendorContacts[i];
    const orderDate = new Date(Date.now() - (i + 1) * 3 * 24 * 60 * 60 * 1000);

    // Create PO
    const po = await purchaseOrderService.create({
      vendorId,
      orderDate,
      createdById: adminUser.id,
      lines: [
        {
          productId: timberProduct.id,
          analyticAccountId: sawmillAnalytic.id,
          quantity: 15 + i * 2,
          unitPrice: timberProduct.cost,
        },
        {
          productId: i % 2 === 0 ? brassProduct.id : velvetProduct.id,
          analyticAccountId: factoryAnalytic.id,
          quantity: 20 + i * 5,
          unitPrice: (i % 2 === 0 ? brassProduct.cost : velvetProduct.cost),
        },
      ],
    });

    // Confirm majority of POs
    if (i < 10) {
      await purchaseOrderService.confirm(po.id);

      // Generate Vendor Bill from PO
      const bill = await vendorBillService.createFromPurchaseOrder(po.id, adminUser.id);
      createdBillsCount++;

      // Confirm Vendor Bill (creates Journal Entry #1 automatically)
      if (i < 8) {
        await vendorBillService.confirm(bill.id);

        // Record Bill Payment (creates Journal Entry #2 automatically)
        if (i < 5) {
          const payAmount = i % 2 === 0 ? new Decimal(bill.total) : new Decimal(bill.total).div(2);
          await paymentService.recordManualPayment({
            documentId: bill.id,
            documentType: "BILL",
            amount: payAmount,
            paymentMethod: i % 2 === 0 ? PaymentMethod.BANK : PaymentMethod.CASH,
            paymentDate: new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000),
            userId: adminUser.id,
            note: i % 2 === 0 ? "RTGS Settlement via HDFC Current" : "Advance Cash Payment",
          });
          paidBillsCount++;
        }
      }
    }
  }
  console.log(`✓ Purchase cycle executed: POs created, Bills generated, Payments settled.`);

  // 11. Sales Cycle (SOs -> Confirm -> Customer Invoices -> Confirm -> Invoice Payments)
  console.log("\nStep 11: Executing Complete Sales Cycle (Accounts Receivable & GST)...");
  const sofaProduct = productMap.get("FUR-LIV-001");
  const diningProduct = productMap.get("FUR-DIN-001");
  const bedProduct = productMap.get("FUR-BED-001");
  const chairProduct = productMap.get("FUR-OFF-001");
  const mumbaiAnalytic = analyticMap.get("Mumbai Flagship Experience Center");
  const blrAnalytic = analyticMap.get("Bengaluru Koramangala Studio");
  const gst18Tax = taxRateMap.get("18");
  const gst12Tax = taxRateMap.get("12");

  if (!sofaProduct || !diningProduct || !bedProduct || !chairProduct || !mumbaiAnalytic || !blrAnalytic) {
    throw new Error("Missing required finished goods or sales channels for sales cycle.");
  }

  const existingSOCount = await prisma.salesOrder.count();
  let createdInvoicesCount = 0;
  let paidInvoicesCount = 0;

  for (let i = existingSOCount; i < Math.min(20, customerContacts.length); i++) {
    const customerId = customerContacts[i];
    const orderDate = new Date(Date.now() - (i + 1) * 2 * 24 * 60 * 60 * 1000);
    const channel = i % 2 === 0 ? mumbaiAnalytic : blrAnalytic;

    // Create SO
    const so = await salesOrderService.create({
      customerId,
      orderDate,
      createdById: adminUser.id,
      lines: [
        {
          productId: i % 3 === 0 ? bedProduct.id : sofaProduct.id,
          description: "Premium handcrafted furniture",
          quantity: 1 + (i % 2),
          unitPrice: i % 3 === 0 ? bedProduct.price : sofaProduct.price,
          analyticAccountId: channel.id,
          taxRateId: gst18Tax,
        },
        {
          productId: i % 2 === 0 ? chairProduct.id : diningProduct.id,
          description: "High finish woodcraft",
          quantity: 2 + (i % 3),
          unitPrice: i % 2 === 0 ? chairProduct.price : diningProduct.price,
          analyticAccountId: channel.id,
          taxRateId: gst12Tax,
        },
      ],
    });

    // Confirm SO
    if (i < 18) {
      await salesOrderService.confirm({ id: so.id });

      // Generate Customer Invoice from SO
      const invoice = await customerInvoiceService.createFromSalesOrder(
        so.id,
        orderDate,
        new Date(orderDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        adminUser.id
      );
      createdInvoicesCount++;

      // Confirm Customer Invoice (creates Journal Entry #1 automatically)
      if (i < 15) {
        await customerInvoiceService.confirm(invoice.id, adminUser.id);

        // Record Invoice Receipt Payment (creates Journal Entry #2 automatically)
        if (i < 10) {
          const receiptAmount = i % 3 === 0 ? new Decimal(invoice.total) : new Decimal(invoice.total).mul(0.7);
          await paymentService.recordManualPayment({
            documentId: invoice.id,
            documentType: "INVOICE",
            amount: receiptAmount,
            paymentMethod: i % 2 === 0 ? PaymentMethod.BANK : PaymentMethod.CASH,
            paymentDate: new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000),
            userId: adminUser.id,
            note: i % 2 === 0 ? "Online IMPS / NEFT Customer Transfer" : "Store POS Cash Collection",
          });
          paidInvoicesCount++;
        }
      }
    }
  }
  console.log(`✓ Sales cycle executed: 20 SOs, ${createdInvoicesCount} Invoices generated, ${paidInvoicesCount} Receipts recorded.`);

  // 12. Manual General Ledger Journal Entries
  console.log("\nStep 12: Posting Manual Adjusting Journal Entries (Rent, Depreciation, Power)...");
  const rentAccount = accountMap.get("6000"); // Showroom Lease & Warehouse Rent
  const bankAccount = accountMap.get("1010"); // HDFC Bank
  const deprExpenseAccount = accountMap.get("6050"); // Depreciation Expense
  const deprAccumAccount = accountMap.get("1510"); // Accumulated Depreciation
  const powerAccount = accountMap.get("6040"); // Electricity & Power
  const cashAccount = accountMap.get("1000"); // Cash on Hand
  const hdfcJournalId = journalMap.get(JournalType.BANK);
  const cashJournalId = journalMap.get(JournalType.CASH);

  const existingManualJEs = await prisma.journalEntry.count({
    where: { source: "MANUAL" },
  });

  if (existingManualJEs === 0 && rentAccount && bankAccount && deprExpenseAccount && deprAccumAccount && powerAccount && cashAccount && hdfcJournalId && cashJournalId) {
    // 1. Showroom Rent
    const rentEntry = await journalEntryService.createManual({
      journalId: hdfcJournalId,
      accountingDate: new Date("2026-08-01"),
      reference: "RENT-MUM-AUG26",
      userId: adminUser.id,
      lines: [
        { accountId: rentAccount, debit: new Decimal(175000), credit: new Decimal(0) },
        { accountId: bankAccount, debit: new Decimal(0), credit: new Decimal(175000) },
      ],
    });
    await journalEntryService.post(rentEntry.id, adminUser.id);

    // 2. Depreciation
    const deprEntry = await journalEntryService.createManual({
      journalId: hdfcJournalId,
      accountingDate: new Date("2026-08-31"),
      reference: "DEP-MACH-AUG26",
      userId: adminUser.id,
      lines: [
        { accountId: deprExpenseAccount, debit: new Decimal(28000), credit: new Decimal(0) },
        { accountId: deprAccumAccount, debit: new Decimal(0), credit: new Decimal(28000) },
      ],
    });
    await journalEntryService.post(deprEntry.id, adminUser.id);

    // 3. Power & Utilities
    const powerEntry = await journalEntryService.createManual({
      journalId: cashJournalId,
      accountingDate: new Date("2026-08-20"),
      reference: "ELEC-JODH-AUG26",
      userId: adminUser.id,
      lines: [
        { accountId: powerAccount, debit: new Decimal(21500), credit: new Decimal(0) },
        { accountId: cashAccount, debit: new Decimal(0), credit: new Decimal(21500) },
      ],
    });
    await journalEntryService.post(powerEntry.id, adminUser.id);

    console.log("✓ Posted 3 balanced manual Journal Entries (Rent ₹1.75L, Depreciation ₹28k, Utilities ₹21.5k).");
  } else {
    console.log(`✓ Manual Journal Entries already present (${existingManualJEs} entries).`);
  }

  // 13. Budgets & Analytic Lines
  console.log("\nStep 13: Configuring FY 2026-27 Budgets with Analytic Targets...");
  const existingBudgets = await prisma.budget.count();

  if (existingBudgets === 0 && mumbaiAnalytic && factoryAnalytic && sawmillAnalytic) {
    // Budget 1: Q1 FY26 (Apr-Jun 2026) - Confirmed
    const q1Budget = await budgetService.create({
      name: "Q1 FY 2026-27 Core Operations Budget",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      responsibleId: adminUser.id,
      userId: adminUser.id,
      lines: [
        {
          analyticAccountId: mumbaiAnalytic.id,
          type: AnalyticAccountType.INCOME,
          committedAmount: new Decimal(2500000),
        },
        {
          analyticAccountId: factoryAnalytic.id,
          type: AnalyticAccountType.EXPENSES,
          committedAmount: new Decimal(1200000),
        },
        {
          analyticAccountId: sawmillAnalytic.id,
          type: AnalyticAccountType.EXPENSES,
          committedAmount: new Decimal(800000),
        },
      ],
    });
    await budgetService.confirm(q1Budget.id, adminUser.id);

    // Budget 2: Q2 FY26 (Jul-Sep 2026) - Revision chain
    const q2Original = await budgetService.create({
      name: "Q2 FY 2026-27 Festive Ramp-up Plan (Initial)",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      responsibleId: adminUser.id,
      userId: adminUser.id,
      lines: [
        {
          analyticAccountId: mumbaiAnalytic.id,
          type: AnalyticAccountType.INCOME,
          committedAmount: new Decimal(3200000),
        },
        {
          analyticAccountId: factoryAnalytic.id,
          type: AnalyticAccountType.EXPENSES,
          committedAmount: new Decimal(1500000),
        },
      ],
    });

    await budgetService.revise({
      budgetId: q2Original.id,
      name: "Q2 FY 2026-27 Festive Ramp-up Plan (Revised)",
      userId: adminUser.id,
      lines: [
        {
          analyticAccountId: mumbaiAnalytic.id,
          type: AnalyticAccountType.INCOME,
          committedAmount: new Decimal(3800000),
        },
        {
          analyticAccountId: factoryAnalytic.id,
          type: AnalyticAccountType.EXPENSES,
          committedAmount: new Decimal(1800000),
        },
      ],
    });

    console.log("✓ Budgets configured: Q1 Confirmed, Q2 Revision Chain (Original Cancelled -> Revised Confirmed).");
  } else {
    console.log(`✓ Budgets already present (${existingBudgets} budgets).`);
  }

  // Final System Inspection
  console.log("\n================================================================================");
  console.log("📊 PRODUCTION SYSTEM SEEDING SUMMARY 📊");
  console.log("================================================================================");
  const counts = {
    users: await prisma.user.count(),
    contacts: await prisma.contact.count(),
    products: await prisma.product.count(),
    categories: await prisma.productCategory.count(),
    accounts: await prisma.chartOfAccount.count(),
    journals: await prisma.journal.count(),
    analyticAccounts: await prisma.analyticAccount.count(),
    taxRates: await prisma.taxRate.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    vendorBills: await prisma.vendorBill.count(),
    billPayments: await prisma.billPayment.count(),
    salesOrders: await prisma.salesOrder.count(),
    customerInvoices: await prisma.customerInvoice.count(),
    invoicePayments: await prisma.invoicePayment.count(),
    journalEntries: await prisma.journalEntry.count(),
    journalEntryLines: await prisma.journalEntryLine.count(),
    budgets: await prisma.budget.count(),
  };

  for (const [key, val] of Object.entries(counts)) {
    console.log(`  • ${key.padEnd(22)}: ${val}`);
  }
  console.log("================================================================================");
  console.log("🎉 PRODUCTION SEEDING COMPLETED WITH ZERO ERRORS!");
  console.log("================================================================================");
}

main()
  .catch((err) => {
    console.error("❌ Seeding Pipeline Fatal Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
