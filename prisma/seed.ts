import {
  PrismaClient,
  UserRole,
  ContactType,
  ProductType,
  AccountType,
  JournalType,
  AnalyticAccountType,
  TaxApplicability,
  DocumentStatus,
  PaymentStatus,
  PaymentMethod,
  JournalEntryStatus,
  JournalEntrySource,
  BudgetStatus,
  InvoicePaymentSource,
  PaymentGatewayStatus,
  EmailReminderType,
  EmailDeliveryStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Helper to format 2-digit numbers
const pad2 = (n: number) => String(n).padStart(2, "0");
const pad4 = (n: number) => String(n).padStart(4, "0");

/**
 * Clean all tables in reverse foreign key order for a guaranteed idempotent run
 */
async function cleanDatabase() {
  console.log("🧹 Cleaning existing database records in dependency order...");

  // 1. Audit Logs & Webhooks
  await prisma.billEmailLog.deleteMany();
  await prisma.invoiceEmailLog.deleteMany();
  await prisma.paymentGatewayTransaction.deleteMany();

  // 2. Double-entry Journal & Payments
  await prisma.journalEntryLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.invoicePayment.deleteMany();
  await prisma.billPayment.deleteMany();

  // 3. Invoices & Vendor Bills
  await prisma.customerInvoiceLine.deleteMany();
  await prisma.customerInvoice.deleteMany();
  await prisma.vendorBillLine.deleteMany();
  await prisma.vendorBill.deleteMany();

  // 4. Sales Orders & Purchase Orders
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();

  // 5. Budgets
  await prisma.budgetLine.deleteMany();
  // Clear self-relations on budget before deleting
  await prisma.budget.updateMany({ data: { revisionOfId: null, revisedWithId: null } });
  await prisma.budget.deleteMany();

  // 6. Products & Categories
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();

  // 7. Master Configurations
  await prisma.taxRate.deleteMany();
  await prisma.analyticAccount.deleteMany();
  await prisma.journal.deleteMany();
  await prisma.companySettings.deleteMany();

  // 8. Contacts & Users & Accounts
  await prisma.contact.updateMany({ data: { userId: null } });
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.chartOfAccount.deleteMany();

  console.log("✓ All previous records cleaned cleanly.\n");
}

async function main() {
  console.log("===============================================================");
  console.log("🚀 STARTING COMPREHENSIVE CLEAN SEEDING FOR LEDGERONE ERP");
  console.log("===============================================================\n");

  await cleanDatabase();

  // S3 Banner presets from lib/constants/profile-banners.ts
  const banners = [
    "http://10.120.27.85:4566/odoohackathon/presets/banner-01.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-02.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-03.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-04.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-05.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-06.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-07.jpg",
    "http://10.120.27.85:4566/odoohackathon/presets/banner-08.jpg",
  ];

  // ============================================================================
  // 1. CHART OF ACCOUNTS (All 8 AccountType values covered)
  // ============================================================================
  console.log("📊 1. Creating Complete Indian Chart of Accounts...");
  const chartOfAccountsData = [
    // 1. CASH
    { code: "1000", name: "Petty Cash", type: AccountType.CASH },

    // 2. BANK
    { code: "1010", name: "Main ICICI Business Current Account", type: AccountType.BANK },
    { code: "1020", name: "HDFC Operational Account", type: AccountType.BANK },
    { code: "1030", name: "Axis Payroll Reserve Account", type: AccountType.BANK },

    // 3. ASSET
    { code: "1100", name: "Accounts Receivable (Trade Debtors)", type: AccountType.ASSET },
    { code: "1200", name: "Finished Goods - Furniture Inventory", type: AccountType.ASSET },
    { code: "1210", name: "Raw Materials - Hardwood & Teak", type: AccountType.ASSET },
    { code: "1220", name: "Raw Materials - Fabrics & Leather", type: AccountType.ASSET },
    { code: "1230", name: "Work in Progress", type: AccountType.ASSET },
    { code: "1300", name: "Prepaid Showroom Rent & Insurance", type: AccountType.ASSET },
    { code: "1400", name: "Manufacturing Equipment & Machinery", type: AccountType.ASSET },
    { code: "1410", name: "Delivery Trucks & Fleets", type: AccountType.ASSET },
    { code: "1420", name: "Showroom Fixtures & Display Fittings", type: AccountType.ASSET },
    { code: "1430", name: "IT Hardware & Server Infrastructure", type: AccountType.ASSET },

    // 4. LIABILITY
    { code: "2000", name: "Accounts Payable (Trade Creditors)", type: AccountType.LIABILITY },
    { code: "2100", name: "Corporate Credit Card Payable", type: AccountType.LIABILITY },
    { code: "2200", name: "GST Payable (Central & State)", type: AccountType.LIABILITY },
    { code: "2210", name: "IGST Payable", type: AccountType.LIABILITY },
    { code: "2220", name: "CGST Output Liability", type: AccountType.LIABILITY },
    { code: "2230", name: "SGST Output Liability", type: AccountType.LIABILITY },
    { code: "2240", name: "GST Input Credit Receivable", type: AccountType.LIABILITY },
    { code: "2300", name: "Working Capital Term Loan", type: AccountType.LIABILITY },
    { code: "2400", name: "Salaries and Wages Payable", type: AccountType.LIABILITY },

    // 5. CAPITAL
    { code: "3000", name: "Proprietor's Capital / Share Capital", type: AccountType.CAPITAL },
    { code: "3100", name: "Retained Earnings", type: AccountType.CAPITAL },
    { code: "3200", name: "Current Year Reserves", type: AccountType.CAPITAL },

    // 6. INCOME
    { code: "4000", name: "Furniture Sales - Domestic Retail", type: AccountType.INCOME },
    { code: "4100", name: "B2B Corporate & Hospitality Sales", type: AccountType.INCOME },
    { code: "4200", name: "Custom Modular Furniture Orders", type: AccountType.INCOME },
    { code: "4300", name: "Delivery & Logistics Revenue", type: AccountType.INCOME },
    { code: "4310", name: "Assembly & White-Glove Installation", type: AccountType.INCOME },
    { code: "4320", name: "Interior Architectural Design Fees", type: AccountType.INCOME },
    { code: "4400", name: "Annual Maintenance & Warranty Contracts", type: AccountType.INCOME },

    // 7. EXPENSES
    { code: "5000", name: "Cost of Goods Sold - Finished Goods", type: AccountType.EXPENSES },
    { code: "5010", name: "Cost of Raw Timber & Metals", type: AccountType.EXPENSES },
    { code: "5020", name: "Direct Manufacturing Labour", type: AccountType.EXPENSES },
    { code: "5100", name: "Staff Salaries & Wages", type: AccountType.EXPENSES },
    { code: "5110", name: "Employee Health & Statutory Benefits", type: AccountType.EXPENSES },
    { code: "5200", name: "Showroom Lease & Rent", type: AccountType.EXPENSES },
    { code: "5210", name: "Central Warehouse Lease", type: AccountType.EXPENSES },
    { code: "5220", name: "Manufacturing Workshop Rent", type: AccountType.EXPENSES },
    { code: "5300", name: "Utilities - Electricity", type: AccountType.EXPENSES },
    { code: "5310", name: "Utilities - Water & Facilities", type: AccountType.EXPENSES },
    { code: "5320", name: "High-Speed Internet & Telecom", type: AccountType.EXPENSES },
    { code: "5400", name: "Marketing & Digital Advertising", type: AccountType.EXPENSES },
    { code: "5500", name: "Office Stationery & Supplies", type: AccountType.EXPENSES },
    { code: "5600", name: "Delivery Logistics & Fuel", type: AccountType.EXPENSES },
    { code: "5700", name: "Comprehensive Asset Insurance", type: AccountType.EXPENSES },

    // 8. OTHER_EXPENSES
    { code: "5900", name: "Depreciation & Amortization Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5910", name: "Bank Charges & Gateway Processing Fees", type: AccountType.OTHER_EXPENSES },
    { code: "5920", name: "Commercial Loan Interest Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5930", name: "Foreign Exchange & Discrepancy Loss", type: AccountType.OTHER_EXPENSES },
  ];

  const accountsMap = new Map<string, any>();
  for (const acc of chartOfAccountsData) {
    const created = await prisma.chartOfAccount.create({ data: acc });
    accountsMap.set(acc.name, created);
    accountsMap.set(acc.code, created);
  }
  console.log(`✓ Created ${chartOfAccountsData.length} Chart of Account items.`);

  // ============================================================================
  // 2. COMPANY SETTINGS
  // ============================================================================
  console.log("🏢 2. Creating Company Settings...");
  const companySettings = await prisma.companySettings.create({
    data: {
      id: "default",
      companyName: "Maharaja Furniture Solutions Pvt. Ltd.",
      logo: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80",
      address: "Plot 42, Sector 63, Noida Electronic City, Uttar Pradesh 201301, India",
      baseCurrency: "USD",
      fiscalYearStartMonth: 4, // April (Indian Financial Year)
      poNumberPrefix: "PO",
      billNumberPrefix: "BILL",
      soNumberPrefix: "SO",
      invoiceNumberPrefix: "INV",
      jeNumberPrefix: "JE",
      debtorsAccountId: accountsMap.get("1100")!.id,
      creditorsAccountId: accountsMap.get("2000")!.id,
    },
  });
  console.log("✓ Created Company Settings for Maharaja Furniture Solutions.");

  // ============================================================================
  // 3. JOURNALS (All 4 JournalType values covered)
  // ============================================================================
  console.log("📚 3. Creating Journals...");
  const journalsData = [
    { code: "SAL", name: "Customer Sales Journal", type: JournalType.SALES, defaultAccountId: accountsMap.get("4000")!.id },
    { code: "PUR", name: "Vendor Purchases Journal", type: JournalType.PURCHASE, defaultAccountId: accountsMap.get("2000")!.id },
    { code: "BNK", name: "ICICI Bank Operations Journal", type: JournalType.BANK, defaultAccountId: accountsMap.get("1010")!.id },
    { code: "CSH", name: "Daily Petty Cash Journal", type: JournalType.CASH, defaultAccountId: accountsMap.get("1000")!.id },
  ];

  const journalsMap = new Map<string, any>();
  for (const j of journalsData) {
    const created = await prisma.journal.create({ data: j });
    journalsMap.set(j.code, created);
    journalsMap.set(j.name, created);
  }
  console.log(`✓ Created ${journalsData.length} General Journals.`);

  // ============================================================================
  // 4. TAX RATES (All 3 TaxApplicability values covered)
  // ============================================================================
  console.log("💰 4. Creating GST Tax Rates...");
  const taxRatesData = [
    { name: "GST 0% (Exempted)", percentage: 0, applicability: TaxApplicability.BOTH },
    { name: "GST 5% (Essential Raw Materials)", percentage: 5, applicability: TaxApplicability.BOTH },
    { name: "GST 12% (Standard Furniture & Decor)", percentage: 12, applicability: TaxApplicability.BOTH },
    { name: "GST 18% (Commercial Furniture & Services)", percentage: 18, applicability: TaxApplicability.BOTH },
    { name: "GST 28% (Luxury & Imported Goods)", percentage: 28, applicability: TaxApplicability.SALES },
    { name: "Input GST 18% (Vendor Procurement)", percentage: 18, applicability: TaxApplicability.PURCHASE },
  ];

  const taxRatesMap = new Map<string, any>();
  for (const tax of taxRatesData) {
    const created = await prisma.taxRate.create({ data: tax });
    taxRatesMap.set(tax.name, created);
  }
  console.log(`✓ Created ${taxRatesData.length} Tax Rates.`);

  // ============================================================================
  // 5. ANALYTIC ACCOUNTS (Both AnalyticAccountType values: INCOME & EXPENSES)
  // ============================================================================
  console.log("📈 5. Creating Analytic Cost & Revenue Centers...");
  const analyticAccountsData = [
    // Revenue Centers (INCOME)
    { name: "Delhi Flagship Showroom", type: AnalyticAccountType.INCOME },
    { name: "Mumbai Experience Center", type: AnalyticAccountType.INCOME },
    { name: "Bangalore Tech-Park Showroom", type: AnalyticAccountType.INCOME },
    { name: "Online Direct-to-Consumer Store", type: AnalyticAccountType.INCOME },
    { name: "B2B Hospitality & Corporate Contracts", type: AnalyticAccountType.INCOME },
    { name: "Turnkey Interior Design Projects", type: AnalyticAccountType.INCOME },
    { name: "After-Sales & Assembly Services", type: AnalyticAccountType.INCOME },

    // Cost Centers (EXPENSES)
    { name: "Direct Raw Materials", type: AnalyticAccountType.EXPENSES },
    { name: "Manufacturing Factory Labour", type: AnalyticAccountType.EXPENSES },
    { name: "Packaging & Sustainable Crating", type: AnalyticAccountType.EXPENSES },
    { name: "Logistics & Fleet Transport", type: AnalyticAccountType.EXPENSES },
    { name: "Summer 2026 Omnichannel Marketing", type: AnalyticAccountType.EXPENSES },
    { name: "Diwali & Festive 2026 Campaign", type: AnalyticAccountType.EXPENSES },
    { name: "Showroom Lease & Operational Overhead", type: AnalyticAccountType.EXPENSES },
    { name: "Central Warehouse Maintenance", type: AnalyticAccountType.EXPENSES },
    { name: "Enterprise IT & SaaS Infrastructure", type: AnalyticAccountType.EXPENSES },
  ];

  const analyticMap = new Map<string, any>();
  for (const aa of analyticAccountsData) {
    const created = await prisma.analyticAccount.create({ data: aa });
    analyticMap.set(aa.name, created);
  }
  console.log(`✓ Created ${analyticAccountsData.length} Analytic Cost/Revenue Centers.`);

  // ============================================================================
  // 6. PRODUCT CATEGORIES & PRODUCTS (All 3 ProductType: GOODS, SERVICE, COMBO)
  // ============================================================================
  console.log("🛋️ 6. Creating Product Categories and Catalog...");
  const categoriesData = [
    "Living Room Furniture",
    "Bedroom Furniture",
    "Office & Workspace",
    "Dining Room Suites",
    "Outdoor & Patio",
    "Kids & Youth",
    "Custom Modular Combos",
    "Turnkey Services",
    "Textiles & Accessories",
  ];

  const categoriesMap = new Map<string, any>();
  for (const cat of categoriesData) {
    const created = await prisma.productCategory.create({ data: { name: cat } });
    categoriesMap.set(cat, created);
  }

  const productsData = [
    // GOODS - Normal, Low-Stock, Out-of-Stock
    {
      name: "Royal Teak Wood 3-Seater Sofa",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Living Room Furniture")!.id,
      sku: "LR-SOFA-TEK-001",
      material: "Grade-A Indian Teak, Belgian Linen Upholstery",
      dimensions: "84\"W x 38\"D x 36\"H",
      salesPrice: 48000,
      cost: 26000,
      stock: 15,
      reorderPoint: 4,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Sheesham Leather L-Shape Sectional",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Living Room Furniture")!.id,
      sku: "LR-SOFA-SHS-002",
      material: "Solid Sheesham Wood, Italian Top-Grain Leather",
      dimensions: "115\"W x 80\"D x 34\"H",
      salesPrice: 88000,
      cost: 46000,
      stock: 3, // LOW STOCK TRIGGER (stock <= reorderPoint)
      reorderPoint: 5,
      image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Handcrafted Rattan Accent Lounge Chair",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Living Room Furniture")!.id,
      sku: "LR-CHAIR-RAT-003",
      material: "Natural Cane Rattan, Brass Leg Caps",
      dimensions: "30\"W x 32\"D x 34\"H",
      salesPrice: 18500,
      cost: 9200,
      stock: 22,
      reorderPoint: 6,
      image: "https://images.unsplash.com/photo-1580481077195-c990be10459c?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Minimalist Brass & Marble Coffee Table",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Living Room Furniture")!.id,
      sku: "LR-TABL-MRB-004",
      material: "Makarana White Marble, Brushed Brass Base",
      dimensions: "48\"W x 24\"D x 18\"H",
      salesPrice: 24000,
      cost: 12500,
      stock: 0, // OUT OF STOCK
      reorderPoint: 4,
      image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Maharaja King Size Storage Bed - Teak",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Bedroom Furniture")!.id,
      sku: "BR-BED-TEK-KNG",
      material: "Seasoned Teak Wood with Hydraulic Storage",
      dimensions: "82\"W x 86\"D x 50\"H",
      salesPrice: 62000,
      cost: 33000,
      stock: 8,
      reorderPoint: 3,
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "4-Door Wardrobe with Fluted Glass",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Bedroom Furniture")!.id,
      sku: "BR-WARD-FLT-002",
      material: "Solid Walnut Veneer, Fluted Toughened Glass",
      dimensions: "72\"W x 24\"D x 84\"H",
      salesPrice: 68000,
      cost: 36000,
      stock: 2, // LOW STOCK
      reorderPoint: 3,
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Executive Ergonomic Walnut Desk",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Office & Workspace")!.id,
      sku: "OF-DESK-WAL-001",
      material: "American Walnut, Concealed Cable Trough",
      dimensions: "70\"W x 34\"D x 30\"H",
      salesPrice: 52000,
      cost: 27000,
      stock: 12,
      reorderPoint: 4,
      image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "High-Back Leather Mesh Office Chair",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Office & Workspace")!.id,
      sku: "OF-CHAIR-ERG-002",
      material: "German Synchronous Mechanism, Italian Leather Seat",
      dimensions: "26\"W x 26\"D x 44\"H",
      salesPrice: 16500,
      cost: 8200,
      stock: 35,
      reorderPoint: 10,
      image: "https://images.unsplash.com/photo-1580481077195-c990be10459c?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Sheesham 8-Seater Dining Table Set",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Dining Room Suites")!.id,
      sku: "DR-SET-8ST-001",
      material: "Solid Sheesham Wood Table + 8 Cushioned Chairs",
      dimensions: "96\"W x 42\"D x 30\"H",
      salesPrice: 75000,
      cost: 39000,
      stock: 6,
      reorderPoint: 2,
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "All-Weather Teak Patio Dining Suite",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Outdoor & Patio")!.id,
      sku: "OD-DSET-TEK-001",
      material: "Marine-Grade Teak Wood, Weatherproof Sunbrella Fabric",
      dimensions: "72\"W x 38\"D x 30\"H",
      salesPrice: 85000,
      cost: 44000,
      stock: 5,
      reorderPoint: 2,
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Handwoven Kashmir Wool Area Rug 9x12",
      type: ProductType.GOODS,
      categoryId: categoriesMap.get("Textiles & Accessories")!.id,
      sku: "TX-RUG-KSH-001",
      material: "100% Hand-knotted Merino Wool",
      dimensions: "9' x 12'",
      salesPrice: 28000,
      cost: 14000,
      stock: 14,
      reorderPoint: 4,
      image: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=500&auto=format&fit=crop&q=80",
    },

    // COMBO
    {
      name: "Custom Modular Chef's Kitchen Suite",
      type: ProductType.COMBO,
      categoryId: categoriesMap.get("Custom Modular Combos")!.id,
      sku: "CM-KITCHEN-MOD-01",
      material: "Marine BWP Plywood, Acrylic & Ceramic Countertops",
      dimensions: "Custom site-fitted",
      salesPrice: 245000,
      cost: 135000,
      stock: 0,
      reorderPoint: 0,
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80",
    },
    {
      name: "Master Walk-in Wardrobe Dressing Unit",
      type: ProductType.COMBO,
      categoryId: categoriesMap.get("Custom Modular Combos")!.id,
      sku: "CM-WARD-WALK-02",
      material: "Hettich Soft-Close Hardware, Smoked Mirror Accents",
      dimensions: "Custom layout",
      salesPrice: 165000,
      cost: 90000,
      stock: 0,
      reorderPoint: 0,
      image: "https://images.unsplash.com/photo-1558997519-83ea9252def8?w=500&auto=format&fit=crop&q=80",
    },

    // SERVICE
    {
      name: "White-Glove Express Delivery (Local NCR)",
      type: ProductType.SERVICE,
      categoryId: categoriesMap.get("Turnkey Services")!.id,
      sku: "SV-DELIV-NCR",
      salesPrice: 2500,
      cost: 800,
      stock: 0,
      reorderPoint: 0,
      image: null,
    },
    {
      name: "Professional On-Site Assembly & Fitting",
      type: ProductType.SERVICE,
      categoryId: categoriesMap.get("Turnkey Services")!.id,
      sku: "SV-ASSEM-PRO",
      salesPrice: 3500,
      cost: 1200,
      stock: 0,
      reorderPoint: 0,
      image: null,
    },
    {
      name: "Residential Interior Architecture Consultation",
      type: ProductType.SERVICE,
      categoryId: categoriesMap.get("Turnkey Services")!.id,
      sku: "SV-INTD-CONSULT",
      salesPrice: 15000,
      cost: 4000,
      stock: 0,
      reorderPoint: 0,
      image: null,
    },
    {
      name: "Heritage Furniture Re-polishing & Restoration",
      type: ProductType.SERVICE,
      categoryId: categoriesMap.get("Turnkey Services")!.id,
      sku: "SV-RESTORE-WOOD",
      salesPrice: 8500,
      cost: 2500,
      stock: 0,
      reorderPoint: 0,
      image: null,
    },
  ];

  const productsMap = new Map<string, any>();
  for (const p of productsData) {
    const created = await prisma.product.create({ data: p });
    productsMap.set(p.sku, created);
  }
  console.log(`✓ Created ${productsData.length} Products (Goods, Combos, and Services).`);

  // ============================================================================
  // 7. USERS (All 3 UserRole: ADMINISTRATOR, ACCOUNTANT, CONTACT)
  // ============================================================================
  console.log("👤 7. Creating Users with credentials and S3 banners...");
  const adminHash = await hash("Admin@123", 10);
  const acctHash = await hash("Account@123", 10);
  const portalHash = await hash("Contact@123", 10);

  // 1. Administrator
  const adminUser = await prisma.user.create({
    data: {
      loginId: "admin001",
      email: "admin@maharajafurniture.in",
      password: adminHash,
      name: "Amitabh Singhania",
      role: UserRole.ADMINISTRATOR,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      bannerUrl: banners[0],
      isActive: true,
      mustChangePassword: false,
    },
  });

  // 2. Accountant
  const acctUser = await prisma.user.create({
    data: {
      loginId: "acct001",
      email: "accountant@maharajafurniture.in",
      password: acctHash,
      name: "Pooja Deshmukh (CA)",
      role: UserRole.ACCOUNTANT,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      bannerUrl: banners[1],
      isActive: true,
      mustChangePassword: false,
    },
  });

  // 3. Customer Portal User 1
  const custPortalUser1 = await prisma.user.create({
    data: {
      loginId: "cust001",
      email: "procurement@tajhotels.com",
      password: portalHash,
      name: "Vikramaditya Oberoi",
      role: UserRole.CONTACT,
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      bannerUrl: banners[2],
      isActive: true,
      mustChangePassword: false,
    },
  });

  // 4. Customer Portal User 2
  const custPortalUser2 = await prisma.user.create({
    data: {
      loginId: "cust002",
      email: "rajesh.kumar@email.in",
      password: portalHash,
      name: "Rajesh Kumar",
      role: UserRole.CONTACT,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      bannerUrl: banners[3],
      isActive: true,
      mustChangePassword: false,
    },
  });

  // 5. Vendor Portal User
  const vendPortalUser = await prisma.user.create({
    data: {
      loginId: "vend001",
      email: "orders@rajendra-wood.in",
      password: portalHash,
      name: "Rajendra Sharma (Vendor Partner)",
      role: UserRole.CONTACT,
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      bannerUrl: banners[4],
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log("✓ Created 5 Users (Admin, Accountant, 2 Customer Portal Users, 1 Vendor Portal User).");

  // ============================================================================
  // 8. CONTACTS (All 3 ContactType: CUSTOMER, VENDOR, BOTH)
  // ============================================================================
  console.log("👥 8. Creating Contacts (Vendors, Customers, Hybrid Partners)...");
  const contactsData = [
    // VENDORS
    {
      name: "Rajendra Timber & Hardwood Suppliers",
      type: ContactType.VENDOR,
      email: "orders@rajendra-wood.in",
      phone: "+91-22-6789-1234",
      address: "123 Timber Market Road, Reay Road, Mumbai 400010, Maharashtra",
      userId: vendPortalUser.id,
      bannerUrl: banners[4],
    },
    {
      name: "Surat Sustainable Fabric Mills",
      type: ContactType.VENDOR,
      email: "wholesale@surattextiles.in",
      phone: "+91-261-2341-567",
      address: "45 Ring Road Industrial Hub, Surat 395002, Gujarat",
      userId: null,
      bannerUrl: banners[5],
    },
    {
      name: "Pune Precision Steel & Hardware Ltd",
      type: ContactType.VENDOR,
      email: "orders@punesteelhardware.com",
      phone: "+91-20-4567-8901",
      address: "Plot 88, MIDC Bhosari, Pune 411026, Maharashtra",
      userId: null,
      bannerUrl: banners[6],
    },
    {
      name: "Deccan Logistics & Freight Express",
      type: ContactType.VENDOR,
      email: "fleet@deccanlogistics.in",
      phone: "+91-40-2789-0123",
      address: "Cargo Village, Shamshabad, Hyderabad 500108, Telangana",
      userId: null,
      bannerUrl: banners[7],
    },

    // CUSTOMERS
    {
      name: "Taj Palace & Luxury Hotels Group",
      type: ContactType.CUSTOMER,
      email: "procurement@tajhotels.com",
      phone: "+91-11-6162-7000",
      address: "Taj Palace Hotel, 2 Sardar Patel Marg, Chanakyapuri, New Delhi 110021",
      userId: custPortalUser1.id,
      bannerUrl: banners[2],
    },
    {
      name: "Rajesh Kumar (High-Net-Worth Architect)",
      type: ContactType.CUSTOMER,
      email: "rajesh.kumar@email.in",
      phone: "+91-98765-43210",
      address: "Villa 14, Magnolia Enclave, Golf Course Road, Gurugram 122002, Haryana",
      userId: custPortalUser2.id,
      bannerUrl: banners[3],
    },
    {
      name: "WeWork India Operations",
      type: ContactType.CUSTOMER,
      email: "facilities@wework-india.com",
      phone: "+91-124-4001-234",
      address: "Two Horizon Center, Golf Course Road, Gurugram 122002, Haryana",
      userId: null,
      bannerUrl: banners[0],
    },
    {
      name: "ITC Maratha Grand Resort & Convention",
      type: ContactType.CUSTOMER,
      email: "purchasing@itchotels.in",
      phone: "+91-22-2830-3030",
      address: "Sahar Airport Road, Andheri East, Mumbai 400099, Maharashtra",
      userId: null,
      bannerUrl: banners[1],
    },
    {
      name: "Priya Sharma",
      type: ContactType.CUSTOMER,
      email: "priya.sharma@residential.in",
      phone: "+91-98112-99887",
      address: "Flat 902, Tower B, Oberoi Springs, Andheri West, Mumbai 400053",
      userId: null,
      bannerUrl: banners[2],
    },

    // BOTH (Hybrid Partner)
    {
      name: "Apex Interior Turnkey Solutions & Procurement",
      type: ContactType.BOTH,
      email: "partner@apexturnkey.in",
      phone: "+91-80-4123-9087",
      address: "14 Infantry Road, Shivajinagar, Bangalore 560001, Karnataka",
      userId: null,
      bannerUrl: banners[3],
    },
  ];

  const contactsMap = new Map<string, any>();
  for (const c of contactsData) {
    const created = await prisma.contact.create({ data: c });
    contactsMap.set(c.name, created);
    contactsMap.set(c.email, created);
  }
  console.log(`✓ Created ${contactsData.length} Contacts (including linked Portal Accounts).`);

  // ============================================================================
  // 8. MULTI-MONTH TRANSACTION SETUP (Apr 2026 - Sep 2026)
  // ============================================================================
  console.log("🔄 8. Building Purchases, Sales, Invoices, Bills, and Balanced General Ledger...");

  let poIndex = 1001;
  let billIndex = 2001;
  let soIndex = 3001;
  let invIndex = 4001;
  let jeIndex = 5001;

  // ----------------------------------------------------------------------------
  // A. PURCHASE CYCLE (PO, Vendor Bills, Payments, JE, BillEmailLogs)
  // ----------------------------------------------------------------------------
  const purchaseScenarios = [
    // Month 1: April 2026 (PAID)
    {
      vendorName: "Rajendra Timber & Hardwood Suppliers",
      date: new Date("2026-04-10"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      items: [
        { sku: "LR-SOFA-TEK-001", qty: 6, analytic: "Direct Raw Materials" },
        { sku: "BR-BED-TEK-KNG", qty: 4, analytic: "Direct Raw Materials" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
    // Month 2: May 2026 (PAID)
    {
      vendorName: "Surat Sustainable Fabric Mills",
      date: new Date("2026-05-12"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      items: [
        { sku: "LR-SOFA-SHS-002", qty: 5, analytic: "Direct Raw Materials" },
        { sku: "TX-RUG-KSH-001", qty: 8, analytic: "Direct Raw Materials" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
    // Month 3: June 2026 (PARTIAL)
    {
      vendorName: "Pune Precision Steel & Hardware Ltd",
      date: new Date("2026-06-18"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIAL,
      items: [
        { sku: "OF-DESK-WAL-001", qty: 8, analytic: "Direct Raw Materials" },
        { sku: "OF-CHAIR-ERG-002", qty: 15, analytic: "Direct Raw Materials" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
    // Month 4: July 2026 (PAID)
    {
      vendorName: "Deccan Logistics & Freight Express",
      date: new Date("2026-07-20"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      items: [
        { sku: "SV-DELIV-NCR", qty: 20, analytic: "Logistics & Fleet Transport" },
      ],
      paymentMethod: PaymentMethod.CASH,
    },
    // Month 5: August 2026 (OVERDUE NOT_PAID)
    {
      vendorName: "Rajendra Timber & Hardwood Suppliers",
      date: new Date("2026-08-05"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      items: [
        { sku: "DR-SET-8ST-001", qty: 5, analytic: "Direct Raw Materials" },
        { sku: "OD-DSET-TEK-001", qty: 3, analytic: "Direct Raw Materials" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
    // Month 6: September 2026 (CURRENT MONTH - DUE SOON, NOT_PAID)
    {
      vendorName: "Surat Sustainable Fabric Mills",
      date: new Date("2026-09-02"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      items: [
        { sku: "LR-CHAIR-RAT-003", qty: 10, analytic: "Manufacturing Factory Labour" },
        { sku: "BR-WARD-FLT-002", qty: 4, analytic: "Direct Raw Materials" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
    // Month 6: September 2026 (CURRENT MONTH - DRAFT PO & BILL)
    {
      vendorName: "Pune Precision Steel & Hardware Ltd",
      date: new Date("2026-09-04"),
      status: DocumentStatus.DRAFT,
      paymentStatus: PaymentStatus.NOT_PAID,
      items: [
        { sku: "OF-DESK-WAL-001", qty: 4, analytic: "Showroom Lease & Operational Overhead" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
    // Month 6: CANCELLED PO
    {
      vendorName: "Deccan Logistics & Freight Express",
      date: new Date("2026-09-01"),
      status: DocumentStatus.CANCELLED,
      paymentStatus: PaymentStatus.NOT_PAID,
      items: [
        { sku: "SV-DELIV-NCR", qty: 5, analytic: "Logistics & Fleet Transport" },
      ],
      paymentMethod: PaymentMethod.BANK,
    },
  ];

  for (const sc of purchaseScenarios) {
    const vendor = contactsMap.get(sc.vendorName)!;
    const poNumber = `PO-2026-${pad4(poIndex++)}`;

    let poTotal = 0;
    const poLineCreations = sc.items.map((item) => {
      const prod = productsMap.get(item.sku)!;
      const analytic = analyticMap.get(item.analytic)!;
      const unitPrice = Number(prod.cost);
      const lineTotal = unitPrice * item.qty;
      poTotal += lineTotal;
      return {
        productId: prod.id,
        analyticAccountId: analytic.id,
        quantity: item.qty,
        unitPrice,
        lineTotal,
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        vendorId: vendor.id,
        orderDate: sc.date,
        status: sc.status,
        total: poTotal,
        createdById: adminUser.id,
        lines: { create: poLineCreations },
      },
    });

    // Create Vendor Bill if PO is not Cancelled
    if (sc.status !== DocumentStatus.CANCELLED) {
      const billNumber = `BILL-2026-${pad4(billIndex++)}`;
      const billDate = new Date(sc.date);
      const dueDate = new Date(billDate);
      dueDate.setDate(dueDate.getDate() + 25); // 25 day payment terms

      let amountPaid = 0;
      if (sc.paymentStatus === PaymentStatus.PAID) {
        amountPaid = poTotal;
      } else if (sc.paymentStatus === PaymentStatus.PARTIAL) {
        amountPaid = Math.round(poTotal * 0.5 * 100) / 100;
      }
      const amountDue = poTotal - amountPaid;

      const bill = await prisma.vendorBill.create({
        data: {
          billNumber,
          vendorId: vendor.id,
          purchaseOrderId: po.id,
          billDate,
          dueDate,
          status: sc.status,
          paymentStatus: sc.paymentStatus,
          total: poTotal,
          amountPaid,
          amountDue,
          reminderCount: sc.paymentStatus === PaymentStatus.NOT_PAID ? 2 : 0,
          lastReminderSentAt: sc.paymentStatus === PaymentStatus.NOT_PAID ? new Date(sc.date.getTime() + 86400000 * 15) : null,
          createdById: acctUser.id,
          lines: {
            create: poLineCreations.map((l) => ({
              productId: l.productId,
              analyticAccountId: l.analyticAccountId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });

      // Post Journal Entry if Bill is Confirmed
      if (sc.status === DocumentStatus.CONFIRMED) {
        const jeBillNumber = `JE-2026-${pad4(jeIndex++)}`;
        await prisma.journalEntry.create({
          data: {
            entryNumber: jeBillNumber,
            journalId: journalsMap.get("PUR")!.id,
            accountingDate: billDate,
            status: JournalEntryStatus.POSTED,
            source: JournalEntrySource.VENDOR_BILL,
            totalDebit: poTotal,
            totalCredit: poTotal,
            vendorBillId: bill.id,
            createdById: acctUser.id,
            lines: {
              create: [
                {
                  accountId: accountsMap.get("5000")!.id, // Cost of Goods Sold / Purchases
                  partnerId: vendor.id,
                  debit: poTotal,
                  credit: 0,
                },
                {
                  accountId: accountsMap.get("2000")!.id, // Accounts Payable
                  partnerId: vendor.id,
                  debit: 0,
                  credit: poTotal,
                },
              ],
            },
          },
        });

        // Bill Payment record + Payment Journal Entry
        if (amountPaid > 0) {
          const payDate = new Date(billDate);
          payDate.setDate(payDate.getDate() + 5);

          const billPayment = await prisma.billPayment.create({
            data: {
              vendorBillId: bill.id,
              amount: amountPaid,
              paymentDate: payDate,
              paymentMethod: sc.paymentMethod,
              note: `Settlement for ${billNumber} via ${sc.paymentMethod}`,
            },
          });

          const jePayNumber = `JE-2026-${pad4(jeIndex++)}`;
          await prisma.journalEntry.create({
            data: {
              entryNumber: jePayNumber,
              journalId: sc.paymentMethod === PaymentMethod.BANK ? journalsMap.get("BNK")!.id : journalsMap.get("CSH")!.id,
              accountingDate: payDate,
              status: JournalEntryStatus.POSTED,
              source: JournalEntrySource.BILL_PAYMENT,
              totalDebit: amountPaid,
              totalCredit: amountPaid,
              billPaymentId: billPayment.id,
              createdById: acctUser.id,
              lines: {
                create: [
                  {
                    accountId: accountsMap.get("2000")!.id, // Debit Accounts Payable
                    partnerId: vendor.id,
                    debit: amountPaid,
                    credit: 0,
                  },
                  {
                    accountId: sc.paymentMethod === PaymentMethod.BANK ? accountsMap.get("1010")!.id : accountsMap.get("1000")!.id, // Credit Bank or Cash
                    partnerId: null,
                    debit: 0,
                    credit: amountPaid,
                  },
                ],
              },
            },
          });
        }

        // Bill Email Logs (Audit)
        if (sc.paymentStatus === PaymentStatus.NOT_PAID) {
          await prisma.billEmailLog.create({
            data: {
              vendorBillId: bill.id,
              recipientEmail: vendor.email,
              recipientName: vendor.name,
              emailType: EmailReminderType.OVERDUE,
              subject: `Urgent: Overdue Settlement Alert for Bill ${billNumber}`,
              status: EmailDeliveryStatus.SENT,
              sentAt: new Date(billDate.getTime() + 86400000 * 26),
            },
          });
        }
      }
    }
  }
  console.log("✓ Created Purchase Orders, Vendor Bills, Bill Payments, and Balanced Purchase JEs.");

  // ----------------------------------------------------------------------------
  // B. SALES CYCLE (SO, Customer Invoices, Payments, Razorpay, JEs, InvoiceEmailLogs)
  // ----------------------------------------------------------------------------
  const salesScenarios = [
    // Month 1: April 2026 (PAID - Corporate)
    {
      customerName: "Taj Palace & Luxury Hotels Group",
      date: new Date("2026-04-15"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "LR-SOFA-TEK-001", qty: 8, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Delhi Flagship Showroom" },
        { sku: "DR-SET-8ST-001", qty: 4, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Delhi Flagship Showroom" },
        { sku: "SV-DELIV-NCR", qty: 2, tax: "GST 0% (Exempted)", analytic: "After-Sales & Assembly Services" },
      ],
    },
    // Month 2: May 2026 (PAID - Razorpay Gateway)
    {
      customerName: "Rajesh Kumar (High-Net-Worth Architect)",
      date: new Date("2026-05-18"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.GATEWAY,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "BR-BED-TEK-KNG", qty: 2, tax: "GST 12% (Standard Furniture & Decor)", analytic: "Online Direct-to-Consumer Store" },
        { sku: "TX-RUG-KSH-001", qty: 2, tax: "GST 5% (Essential Raw Materials)", analytic: "Online Direct-to-Consumer Store" },
        { sku: "SV-ASSEM-PRO", qty: 1, tax: "GST 0% (Exempted)", analytic: "After-Sales & Assembly Services" },
      ],
    },
    // Month 3: June 2026 (PARTIAL - WeWork)
    {
      customerName: "WeWork India Operations",
      date: new Date("2026-06-20"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIAL,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "OF-DESK-WAL-001", qty: 10, tax: "GST 18% (Commercial Furniture & Services)", analytic: "B2B Hospitality & Corporate Contracts" },
        { sku: "OF-CHAIR-ERG-002", qty: 20, tax: "GST 18% (Commercial Furniture & Services)", analytic: "B2B Hospitality & Corporate Contracts" },
      ],
    },
    // Month 4: July 2026 (PAID - ITC Hotels)
    {
      customerName: "ITC Maratha Grand Resort & Convention",
      date: new Date("2026-07-22"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "LR-SOFA-SHS-002", qty: 4, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Mumbai Experience Center" },
        { sku: "OD-DSET-TEK-001", qty: 4, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Mumbai Experience Center" },
        { sku: "SV-INTD-CONSULT", qty: 1, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Turnkey Interior Design Projects" },
      ],
    },
    // Month 5: August 2026 (OVERDUE NOT_PAID - Priya Sharma)
    {
      customerName: "Priya Sharma",
      date: new Date("2026-08-08"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "LR-CHAIR-RAT-003", qty: 2, tax: "GST 12% (Standard Furniture & Decor)", analytic: "Mumbai Experience Center" },
        { sku: "BR-WARD-FLT-002", qty: 1, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Mumbai Experience Center" },
      ],
    },
    // Month 6: September 2026 (CURRENT MONTH - Apex Turnkey, DUE SOON NOT_PAID)
    {
      customerName: "Apex Interior Turnkey Solutions & Procurement",
      date: new Date("2026-09-01"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "CM-KITCHEN-MOD-01", qty: 1, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Turnkey Interior Design Projects" },
        { sku: "LR-SOFA-TEK-001", qty: 3, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Bangalore Tech-Park Showroom" },
      ],
    },
    // Month 6: September 2026 (CURRENT MONTH - PAID via Gateway Rajesh Kumar)
    {
      customerName: "Rajesh Kumar (High-Net-Worth Architect)",
      date: new Date("2026-09-03"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.GATEWAY,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "LR-CHAIR-RAT-003", qty: 2, tax: "GST 12% (Standard Furniture & Decor)", analytic: "Delhi Flagship Showroom" },
        { sku: "TX-RUG-KSH-001", qty: 1, tax: "GST 5% (Essential Raw Materials)", analytic: "Delhi Flagship Showroom" },
      ],
    },
    // Month 6: DRAFT Sales Order
    {
      customerName: "WeWork India Operations",
      date: new Date("2026-09-05"),
      status: DocumentStatus.DRAFT,
      paymentStatus: PaymentStatus.NOT_PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "OF-CHAIR-ERG-002", qty: 10, tax: "GST 18% (Commercial Furniture & Services)", analytic: "Delhi Flagship Showroom" },
      ],
    },
    // Month 6: CANCELLED Sales Order
    {
      customerName: "Priya Sharma",
      date: new Date("2026-09-02"),
      status: DocumentStatus.CANCELLED,
      paymentStatus: PaymentStatus.NOT_PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
      paymentMethod: PaymentMethod.BANK,
      items: [
        { sku: "BR-BED-TEK-KNG", qty: 1, tax: "GST 12% (Standard Furniture & Decor)", analytic: "Delhi Flagship Showroom" },
      ],
    },
  ];

  for (const sc of salesScenarios) {
    const customer = contactsMap.get(sc.customerName)!;
    const soNumber = `SO-2026-${pad4(soIndex++)}`;

    let subtotal = 0;
    let taxTotal = 0;

    const soLineCreations = sc.items.map((item) => {
      const prod = productsMap.get(item.sku)!;
      const taxRate = taxRatesMap.get(item.tax);
      const analytic = analyticMap.get(item.analytic)!;
      const unitPrice = Number(prod.salesPrice);
      const lineTotal = unitPrice * item.qty;
      const taxAmount = taxRate ? (lineTotal * Number(taxRate.percentage)) / 100 : 0;

      subtotal += lineTotal;
      taxTotal += taxAmount;

      return {
        productId: prod.id,
        analyticAccountId: analytic.id,
        taxRateId: taxRate ? taxRate.id : null,
        quantity: item.qty,
        unitPrice,
        lineTotal,
        taxAmount,
      };
    });

    const invoiceTotal = Math.round((subtotal + taxTotal) * 100) / 100;

    const so = await prisma.salesOrder.create({
      data: {
        soNumber,
        customerId: customer.id,
        orderDate: sc.date,
        status: sc.status,
        total: invoiceTotal,
        createdById: adminUser.id,
        lines: { create: soLineCreations },
      },
    });

    // Create Invoice if SO is not Cancelled
    if (sc.status !== DocumentStatus.CANCELLED) {
      const invoiceNumber = `INV-2026-${pad4(invIndex++)}`;
      const invDate = new Date(sc.date);
      const dueDate = new Date(invDate);
      dueDate.setDate(dueDate.getDate() + 15); // 15 day payment terms

      let amountPaid = 0;
      if (sc.paymentStatus === PaymentStatus.PAID) {
        amountPaid = invoiceTotal;
      } else if (sc.paymentStatus === PaymentStatus.PARTIAL) {
        amountPaid = Math.round(invoiceTotal * 0.6 * 100) / 100;
      }
      const amountDue = Math.round((invoiceTotal - amountPaid) * 100) / 100;

      const invoice = await prisma.customerInvoice.create({
        data: {
          invoiceNumber,
          customerId: customer.id,
          salesOrderId: so.id,
          invoiceReference: `REF-${invoiceNumber}`,
          invoiceDate: invDate,
          dueDate,
          status: sc.status,
          paymentStatus: sc.paymentStatus,
          total: invoiceTotal,
          amountPaid,
          amountDue,
          reminderCount: sc.paymentStatus === PaymentStatus.NOT_PAID ? 1 : 0,
          lastReminderSentAt: sc.paymentStatus === PaymentStatus.NOT_PAID ? new Date(invDate.getTime() + 86400000 * 10) : null,
          createdById: adminUser.id,
          lines: {
            create: soLineCreations.map((l) => ({
              productId: l.productId,
              analyticAccountId: l.analyticAccountId,
              taxRateId: l.taxRateId,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              lineTotal: l.lineTotal,
              taxAmount: l.taxAmount,
            })),
          },
        },
      });

      // Post General Ledger Entry for Confirmed Invoice
      if (sc.status === DocumentStatus.CONFIRMED) {
        const jeInvNumber = `JE-2026-${pad4(jeIndex++)}`;
        await prisma.journalEntry.create({
          data: {
            entryNumber: jeInvNumber,
            journalId: journalsMap.get("SAL")!.id,
            accountingDate: invDate,
            status: JournalEntryStatus.POSTED,
            source: JournalEntrySource.CUSTOMER_INVOICE,
            totalDebit: invoiceTotal,
            totalCredit: invoiceTotal,
            invoiceId: invoice.id,
            createdById: acctUser.id,
            lines: {
              create: [
                {
                  accountId: accountsMap.get("1100")!.id, // Debit Accounts Receivable
                  partnerId: customer.id,
                  debit: invoiceTotal,
                  credit: 0,
                },
                {
                  accountId: accountsMap.get("4000")!.id, // Credit Sales Income
                  partnerId: customer.id,
                  debit: 0,
                  credit: subtotal,
                },
                {
                  accountId: accountsMap.get("2200")!.id, // Credit GST Output Liability
                  partnerId: null,
                  debit: 0,
                  credit: taxTotal,
                },
              ],
            },
          },
        });

        // Payment Handling: Manual vs Razorpay Gateway
        if (amountPaid > 0) {
          const payDate = new Date(invDate);
          payDate.setDate(payDate.getDate() + 2);

          let gatewayTxId: string | null = null;
          if (sc.paymentSource === InvoicePaymentSource.GATEWAY) {
            const gw = await prisma.paymentGatewayTransaction.create({
              data: {
                invoiceId: invoice.id,
                gatewayOrderId: `order_rzp_${Date.now()}_${invIndex}`,
                gatewayPaymentId: `pay_rzp_${Date.now()}_${invIndex}`,
                amount: amountPaid,
                status: PaymentGatewayStatus.SUCCESS,
                paymentMethod: "Razorpay Card & UPI",
                webhookVerifiedAt: payDate,
              },
            });
            gatewayTxId = gw.id;
          }

          const invoicePayment = await prisma.invoicePayment.create({
            data: {
              invoiceId: invoice.id,
              amount: amountPaid,
              paymentDate: payDate,
              paymentMethod: sc.paymentMethod,
              source: sc.paymentSource,
              gatewayTransactionId: gatewayTxId,
              note: `Payment receipt for ${invoiceNumber} via ${sc.paymentSource}`,
            },
          });

          // Balanced Payment Journal Entry
          const jePayNumber = `JE-2026-${pad4(jeIndex++)}`;
          await prisma.journalEntry.create({
            data: {
              entryNumber: jePayNumber,
              journalId: journalsMap.get("BNK")!.id,
              accountingDate: payDate,
              status: JournalEntryStatus.POSTED,
              source: JournalEntrySource.INVOICE_PAYMENT,
              totalDebit: amountPaid,
              totalCredit: amountPaid,
              invoicePaymentId: invoicePayment.id,
              createdById: acctUser.id,
              lines: {
                create: [
                  {
                    accountId: accountsMap.get("1010")!.id, // Debit Bank
                    partnerId: null,
                    debit: amountPaid,
                    credit: 0,
                  },
                  {
                    accountId: accountsMap.get("1100")!.id, // Credit Accounts Receivable
                    partnerId: customer.id,
                    debit: 0,
                    credit: amountPaid,
                  },
                ],
              },
            },
          });
        }

        // Email Reminders & Logs
        if (sc.paymentStatus === PaymentStatus.NOT_PAID) {
          await prisma.invoiceEmailLog.create({
            data: {
              invoiceId: invoice.id,
              recipientEmail: customer.email,
              recipientName: customer.name,
              emailType: EmailReminderType.DUE_SOON,
              subject: `Reminder: Invoice ${invoiceNumber} from Maharaja Furniture`,
              status: EmailDeliveryStatus.SENT,
              sentAt: new Date(invDate.getTime() + 86400000 * 10),
            },
          });
        }
      }
    }
  }

  // Also create a Failed Gateway Transaction attempt to cover PaymentGatewayStatus.FAILED
  const firstInvoice = await prisma.customerInvoice.findFirst({
    where: { paymentStatus: PaymentStatus.NOT_PAID },
  });
  if (firstInvoice) {
    await prisma.paymentGatewayTransaction.create({
      data: {
        invoiceId: firstInvoice.id,
        gatewayOrderId: `order_fail_${Date.now()}`,
        gatewayPaymentId: null,
        amount: Number(firstInvoice.amountDue),
        status: PaymentGatewayStatus.FAILED,
        paymentMethod: "NetBanking SBI",
        webhookVerifiedAt: new Date(),
        failureReason: "Payment cancelled by customer at bank gateway redirect",
      },
    });

    // Failed email log to cover EmailDeliveryStatus.FAILED
    await prisma.invoiceEmailLog.create({
      data: {
        invoiceId: firstInvoice.id,
        recipientEmail: "bounced@invalid-domain-test.in",
        recipientName: "Test Bounced Recipient",
        emailType: EmailReminderType.MANUAL,
        subject: `Notice: Payment processing update for ${firstInvoice.invoiceNumber}`,
        status: EmailDeliveryStatus.FAILED,
        errorMessage: "SMTP 550: Mailbox does not exist or host unreachable",
        sentAt: new Date(),
      },
    });
  }

  console.log("✓ Created Sales Orders, Customer Invoices, Payments, Razorpay Transactions, and Balanced Sales JEs.");

  // ============================================================================
  // 9. MANUAL GENERAL LEDGER ENTRIES (Opening Balances, Rent, Salaries, Depreciation)
  // ============================================================================
  console.log("📒 9. Posting Double-Entry Manual Adjustment Journal Entries...");

  // 1. Opening Balance (April 1, 2026)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${pad4(jeIndex++)}`,
      journalId: journalsMap.get("BNK")!.id,
      accountingDate: new Date("2026-04-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 10000000,
      totalCredit: 10000000,
      createdById: adminUser.id,
      lines: {
        create: [
          { accountId: accountsMap.get("1010")!.id, debit: 6000000, credit: 0 }, // ICICI Current Account
          { accountId: accountsMap.get("1020")!.id, debit: 2500000, credit: 0 }, // HDFC Savings
          { accountId: accountsMap.get("1000")!.id, debit: 500000, credit: 0 },  // Petty Cash
          { accountId: accountsMap.get("1200")!.id, debit: 1000000, credit: 0 }, // Initial Inventory
          { accountId: accountsMap.get("3000")!.id, debit: 0, credit: 10000000 }, // Proprietor's Capital
        ],
      },
    },
  });

  // 2. Monthly Salaries (April, May, June, July, August, September)
  const salaryMonths = [
    { date: new Date("2026-04-30"), amount: 480000 },
    { date: new Date("2026-05-31"), amount: 485000 },
    { date: new Date("2026-06-30"), amount: 490000 },
    { date: new Date("2026-07-31"), amount: 495000 },
    { date: new Date("2026-08-31"), amount: 510000 },
    { date: new Date("2026-09-04"), amount: 510000 },
  ];

  for (const sm of salaryMonths) {
    await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-2026-${pad4(jeIndex++)}`,
        journalId: journalsMap.get("BNK")!.id,
        accountingDate: sm.date,
        status: JournalEntryStatus.POSTED,
        source: JournalEntrySource.MANUAL,
        totalDebit: sm.amount,
        totalCredit: sm.amount,
        createdById: acctUser.id,
        lines: {
          create: [
            { accountId: accountsMap.get("5100")!.id, debit: sm.amount, credit: 0 },
            { accountId: accountsMap.get("1010")!.id, debit: 0, credit: sm.amount },
          ],
        },
      },
    });
  }

  // 3. Showroom & Warehouse Rent (Monthly)
  const rentMonths = [
    { date: new Date("2026-04-05"), amount: 280000 },
    { date: new Date("2026-05-05"), amount: 280000 },
    { date: new Date("2026-06-05"), amount: 280000 },
    { date: new Date("2026-07-05"), amount: 280000 },
    { date: new Date("2026-08-05"), amount: 280000 },
    { date: new Date("2026-09-02"), amount: 280000 },
  ];

  for (const rm of rentMonths) {
    await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-2026-${pad4(jeIndex++)}`,
        journalId: journalsMap.get("BNK")!.id,
        accountingDate: rm.date,
        status: JournalEntryStatus.POSTED,
        source: JournalEntrySource.MANUAL,
        totalDebit: rm.amount,
        totalCredit: rm.amount,
        createdById: acctUser.id,
        lines: {
          create: [
            { accountId: accountsMap.get("5200")!.id, debit: 160000, credit: 0 }, // Showroom Rent
            { accountId: accountsMap.get("5210")!.id, debit: 120000, credit: 0 }, // Warehouse Rent
            { accountId: accountsMap.get("1010")!.id, debit: 0, credit: rm.amount },
          ],
        },
      },
    });
  }

  // 4. Depreciation Adjustment (June 30 & August 31)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${pad4(jeIndex++)}`,
      journalId: journalsMap.get("BNK")!.id,
      accountingDate: new Date("2026-06-30"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 65000,
      totalCredit: 65000,
      createdById: acctUser.id,
      lines: {
        create: [
          { accountId: accountsMap.get("5900")!.id, debit: 65000, credit: 0 },
          { accountId: accountsMap.get("1410")!.id, debit: 0, credit: 40000 }, // Delivery Fleet Depreciation
          { accountId: accountsMap.get("1430")!.id, debit: 0, credit: 25000 }, // IT Infrastructure Depreciation
        ],
      },
    },
  });

  // 5. Draft Manual Journal Entry (to cover JournalEntryStatus.DRAFT)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${pad4(jeIndex++)}`,
      journalId: journalsMap.get("CSH")!.id,
      accountingDate: new Date("2026-09-05"),
      status: JournalEntryStatus.DRAFT,
      source: JournalEntrySource.MANUAL,
      totalDebit: 15000,
      totalCredit: 15000,
      createdById: acctUser.id,
      lines: {
        create: [
          { accountId: accountsMap.get("5500")!.id, debit: 15000, credit: 0 }, // Office Stationery
          { accountId: accountsMap.get("1000")!.id, debit: 0, credit: 15000 }, // Petty Cash
        ],
      },
    },
  });

  console.log("✓ Posted Manual Balanced Journal Entries (Payroll, Rent, Fixed Assets Depreciation, Opening Balances).");

  // ============================================================================
  // 10. BUDGETS & REVISIONS (All 3 BudgetStatus: DRAFT, CONFIRMED, CANCELLED)
  // ============================================================================
  console.log("💵 10. Creating Budgets with Revisions and Analytic Targets...");

  // Budget 1: Q1 FY26 (Apr-Jun 2026) - CONFIRMED
  const q1Budget = await prisma.budget.create({
    data: {
      name: "Q1 FY 2026-27 Strategic Operating Budget",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      lines: {
        create: [
          {
            analyticAccountId: analyticMap.get("Delhi Flagship Showroom")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 2500000,
            achievedAmount: 2350000,
            achievedPercent: 94.0,
            amountToAchieve: 150000,
          },
          {
            analyticAccountId: analyticMap.get("Online Direct-to-Consumer Store")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 1200000,
            achievedAmount: 1150000,
            achievedPercent: 95.83,
            amountToAchieve: 50000,
          },
          {
            analyticAccountId: analyticMap.get("Direct Raw Materials")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 1500000,
            achievedAmount: 1420000,
            achievedPercent: 94.67,
            amountToAchieve: 80000,
          },
        ],
      },
    },
  });

  // Budget 2: Q2 FY26 (Jul-Sep 2026) - Original (CANCELLED / REVISED)
  const q2Original = await prisma.budget.create({
    data: {
      name: "Q2 FY 2026-27 Expansion Plan (Original Draft)",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CANCELLED,
      lines: {
        create: [
          {
            analyticAccountId: analyticMap.get("Mumbai Experience Center")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 2000000,
            achievedAmount: 0,
            achievedPercent: 0,
            amountToAchieve: 2000000,
          },
          {
            analyticAccountId: analyticMap.get("Summer 2026 Omnichannel Marketing")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 800000,
            achievedAmount: 0,
            achievedPercent: 0,
            amountToAchieve: 800000,
          },
        ],
      },
    },
  });

  // Budget 3: Q2 FY26 (Jul-Sep 2026) - Revised Version (CONFIRMED)
  const q2Revised = await prisma.budget.create({
    data: {
      name: "Q2 FY 2026-27 Festive Ramp-Up Budget (Revised)",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      revisionOfId: q2Original.id,
      lines: {
        create: [
          {
            analyticAccountId: analyticMap.get("Delhi Flagship Showroom")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 3000000,
            achievedAmount: 2100000,
            achievedPercent: 70.0,
            amountToAchieve: 900000,
          },
          {
            analyticAccountId: analyticMap.get("B2B Hospitality & Corporate Contracts")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 2200000,
            achievedAmount: 1800000,
            achievedPercent: 81.82,
            amountToAchieve: 400000,
          },
          {
            analyticAccountId: analyticMap.get("Manufacturing Factory Labour")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 900000,
            achievedAmount: 650000,
            achievedPercent: 72.22,
            amountToAchieve: 250000,
          },
        ],
      },
    },
  });

  // Link revision back
  await prisma.budget.update({
    where: { id: q2Original.id },
    data: { revisedWithId: q2Revised.id },
  });

  // Budget 4: Annual FY 2026-27 (DRAFT)
  await prisma.budget.create({
    data: {
      name: "FY 2026-27 Master Annual Financial Blueprint",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      responsibleId: adminUser.id,
      status: BudgetStatus.DRAFT,
      lines: {
        create: [
          {
            analyticAccountId: analyticMap.get("Delhi Flagship Showroom")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 12000000,
            achievedAmount: 4450000,
            achievedPercent: 37.08,
            amountToAchieve: 7550000,
          },
          {
            analyticAccountId: analyticMap.get("Diwali & Festive 2026 Campaign")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 2500000,
            achievedAmount: 350000,
            achievedPercent: 14.0,
            amountToAchieve: 2150000,
          },
        ],
      },
    },
  });

  console.log("✓ Created 4 Budgets (including revision chain: Original Cancelled -> Revised Confirmed, and Draft).");

  // ============================================================================
  // SUMMARY REPORT
  // ============================================================================
  console.log("\n===============================================================");
  console.log("✅ ALL 26 PRISMA MODELS SEEDED SUCCESSFULLY WITH ZERO ERRORS!");
  console.log("===============================================================");
  console.log(`1.  CompanySettings:            1 (Maharaja Furniture Solutions)`);
  console.log(`2.  ChartOfAccount:             ${chartOfAccountsData.length} (Assets, Liab, Capital, Income, Exp, Cash, Bank)`);
  console.log(`3.  Journal:                    ${journalsData.length} (Sales, Purchase, Bank, Cash)`);
  console.log(`4.  TaxRate:                    ${taxRatesData.length} (0%, 5%, 12%, 18%, 28%)`);
  console.log(`5.  AnalyticAccount:            ${analyticAccountsData.length} (Showrooms, Channels, Cost Centers)`);
  console.log(`6.  ProductCategory:            ${categoriesData.length}`);
  console.log(`7.  Product:                    ${productsData.length} (Normal stock, Low-stock alerts, Combos, Services)`);
  console.log(`8.  User:                       5 (Admin, Accountant, Portal Customers, Portal Vendor)`);
  console.log(`9.  Contact:                    ${contactsData.length} (Vendors, Customers, Both)`);
  console.log(`10. PurchaseOrder:              ${purchaseScenarios.length} (Draft, Confirmed, Cancelled)`);
  console.log(`11. PurchaseOrderLine:          Multiple multi-item rows`);
  console.log(`12. VendorBill:                 ${purchaseScenarios.length - 1} (Not Paid, Partial, Paid, Overdue)`);
  console.log(`13. VendorBillLine:             Multiple rows`);
  console.log(`14. BillPayment:                Multi-month Bank & Cash settlements`);
  console.log(`15. SalesOrder:                 ${salesScenarios.length} (Draft, Confirmed, Cancelled)`);
  console.log(`16. SalesOrderLine:             Multiple multi-item rows with GST`);
  console.log(`17. CustomerInvoice:            ${salesScenarios.length - 1} (Paid, Partial, Overdue, Due Soon)`);
  console.log(`18. CustomerInvoiceLine:        Multiple rows`);
  console.log(`19. InvoicePayment:             Manual & Gateway payments`);
  console.log(`20. PaymentGatewayTransaction:  Razorpay Success & Failed records`);
  console.log(`21. JournalEntry:               Over 25 balanced double-entry vouchers`);
  console.log(`22. JournalEntryLine:           100% debit-credit balanced`);
  console.log(`23. Budget:                     4 budgets with revision chaining`);
  console.log(`24. BudgetLine:                 Committed vs Achieved tracking`);
  console.log(`25. BillEmailLog:               Due Soon & Overdue email audit logs`);
  console.log(`26. InvoiceEmailLog:            Sent and Failed email logs`);
  console.log("===============================================================");
  console.log("🔑 LOGIN CREDENTIALS:");
  console.log("   • Administrator:     admin001 / Admin@123");
  console.log("   • Accountant:        acct001  / Account@123");
  console.log("   • Portal Customer 1: cust001  / Contact@123 (Taj Hotels Procurement)");
  console.log("   • Portal Customer 2: cust002  / Contact@123 (Rajesh Kumar)");
  console.log("   • Portal Vendor:     vend001  / Contact@123 (Rajendra Timber)");
  console.log("===============================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
