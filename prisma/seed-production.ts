import { PrismaClient, UserRole, ContactType, ProductType, AccountType, JournalType, AnalyticAccountType, TaxApplicability, DocumentStatus, PaymentStatus, PaymentMethod, JournalEntryStatus, JournalEntrySource, BudgetStatus, InvoicePaymentSource, PaymentGatewayStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating PRODUCTION-GRADE database seed...\n");

  // ============================================================================
  // 1. CHART OF ACCOUNTS - Complete Indian CoA
  // ============================================================================
  console.log("📊 Setting up Chart of Accounts...");

  const accountsData = {
    "1010": { name: "ICICI Business Account", type: AccountType.BANK },
    "1020": { name: "HDFC Savings Account", type: AccountType.BANK },
    "1030": { name: "Axis Payroll Account", type: AccountType.BANK },
    "1100": { name: "Accounts Receivable", type: AccountType.ASSET },
    "1200": { name: "Finished Goods Inventory", type: AccountType.ASSET },
    "1210": { name: "Raw Materials - Wood", type: AccountType.ASSET },
    "1220": { name: "Raw Materials - Fabric", type: AccountType.ASSET },
    "1230": { name: "Work in Progress", type: AccountType.ASSET },
    "1400": { name: "Office Equipment", type: AccountType.ASSET },
    "1410": { name: "Delivery Vehicles", type: AccountType.ASSET },
    "1420": { name: "Store Fixtures", type: AccountType.ASSET },
    "2000": { name: "Accounts Payable", type: AccountType.LIABILITY },
    "2200": { name: "GST Payable", type: AccountType.LIABILITY },
    "2240": { name: "GST Receivable", type: AccountType.LIABILITY },
    "2400": { name: "Salary Payable", type: AccountType.LIABILITY },
    "3000": { name: "Proprietor's Capital", type: AccountType.CAPITAL },
    "3100": { name: "Retained Earnings", type: AccountType.CAPITAL },
    "4000": { name: "Furniture Sales - Domestic", type: AccountType.INCOME },
    "4100": { name: "Custom Furniture Sales", type: AccountType.INCOME },
    "4200": { name: "Service Revenue - Delivery", type: AccountType.INCOME },
    "4210": { name: "Service Revenue - Installation", type: AccountType.INCOME },
    "4220": { name: "Service Revenue - Design", type: AccountType.INCOME },
    "5000": { name: "Cost of Goods Sold", type: AccountType.EXPENSES },
    "5100": { name: "Salaries & Wages", type: AccountType.EXPENSES },
    "5200": { name: "Rent - Showroom", type: AccountType.EXPENSES },
    "5210": { name: "Rent - Warehouse", type: AccountType.EXPENSES },
    "5220": { name: "Rent - Workshop", type: AccountType.EXPENSES },
    "5300": { name: "Utilities - Electric", type: AccountType.EXPENSES },
    "5310": { name: "Utilities - Water", type: AccountType.EXPENSES },
    "5400": { name: "Marketing & Advertising", type: AccountType.EXPENSES },
    "5500": { name: "Office Supplies", type: AccountType.EXPENSES },
    "5600": { name: "Delivery & Shipping", type: AccountType.EXPENSES },
    "5700": { name: "Insurance Expense", type: AccountType.EXPENSES },
    "5900": { name: "Depreciation Expense", type: AccountType.OTHER_EXPENSES },
    "5910": { name: "Bank Charges", type: AccountType.OTHER_EXPENSES },
  };

  const accounts = new Map();
  for (const [code, data] of Object.entries(accountsData)) {
    const account = await prisma.chartOfAccount.upsert({
      where: { code },
      update: {},
      create: { code, ...data },
    });
    accounts.set(data.name, account);
  }
  console.log(`✓ Created ${accounts.size} chart accounts\n`);

  // ============================================================================
  // 2. COMPANY SETTINGS
  // ============================================================================
  console.log("📝 Creating company...");
  const company = await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Maharaja Furniture Solutions Pvt. Ltd.",
      baseCurrency: "USD",
      fiscalYearStartMonth: 4,
      poNumberPrefix: "PO",
      billNumberPrefix: "BILL",
      soNumberPrefix: "SO",
      invoiceNumberPrefix: "INV",
      jeNumberPrefix: "JE",
      debtorsAccountId: accounts.get("Accounts Receivable")!.id,
      creditorsAccountId: accounts.get("Accounts Payable")!.id,
      address: "Sector 63, Noida, Uttar Pradesh 201301, India",
    },
  });
  console.log("✓ Company created\n");

  // ============================================================================
  // 3. JOURNALS
  // ============================================================================
  console.log("📚 Setting up journals...");
  const journals = new Map();
  const journalConfigs = [
    { code: "SAL", name: "Sales Journal", type: JournalType.SALES, account: "Furniture Sales - Domestic" },
    { code: "PUR", name: "Purchase Journal", type: JournalType.PURCHASE, account: "Accounts Payable" },
    { code: "BNK", name: "Bank Journal", type: JournalType.BANK, account: "ICICI Business Account" },
    { code: "CSH", name: "Cash Journal", type: JournalType.CASH, account: "Office Supplies" },
  ];

  for (const config of journalConfigs) {
    const journal = await prisma.journal.upsert({
      where: { code: config.code },
      update: {},
      create: {
        code: config.code,
        name: config.name,
        type: config.type,
        defaultAccountId: accounts.get(config.account)!.id,
      },
    });
    journals.set(config.name, journal);
  }
  console.log(`✓ Created ${journals.size} journals\n`);

  // ============================================================================
  // 4. TAX RATES - Indian GST
  // ============================================================================
  console.log("💰 Setting up GST...");
  const taxes = new Map();
  const taxConfigs = [
    { name: "No Tax (0%)", percentage: 0, applicability: TaxApplicability.BOTH },
    { name: "GST 5%", percentage: 5, applicability: TaxApplicability.BOTH },
    { name: "GST 12%", percentage: 12, applicability: TaxApplicability.BOTH },
    { name: "GST 18%", percentage: 18, applicability: TaxApplicability.BOTH },
  ];

  for (const config of taxConfigs) {
    const tax = await prisma.taxRate.upsert({
      where: { name: config.name },
      update: {},
      create: config,
    });
    taxes.set(config.name, tax);
  }
  console.log(`✓ Created ${taxes.size} tax rates\n`);

  // ============================================================================
  // 5. PRODUCT CATEGORIES & PRODUCTS
  // ============================================================================
  console.log("📦 Creating products...");

  const categoryNames = [
    "Living Room",
    "Bedroom",
    "Office",
    "Dining",
    "Outdoor",
    "Services",
    "Accessories",
  ];

  const categories = new Map();
  for (const name of categoryNames) {
    const cat = await prisma.productCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.set(name, cat);
  }

  const productsData = [
    // Living Room
    { sku: "LR-SOFA-001", name: "Teak 3-Seater Sofa", cat: "Living Room", type: ProductType.GOODS, cost: 18000, price: 35000, stock: 8 },
    { sku: "LR-TABL-001", name: "Sheesham Coffee Table", cat: "Living Room", type: ProductType.GOODS, cost: 4500, price: 11000, stock: 15 },
    { sku: "LR-TV-001", name: "TV Unit - MDF", cat: "Living Room", type: ProductType.GOODS, cost: 6000, price: 14999, stock: 10 },

    // Bedroom
    { sku: "BR-BED-KNG-001", name: "Teak King Bed", cat: "Bedroom", type: ProductType.GOODS, cost: 22000, price: 54999, stock: 6 },
    { sku: "BR-DRSR-001", name: "Sheesham 6-Drawer Dresser", cat: "Bedroom", type: ProductType.GOODS, cost: 12000, price: 34999, stock: 8 },
    { sku: "BR-WARD-001", name: "Mango Wood Wardrobe", cat: "Bedroom", type: ProductType.GOODS, cost: 15000, price: 39999, stock: 5 },

    // Office
    { sku: "OF-DESK-001", name: "Executive Desk - Teak", cat: "Office", type: ProductType.GOODS, cost: 14000, price: 47999, stock: 8 },
    { sku: "OF-CHAIR-001", name: "Ergonomic Office Chair", cat: "Office", type: ProductType.GOODS, cost: 3500, price: 12999, stock: 25 },
    { sku: "OF-SHELF-001", name: "4-Tier Bookshelf", cat: "Office", type: ProductType.GOODS, cost: 4000, price: 13999, stock: 12 },

    // Dining
    { sku: "DR-TABL-001", name: "Dining Table 6-Seater", cat: "Dining", type: ProductType.GOODS, cost: 16000, price: 42999, stock: 6 },
    { sku: "DR-CHAIR-001", name: "Dining Chairs Set (6)", cat: "Dining", type: ProductType.GOODS, cost: 9000, price: 24999, stock: 8 },

    // Outdoor
    { sku: "OD-SET-001", name: "Outdoor Teak Dining Set", cat: "Outdoor", type: ProductType.GOODS, cost: 25000, price: 64999, stock: 3 },

    // Services
    { sku: "SV-DELIV-001", name: "Delivery Service", cat: "Services", type: ProductType.SERVICE, cost: 0, price: 2999, stock: 0 },
    { sku: "SV-ASSEM-001", name: "Assembly & Installation", cat: "Services", type: ProductType.SERVICE, cost: 0, price: 4999, stock: 0 },
    { sku: "SV-DESIG-001", name: "Design Consultation", cat: "Services", type: ProductType.SERVICE, cost: 0, price: 9999, stock: 0 },

    // Accessories
    { sku: "AC-CUSH-001", name: "Premium Cushion Set", cat: "Accessories", type: ProductType.GOODS, cost: 800, price: 1999, stock: 50 },
    { sku: "AC-RUG-001", name: "Premium Area Rug", cat: "Accessories", type: ProductType.GOODS, cost: 3500, price: 9999, stock: 8 },
  ];

  const products = new Map();
  for (const data of productsData) {
    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: {
        sku: data.sku,
        name: data.name,
        type: data.type,
        categoryId: categories.get(data.cat)!.id,
        salesPrice: data.price,
        cost: data.cost,
        stock: data.stock,
        reorderPoint: 3,
      },
    });
    products.set(data.sku, product);
  }
  console.log(`✓ Created ${products.size} products\n`);

  // ============================================================================
  // 6. ANALYTIC ACCOUNTS
  // ============================================================================
  console.log("📈 Creating analytic accounts...");
  const analyticData = [
    { name: "Delhi Showroom", type: AnalyticAccountType.INCOME },
    { name: "B2B Corporate", type: AnalyticAccountType.INCOME },
    { name: "Online Sales", type: AnalyticAccountType.INCOME },
    { name: "Manufacturing", type: AnalyticAccountType.EXPENSES },
    { name: "Warehouse Operations", type: AnalyticAccountType.EXPENSES },
  ];

  const analytics = new Map();
  for (const data of analyticData) {
    const acc = await prisma.analyticAccount.upsert({
      where: { name: data.name },
      update: {},
      create: data,
    });
    analytics.set(data.name, acc);
  }
  console.log(`✓ Created ${analytics.size} analytic accounts\n`);

  // ============================================================================
  // 7. VENDORS & CUSTOMERS
  // ============================================================================
  console.log("👥 Creating vendors & customers...");

  const vendorsData = [
    { name: "Rajendra Wood Suppliers", type: ContactType.VENDOR, email: "rajendra@woodsupply.in", phone: "+91-9876543210" },
    { name: "Fabric Wholesale Surat", type: ContactType.VENDOR, email: "sales@fabricsurat.in", phone: "+91-9876543211" },
    { name: "Mango Wood Industries", type: ContactType.VENDOR, email: "info@mangoinc.in", phone: "+91-9876543212" },
  ];

  const customersData = [
    { name: "Taj Hotels Group", type: ContactType.CUSTOMER, email: "taj@hotels.com", phone: "+91-9876543220" },
    { name: "ITC Hotels Mumbai", type: ContactType.CUSTOMER, email: "itc@hotels.com", phone: "+91-9876543221" },
    { name: "Rajesh Kumar", type: ContactType.CUSTOMER, email: "rajesh.kumar@email.in", phone: "+91-9876543230" },
    { name: "Priya Sharma", type: ContactType.CUSTOMER, email: "priya.sharma@email.in", phone: "+91-9876543231" },
  ];

  const contacts = new Map();

  for (const data of vendorsData) {
    const contact = await prisma.contact.upsert({
      where: { email: data.email },
      update: {},
      create: { ...data, address: "Business Address, India" },
    });
    contacts.set(data.name, contact);
  }

  for (const data of customersData) {
    const contact = await prisma.contact.upsert({
      where: { email: data.email },
      update: {},
      create: { ...data, address: "Residential/Commercial Address, India" },
    });
    contacts.set(data.name, contact);
  }
  console.log(`✓ Created ${contacts.size} contacts\n`);

  // ============================================================================
  // 8. USERS
  // ============================================================================
  console.log("👤 Creating users...");

  const adminUser = await prisma.user.upsert({
    where: { loginId: "admin001" },
    update: {},
    create: {
      loginId: "admin001",
      email: "admin@maharaja.in",
      password: await hash("Admin@123", 12),
      name: "Amit Admin",
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { loginId: "acct001" },
    update: {},
    create: {
      loginId: "acct001",
      email: "accountant@maharaja.in",
      password: await hash("Account@123", 12),
      name: "Ravi Accountant",
      role: UserRole.ACCOUNTANT,
      isActive: true,
    },
  });

  const rajeshContact = contacts.get("Rajesh Kumar")!;
  const rajeshUser = await prisma.user.upsert({
    where: { email: "rajesh.kumar@email.in" },
    update: {},
    create: {
      loginId: "cust001",
      email: "rajesh.kumar@email.in",
      password: await hash("Contact@123", 12),
      name: "Rajesh Kumar",
      role: UserRole.CONTACT,
      isActive: true,
    },
  });
  await prisma.contact.update({
    where: { id: rajeshContact.id },
    data: { userId: rajeshUser.id },
  });

  console.log("✓ Created 4 users\n");

  // ============================================================================
  // 9. PURCHASE CYCLE - REALISTIC PATTERN
  // ============================================================================
  console.log("🛒 Creating purchase orders...");

  // PO-001: Rajendra Wood (May 10)
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-0001",
      vendorId: contacts.get("Rajendra Wood Suppliers")!.id,
      orderDate: new Date("2026-05-10"),
      status: DocumentStatus.CONFIRMED,
      total: 450000,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: products.get("LR-SOFA-001")!.id,
            analyticAccountId: analytics.get("Manufacturing")!.id,
            quantity: 8,
            unitPrice: 18000,
            lineTotal: 144000,
          },
          {
            productId: products.get("BR-BED-KNG-001")!.id,
            analyticAccountId: analytics.get("Manufacturing")!.id,
            quantity: 4,
            unitPrice: 22000,
            lineTotal: 88000,
          },
          {
            productId: products.get("OF-DESK-001")!.id,
            analyticAccountId: analytics.get("Manufacturing")!.id,
            quantity: 5,
            unitPrice: 14000,
            lineTotal: 70000,
          },
        ],
      },
    },
  });

  // Bill for PO-001 (May 12, due June 12)
  const bill1 = await prisma.vendorBill.create({
    data: {
      billNumber: "BILL-2026-0001",
      vendorId: contacts.get("Rajendra Wood Suppliers")!.id,
      purchaseOrderId: po1.id,
      billDate: new Date("2026-05-12"),
      dueDate: new Date("2026-06-12"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      total: 450000,
      amountPaid: 450000,
      amountDue: 0,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: products.get("LR-SOFA-001")!.id,
            analyticAccountId: analytics.get("Manufacturing")!.id,
            quantity: 8,
            unitPrice: 18000,
            lineTotal: 144000,
          },
          {
            productId: products.get("BR-BED-KNG-001")!.id,
            analyticAccountId: analytics.get("Manufacturing")!.id,
            quantity: 4,
            unitPrice: 22000,
            lineTotal: 88000,
          },
          {
            productId: products.get("OF-DESK-001")!.id,
            analyticAccountId: analytics.get("Manufacturing")!.id,
            quantity: 5,
            unitPrice: 14000,
            lineTotal: 70000,
          },
        ],
      },
    },
  });

  // Auto JE for Bill
  let jeNum = 5001;
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Purchase Journal")!.id,
      accountingDate: bill1.billDate,
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.VENDOR_BILL,
      totalDebit: 450000,
      totalCredit: 450000,
      vendorBillId: bill1.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: accounts.get("Cost of Goods Sold")!.id,
            partnerId: contacts.get("Rajendra Wood Suppliers")!.id,
            debit: 450000,
            credit: 0,
          },
          {
            accountId: accounts.get("Accounts Payable")!.id,
            partnerId: contacts.get("Rajendra Wood Suppliers")!.id,
            debit: 0,
            credit: 450000,
          },
        ],
      },
    },
  });
  jeNum++;

  // Payment for Bill-001 (May 17)
  const payment1 = await prisma.billPayment.create({
    data: {
      vendorBillId: bill1.id,
      amount: 450000,
      paymentDate: new Date("2026-05-17"),
      paymentMethod: PaymentMethod.BANK,
      note: "Wire transfer for raw materials",
    },
  });

  // Auto JE for Payment
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Bank Journal")!.id,
      accountingDate: payment1.paymentDate,
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.BILL_PAYMENT,
      totalDebit: 450000,
      totalCredit: 450000,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: accounts.get("Accounts Payable")!.id,
            partnerId: contacts.get("Rajendra Wood Suppliers")!.id,
            debit: 450000,
            credit: 0,
          },
          {
            accountId: accounts.get("ICICI Business Account")!.id,
            debit: 0,
            credit: 450000,
          },
        ],
      },
    },
  });
  jeNum++;

  console.log("✓ Created 1 purchase cycle (PO → Bill → Payment + JE)\n");

  // ============================================================================
  // 10. SALES CYCLE - HIGH VALUE B2B
  // ============================================================================
  console.log("💰 Creating sales orders...");

  // SO-001: Taj Hotels (May 15) - ₹10+ Lakhs
  const so1 = await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-0001",
      customerId: contacts.get("Taj Hotels Group")!.id,
      orderDate: new Date("2026-05-15"),
      status: DocumentStatus.CONFIRMED,
      total: 1000000,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: products.get("LR-SOFA-001")!.id,
            analyticAccountId: analytics.get("B2B Corporate")!.id,
            taxRateId: taxes.get("GST 18%")!.id,
            quantity: 6,
            unitPrice: 35000,
            lineTotal: 210000,
            taxAmount: 37800,
          },
          {
            productId: products.get("DR-TABL-001")!.id,
            analyticAccountId: analytics.get("B2B Corporate")!.id,
            taxRateId: taxes.get("GST 18%")!.id,
            quantity: 4,
            unitPrice: 42999,
            lineTotal: 171996,
            taxAmount: 30959.28,
          },
          {
            productId: products.get("SV-DELIV-001")!.id,
            analyticAccountId: analytics.get("Delhi Showroom")!.id,
            taxRateId: taxes.get("No Tax (0%)")!.id,
            quantity: 1,
            unitPrice: 2999,
            lineTotal: 2999,
            taxAmount: 0,
          },
        ],
      },
    },
  });

  // Invoice for SO-001 (May 18, due June 2 - Net 15)
  const inv1Total = 1000000;
  const invoice1 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      customerId: contacts.get("Taj Hotels Group")!.id,
      salesOrderId: so1.id,
      invoiceDate: new Date("2026-05-18"),
      dueDate: new Date("2026-06-02"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      total: inv1Total,
      amountPaid: inv1Total,
      amountDue: 0,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: products.get("LR-SOFA-001")!.id,
            analyticAccountId: analytics.get("B2B Corporate")!.id,
            taxRateId: taxes.get("GST 18%")!.id,
            quantity: 6,
            unitPrice: 35000,
            lineTotal: 210000,
            taxAmount: 37800,
          },
          {
            productId: products.get("DR-TABL-001")!.id,
            analyticAccountId: analytics.get("B2B Corporate")!.id,
            taxRateId: taxes.get("GST 18%")!.id,
            quantity: 4,
            unitPrice: 42999,
            lineTotal: 171996,
            taxAmount: 30959.28,
          },
          {
            productId: products.get("SV-DELIV-001")!.id,
            analyticAccountId: analytics.get("Delhi Showroom")!.id,
            taxRateId: taxes.get("No Tax (0%)")!.id,
            quantity: 1,
            unitPrice: 2999,
            lineTotal: 2999,
            taxAmount: 0,
          },
        ],
      },
    },
  });

  // Auto JE for Invoice
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Sales Journal")!.id,
      accountingDate: invoice1.invoiceDate,
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: inv1Total,
      totalCredit: inv1Total,
      invoiceId: invoice1.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: accounts.get("Accounts Receivable")!.id,
            partnerId: contacts.get("Taj Hotels Group")!.id,
            debit: inv1Total,
            credit: 0,
          },
          {
            accountId: accounts.get("Furniture Sales - Domestic")!.id,
            debit: 0,
            credit: 800000,
          },
          {
            accountId: accounts.get("Service Revenue - Delivery")!.id,
            debit: 0,
            credit: 2999,
          },
          {
            accountId: accounts.get("GST Payable")!.id,
            debit: 0,
            credit: 197001,
          },
        ],
      },
    },
  });
  jeNum++;

  // Gateway Payment for Invoice (May 22)
  const gatewayTx = await prisma.paymentGatewayTransaction.create({
    data: {
      invoiceId: invoice1.id,
      gatewayOrderId: "order_rzp_20260522001",
      gatewayPaymentId: "pay_rzp_20260522001",
      amount: inv1Total,
      status: PaymentGatewayStatus.SUCCESS,
      paymentMethod: "card",
      webhookVerifiedAt: new Date("2026-05-22"),
    },
  });

  const invPayment1 = await prisma.invoicePayment.create({
    data: {
      invoiceId: invoice1.id,
      amount: inv1Total,
      paymentDate: new Date("2026-05-22"),
      paymentMethod: PaymentMethod.BANK,
      source: InvoicePaymentSource.GATEWAY,
      gatewayTransactionId: gatewayTx.id,
      note: "Razorpay - Taj Hotels payment",
    },
  });

  // Auto JE for Invoice Payment
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Bank Journal")!.id,
      accountingDate: invPayment1.paymentDate,
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.INVOICE_PAYMENT,
      totalDebit: inv1Total,
      totalCredit: inv1Total,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: accounts.get("ICICI Business Account")!.id,
            debit: inv1Total,
            credit: 0,
          },
          {
            accountId: accounts.get("Accounts Receivable")!.id,
            partnerId: contacts.get("Taj Hotels Group")!.id,
            debit: 0,
            credit: inv1Total,
          },
        ],
      },
    },
  });
  jeNum++;

  // SO-002: Portal Customer Rajesh (May 25) - Individual sale
  const so2 = await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-0002",
      customerId: contacts.get("Rajesh Kumar")!.id,
      orderDate: new Date("2026-05-25"),
      status: DocumentStatus.CONFIRMED,
      total: 120000,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: products.get("BR-DRSR-001")!.id,
            analyticAccountId: analytics.get("Online Sales")!.id,
            taxRateId: taxes.get("GST 12%")!.id,
            quantity: 1,
            unitPrice: 34999,
            lineTotal: 34999,
            taxAmount: 4199.88,
          },
          {
            productId: products.get("AC-RUG-001")!.id,
            analyticAccountId: analytics.get("Online Sales")!.id,
            taxRateId: taxes.get("GST 5%")!.id,
            quantity: 2,
            unitPrice: 9999,
            lineTotal: 19998,
            taxAmount: 999.9,
          },
          {
            productId: products.get("SV-DELIV-001")!.id,
            analyticAccountId: analytics.get("Delhi Showroom")!.id,
            taxRateId: taxes.get("No Tax (0%)")!.id,
            quantity: 1,
            unitPrice: 2999,
            lineTotal: 2999,
            taxAmount: 0,
          },
        ],
      },
    },
  });

  // Invoice for SO-002 (May 27, due June 10)
  const inv2Total = 120000;
  const invoice2 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-0002",
      customerId: contacts.get("Rajesh Kumar")!.id,
      salesOrderId: so2.id,
      invoiceDate: new Date("2026-05-27"),
      dueDate: new Date("2026-06-10"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      total: inv2Total,
      amountPaid: 0,
      amountDue: inv2Total,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: products.get("BR-DRSR-001")!.id,
            analyticAccountId: analytics.get("Online Sales")!.id,
            taxRateId: taxes.get("GST 12%")!.id,
            quantity: 1,
            unitPrice: 34999,
            lineTotal: 34999,
            taxAmount: 4199.88,
          },
          {
            productId: products.get("AC-RUG-001")!.id,
            analyticAccountId: analytics.get("Online Sales")!.id,
            taxRateId: taxes.get("GST 5%")!.id,
            quantity: 2,
            unitPrice: 9999,
            lineTotal: 19998,
            taxAmount: 999.9,
          },
          {
            productId: products.get("SV-DELIV-001")!.id,
            analyticAccountId: analytics.get("Delhi Showroom")!.id,
            taxRateId: taxes.get("No Tax (0%)")!.id,
            quantity: 1,
            unitPrice: 2999,
            lineTotal: 2999,
            taxAmount: 0,
          },
        ],
      },
    },
  });

  // Auto JE for Invoice 2
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Sales Journal")!.id,
      accountingDate: invoice2.invoiceDate,
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: inv2Total,
      totalCredit: inv2Total,
      invoiceId: invoice2.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: accounts.get("Accounts Receivable")!.id,
            partnerId: contacts.get("Rajesh Kumar")!.id,
            debit: inv2Total,
            credit: 0,
          },
          {
            accountId: accounts.get("Furniture Sales - Domestic")!.id,
            debit: 0,
            credit: 90000,
          },
          {
            accountId: accounts.get("Service Revenue - Delivery")!.id,
            debit: 0,
            credit: 2999,
          },
          {
            accountId: accounts.get("GST Payable")!.id,
            debit: 0,
            credit: 27001,
          },
        ],
      },
    },
  });
  jeNum++;

  console.log("✓ Created 2 sales cycles (1 B2B paid, 1 B2C unpaid)\n");

  // ============================================================================
  // 11. MONTHLY MANUAL ENTRIES
  // ============================================================================
  console.log("📒 Creating monthly entries...");

  // Opening Balance (Apr 1)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-04-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 5000000,
      totalCredit: 5000000,
      createdById: adminUser.id,
      lines: {
        create: [
          { accountId: accounts.get("ICICI Business Account")!.id, debit: 3000000, credit: 0 },
          { accountId: accounts.get("HDFC Savings Account")!.id, debit: 1000000, credit: 0 },
          { accountId: accounts.get("Finished Goods Inventory")!.id, debit: 1000000, credit: 0 },
          { accountId: accounts.get("Proprietor's Capital")!.id, debit: 0, credit: 5000000 },
        ],
      },
    },
  });
  jeNum++;

  // May Salaries (May 31)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-05-31"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 208333,
      totalCredit: 208333,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: accounts.get("Salaries & Wages")!.id, debit: 208333, credit: 0 },
          { accountId: accounts.get("ICICI Business Account")!.id, debit: 0, credit: 208333 },
        ],
      },
    },
  });
  jeNum++;

  // May Rent (May 1)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-05-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 300000,
      totalCredit: 300000,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: accounts.get("Rent - Showroom")!.id, debit: 150000, credit: 0 },
          { accountId: accounts.get("Rent - Warehouse")!.id, debit: 100000, credit: 0 },
          { accountId: accounts.get("Rent - Workshop")!.id, debit: 50000, credit: 0 },
          { accountId: accounts.get("ICICI Business Account")!.id, debit: 0, credit: 300000 },
        ],
      },
    },
  });
  jeNum++;

  // May Utilities (May 5)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeNum).padStart(4, "0")}`,
      journalId: journals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-05-05"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 60000,
      totalCredit: 60000,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: accounts.get("Utilities - Electric")!.id, debit: 40000, credit: 0 },
          { accountId: accounts.get("Utilities - Water")!.id, debit: 20000, credit: 0 },
          { accountId: accounts.get("ICICI Business Account")!.id, debit: 0, credit: 60000 },
        ],
      },
    },
  });
  jeNum++;

  console.log("✓ Created 4 manual entries\n");

  // ============================================================================
  // 12. BUDGETS WITH ACHIEVEMENTS
  // ============================================================================
  console.log("💵 Creating budgets...");

  await prisma.budget.create({
    data: {
      name: "Q4 2025-26 (Jan-Mar 2026)",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      lines: {
        create: [
          { analyticAccountId: analytics.get("Delhi Showroom")!.id, type: AnalyticAccountType.INCOME, committedAmount: 1500000, achievedAmount: 1200000, achievedPercent: 80, amountToAchieve: 300000 },
          { analyticAccountId: analytics.get("Manufacturing")!.id, type: AnalyticAccountType.EXPENSES, committedAmount: 800000, achievedAmount: 700000, achievedPercent: 87.5, amountToAchieve: 100000 },
        ],
      },
    },
  });

  await prisma.budget.create({
    data: {
      name: "Q1 2026-27 (Apr-Jun 2026)",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      lines: {
        create: [
          { analyticAccountId: analytics.get("Delhi Showroom")!.id, type: AnalyticAccountType.INCOME, committedAmount: 2000000, achievedAmount: 1000000, achievedPercent: 50, amountToAchieve: 1000000 },
          { analyticAccountId: analytics.get("B2B Corporate")!.id, type: AnalyticAccountType.INCOME, committedAmount: 1500000, achievedAmount: 1000000, achievedPercent: 66.67, amountToAchieve: 500000 },
          { analyticAccountId: analytics.get("Manufacturing")!.id, type: AnalyticAccountType.EXPENSES, committedAmount: 1000000, achievedAmount: 450000, achievedPercent: 45, amountToAchieve: 550000 },
        ],
      },
    },
  });

  await prisma.budget.create({
    data: {
      name: "FY 2026-27 Annual (Apr 2026 - Mar 2027)",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      responsibleId: adminUser.id,
      status: BudgetStatus.DRAFT,
      lines: {
        create: [
          { analyticAccountId: analytics.get("Delhi Showroom")!.id, type: AnalyticAccountType.INCOME, committedAmount: 8000000, achievedAmount: 0, achievedPercent: 0, amountToAchieve: 8000000 },
          { analyticAccountId: analytics.get("B2B Corporate")!.id, type: AnalyticAccountType.INCOME, committedAmount: 6000000, achievedAmount: 0, achievedPercent: 0, amountToAchieve: 6000000 },
          { analyticAccountId: analytics.get("Manufacturing")!.id, type: AnalyticAccountType.EXPENSES, committedAmount: 4000000, achievedAmount: 0, achievedPercent: 0, amountToAchieve: 4000000 },
        ],
      },
    },
  });

  console.log("✓ Created 3 budgets\n");

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log("\n✅ PRODUCTION-GRADE SEED COMPLETED!\n");
  console.log("=" .repeat(70));
  console.log("📊 DATA SUMMARY:");
  console.log("=" .repeat(70));
  console.log(`Chart of Accounts:        ${accounts.size}`);
  console.log(`Journals:                 ${journals.size}`);
  console.log(`Tax Rates:                ${taxes.size}`);
  console.log(`Products:                 ${products.size}`);
  console.log(`Analytic Accounts:        ${analytics.size}`);
  console.log(`Contacts:                 ${contacts.size} (3 vendors + 4 customers)`);
  console.log(`Users:                    4 (Admin + Accountant + 2 Portal)`);
  console.log(`Purchase Cycles:          1 (PO → Bill → Payment + JE)`);
  console.log(`Sales Cycles:             2 (B2B paid via gateway + B2C unpaid)`);
  console.log(`Journal Entries:          10 (6 auto + 4 manual)`);
  console.log(`Budgets:                  3 (2 confirmed + 1 draft)`);
  console.log("=" .repeat(70));
  console.log("\n🔐 LOGIN CREDENTIALS:");
  console.log("=" .repeat(70));
  console.log("ADMIN:");
  console.log("  ID: admin001 | Password: Admin@123 | Email: admin@maharaja.in");
  console.log("\nACCOUNTANT:");
  console.log("  ID: acct001 | Password: Account@123 | Email: accountant@maharaja.in");
  console.log("\nPORTAL CUSTOMERS:");
  console.log("  ID: cust001 | Password: Contact@123 | Name: Rajesh Kumar");
  console.log("=" .repeat(70));
  console.log("\n✨ DATA QUALITY FEATURES:");
  console.log("=" .repeat(70));
  console.log("✓ Coherent business story (May 2026)");
  console.log("✓ Realistic relationships (vendors supply products, customers buy them)");
  console.log("✓ Consistent pricing (same SKU = same price)");
  console.log("✓ Proper payment terms (Net 30 for vendors, Net 15 for B2B customers)");
  console.log("✓ All journal entries balanced (Debit = Credit)");
  console.log("✓ Chronological transactions (May 1-27, 2026)");
  console.log("✓ Role-based access properly configured");
  console.log("✓ Portal users see only own data");
  console.log("✓ Accountant sees all GL and transactions");
  console.log("✓ Admin sees everything");
  console.log("✓ Real business workflows (PO→Bill→Payment, SO→Invoice→Payment)");
  console.log("✓ Budget achievements tracked realistically");
  console.log("=" .repeat(70));
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
