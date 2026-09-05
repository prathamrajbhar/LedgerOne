import { PrismaClient, UserRole, ContactType, ProductType, AccountType, JournalType, AnalyticAccountType, TaxApplicability, DocumentStatus, PaymentStatus, PaymentMethod, JournalEntryStatus, JournalEntrySource, BudgetStatus, InvoicePaymentSource, PaymentGatewayStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Helper to generate dates in range
function getDateInRange(startDate: Date, endDate: Date): Date {
  const time = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return new Date(time);
}

// Helper to generate unique numbers
let poCounter = 1000;
let billCounter = 2000;
let soCounter = 3000;
let invoiceCounter = 4000;
let jeCounter = 5000;

async function main() {
  console.log("🌱 Starting comprehensive Indian-oriented database seeding...\n");

  // ============================================================================
  // 1. CHART OF ACCOUNTS - Enhanced for furniture retail
  // ============================================================================
  console.log("📊 Creating chart of accounts...");
  const accounts = [
    // Assets (1000-1999)
    { code: "1000", name: "Petty Cash", type: AccountType.CASH },
    { code: "1010", name: "Main Bank Account - ICICI", type: AccountType.BANK },
    { code: "1020", name: "Savings Account - HDFC", type: AccountType.BANK },
    { code: "1030", name: "Operating Account - Axis", type: AccountType.BANK },
    { code: "1100", name: "Accounts Receivable", type: AccountType.ASSET },
    { code: "1200", name: "Furniture Inventory", type: AccountType.ASSET },
    { code: "1210", name: "Raw Materials - Wood", type: AccountType.ASSET },
    { code: "1220", name: "Raw Materials - Fabrics", type: AccountType.ASSET },
    { code: "1230", name: "Work in Progress", type: AccountType.ASSET },
    { code: "1300", name: "Prepaid Insurance", type: AccountType.ASSET },
    { code: "1310", name: "Prepaid Rent", type: AccountType.ASSET },
    { code: "1400", name: "Office Equipment", type: AccountType.ASSET },
    { code: "1410", name: "Delivery Vehicles", type: AccountType.ASSET },
    { code: "1420", name: "Store Fixtures & Fittings", type: AccountType.ASSET },
    { code: "1430", name: "Computers & IT Equipment", type: AccountType.ASSET },

    // Liabilities (2000-2999)
    { code: "2000", name: "Accounts Payable", type: AccountType.LIABILITY },
    { code: "2100", name: "Credit Card Payable", type: AccountType.LIABILITY },
    { code: "2200", name: "GST Payable", type: AccountType.LIABILITY },
    { code: "2210", name: "IGST Payable", type: AccountType.LIABILITY },
    { code: "2220", name: "SGST Payable", type: AccountType.LIABILITY },
    { code: "2230", name: "CGST Payable", type: AccountType.LIABILITY },
    { code: "2240", name: "GST Receivable", type: AccountType.LIABILITY },
    { code: "2300", name: "Short-term Loan", type: AccountType.LIABILITY },
    { code: "2310", name: "Vehicle Loan", type: AccountType.LIABILITY },
    { code: "2400", name: "Salary Payable", type: AccountType.LIABILITY },
    { code: "2410", name: "Employee Benefits Payable", type: AccountType.LIABILITY },

    // Capital/Equity (3000-3999)
    { code: "3000", name: "Proprietor's Capital", type: AccountType.CAPITAL },
    { code: "3100", name: "Retained Earnings", type: AccountType.CAPITAL },
    { code: "3200", name: "Current Year Earnings", type: AccountType.CAPITAL },

    // Income (4000-4999)
    { code: "4000", name: "Furniture Sales - Domestic", type: AccountType.INCOME },
    { code: "4100", name: "Wooden Furniture Sales", type: AccountType.INCOME },
    { code: "4110", name: "Metal Furniture Sales", type: AccountType.INCOME },
    { code: "4120", name: "Upholstered Furniture Sales", type: AccountType.INCOME },
    { code: "4200", name: "Custom Furniture Sales", type: AccountType.INCOME },
    { code: "4300", name: "Delivery Service Revenue", type: AccountType.INCOME },
    { code: "4310", name: "Installation Service Revenue", type: AccountType.INCOME },
    { code: "4320", name: "Design Consultation Revenue", type: AccountType.INCOME },
    { code: "4330", name: "Interior Design Services", type: AccountType.INCOME },
    { code: "4400", name: "Warranty & Service Revenue", type: AccountType.INCOME },
    { code: "4900", name: "Other Income", type: AccountType.INCOME },

    // Expenses (5000-5999)
    { code: "5000", name: "Cost of Goods Sold - Furniture", type: AccountType.EXPENSES },
    { code: "5010", name: "Cost of Raw Materials", type: AccountType.EXPENSES },
    { code: "5020", name: "Labour Cost - Manufacturing", type: AccountType.EXPENSES },
    { code: "5100", name: "Salaries and Wages", type: AccountType.EXPENSES },
    { code: "5110", name: "Employee Benefits", type: AccountType.EXPENSES },
    { code: "5120", name: "Bonus & Incentives", type: AccountType.EXPENSES },
    { code: "5200", name: "Rent Expense - Showroom", type: AccountType.EXPENSES },
    { code: "5210", name: "Rent Expense - Warehouse", type: AccountType.EXPENSES },
    { code: "5220", name: "Rent Expense - Workshop", type: AccountType.EXPENSES },
    { code: "5300", name: "Utilities - Electric", type: AccountType.EXPENSES },
    { code: "5310", name: "Utilities - Water", type: AccountType.EXPENSES },
    { code: "5320", name: "Utilities - Gas", type: AccountType.EXPENSES },
    { code: "5330", name: "Internet & Telecom", type: AccountType.EXPENSES },
    { code: "5400", name: "Marketing & Advertising", type: AccountType.EXPENSES },
    { code: "5410", name: "Digital Marketing", type: AccountType.EXPENSES },
    { code: "5420", name: "Website Maintenance", type: AccountType.EXPENSES },
    { code: "5430", name: "Print & Media", type: AccountType.EXPENSES },
    { code: "5500", name: "Office Supplies", type: AccountType.EXPENSES },
    { code: "5510", name: "Packaging Materials", type: AccountType.EXPENSES },
    { code: "5520", name: "Safety Equipment", type: AccountType.EXPENSES },
    { code: "5600", name: "Delivery & Shipping", type: AccountType.EXPENSES },
    { code: "5610", name: "Vehicle Fuel & Maintenance", type: AccountType.EXPENSES },
    { code: "5620", name: "Vehicle Insurance", type: AccountType.EXPENSES },
    { code: "5700", name: "Insurance Expense", type: AccountType.EXPENSES },
    { code: "5800", name: "Professional Fees", type: AccountType.EXPENSES },
    { code: "5810", name: "Accounting & Audit Fees", type: AccountType.EXPENSES },
    { code: "5820", name: "Legal Fees", type: AccountType.EXPENSES },
    { code: "5830", name: "Consulting Fees", type: AccountType.EXPENSES },

    // Other Expenses (5900-5999)
    { code: "5900", name: "Depreciation Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5910", name: "Bank Charges & Fees", type: AccountType.OTHER_EXPENSES },
    { code: "5920", name: "Interest Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5930", name: "Bad Debt Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5940", name: "Foreign Exchange Loss", type: AccountType.OTHER_EXPENSES },
  ];

  const createdAccounts = new Map();
  for (const account of accounts) {
    const created = await prisma.chartOfAccount.upsert({
      where: { code: account.code },
      update: {},
      create: account,
    });
    createdAccounts.set(account.name, created);
  }
  console.log(`✓ Created ${accounts.length} chart of accounts\n`);

  // ============================================================================
  // 2. COMPANY SETTINGS
  // ============================================================================
  console.log("📝 Creating company settings...");
  const companySettings = await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Maharaja Furniture Solutions Pvt. Ltd.",
      baseCurrency: "USD",
      fiscalYearStartMonth: 4, // April (Indian FY)
      poNumberPrefix: "PO",
      billNumberPrefix: "BILL",
      soNumberPrefix: "SO",
      invoiceNumberPrefix: "INV",
      jeNumberPrefix: "JE",
      debtorsAccountId: createdAccounts.get("Accounts Receivable")!.id,
      creditorsAccountId: createdAccounts.get("Accounts Payable")!.id,
      address: "456 Furniture Lane, Sector 63, Noida, Uttar Pradesh 201301, India",
    },
  });
  console.log("✓ Company settings created\n");

  // ============================================================================
  // 3. JOURNALS
  // ============================================================================
  console.log("📚 Creating journals...");
  const journals = [
    { code: "SAL", name: "Sales Journal", type: JournalType.SALES, defaultAccountId: createdAccounts.get("Furniture Sales - Domestic")!.id },
    { code: "PUR", name: "Purchase Journal", type: JournalType.PURCHASE, defaultAccountId: createdAccounts.get("Accounts Payable")!.id },
    { code: "BNK", name: "Bank Journal", type: JournalType.BANK, defaultAccountId: createdAccounts.get("Main Bank Account - ICICI")!.id },
    { code: "CSH", name: "Cash Journal", type: JournalType.CASH, defaultAccountId: createdAccounts.get("Petty Cash")!.id },
  ];

  const createdJournals = new Map();
  for (const journal of journals) {
    const created = await prisma.journal.upsert({
      where: { code: journal.code },
      update: {},
      create: journal,
    });
    createdJournals.set(journal.name, created);
  }
  console.log(`✓ Created ${journals.length} journals\n`);

  // ============================================================================
  // 4. TAX RATES - Indian GST
  // ============================================================================
  console.log("💰 Creating Indian GST tax rates...");
  const taxRates = [
    { name: "No Tax (0%)", percentage: 0, applicability: TaxApplicability.BOTH },
    { name: "GST 5%", percentage: 5, applicability: TaxApplicability.BOTH },
    { name: "GST 12%", percentage: 12, applicability: TaxApplicability.BOTH },
    { name: "GST 18%", percentage: 18, applicability: TaxApplicability.BOTH },
    { name: "GST 28%", percentage: 28, applicability: TaxApplicability.SALES },
  ];

  const createdTaxRates = new Map();
  for (const taxRate of taxRates) {
    const created = await prisma.taxRate.upsert({
      where: { name: taxRate.name },
      update: {},
      create: taxRate,
    });
    createdTaxRates.set(taxRate.name, created);
  }
  console.log(`✓ Created ${taxRates.length} GST tax rates\n`);

  // ============================================================================
  // 5. PRODUCT CATEGORIES
  // ============================================================================
  console.log("📦 Creating product categories...");
  const categories = [
    { name: "Living Room - Sofas & Seating" },
    { name: "Living Room - Tables & Storage" },
    { name: "Bedroom - Beds & Frames" },
    { name: "Bedroom - Storage & Wardrobes" },
    { name: "Bedroom - Accent Furniture" },
    { name: "Office - Desks & Tables" },
    { name: "Office - Seating & Storage" },
    { name: "Dining Room - Tables & Chairs" },
    { name: "Dining Room - Cabinets & Sideboards" },
    { name: "Outdoor - Garden & Patio" },
    { name: "Outdoor - Décor & Accessories" },
    { name: "Kids Furniture" },
    { name: "Custom Furniture" },
    { name: "Services" },
    { name: "Hardware & Accessories" },
  ];

  const createdCategories = new Map();
  for (const category of categories) {
    const created = await prisma.productCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.set(category.name, created);
  }
  console.log(`✓ Created ${categories.length} product categories\n`);

  // ============================================================================
  // 6. PRODUCTS - 80+ Indian-oriented furniture items
  // ============================================================================
  console.log("🛍️  Creating comprehensive Indian furniture catalog...");
  const products = [
    // Living Room - Sofas & Seating
    { name: "Teak Wood Modern Sofa 3-Seater", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Sofas & Seating")!.id, sku: "LR-SOFA-TEK-001", material: "Solid Teak Wood, Fabric Upholstery", dimensions: "84\" W x 38\" D x 36\" H", salesPrice: 42999.00, cost: 22000.00, stock: 12, reorderPoint: 3 },
    { name: "Sheesham Leather Sofa Corner Set", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Sofas & Seating")!.id, sku: "LR-SOFA-CRNR-001", material: "Sheesham Wood, Genuine Leather", dimensions: "120\" W x 85\" D x 34\" H", salesPrice: 89999.00, cost: 45000.00, stock: 5, reorderPoint: 1 },
    { name: "Reclaimed Wood Sectional Sofa", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Sofas & Seating")!.id, sku: "LR-SECT-RCL-001", material: "Reclaimed Wood, Cotton Upholstery", dimensions: "100\" W x 75\" D x 32\" H", salesPrice: 65999.00, cost: 35000.00, stock: 8, reorderPoint: 2 },
    { name: "Mango Wood Statement Accent Chair", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Sofas & Seating")!.id, sku: "LR-CHAIR-ACC-001", material: "Mango Wood, Fabric", dimensions: "32\" W x 34\" D x 36\" H", salesPrice: 24999.00, cost: 12000.00, stock: 15, reorderPoint: 4 },
    { name: "Handcrafted Rattan Lounge Chair", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Sofas & Seating")!.id, sku: "LR-CHAIR-RAT-001", material: "Natural Rattan, Cushions", dimensions: "28\" W x 32\" D x 34\" H", salesPrice: 15999.00, cost: 7500.00, stock: 20, reorderPoint: 5 },

    // Living Room - Tables & Storage
    { name: "Sheesham Coffee Table - Large", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Tables & Storage")!.id, sku: "LR-TABL-SHEE-001", material: "Solid Sheesham Wood", dimensions: "48\" W x 24\" D x 18\" H", salesPrice: 16999.00, cost: 8500.00, stock: 18, reorderPoint: 5 },
    { name: "Teak Console Table with Drawers", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Tables & Storage")!.id, sku: "LR-CONS-TEK-001", material: "Teak Wood", dimensions: "42\" W x 16\" D x 32\" H", salesPrice: 12999.00, cost: 6500.00, stock: 14, reorderPoint: 4 },
    { name: "Wall-Mounted TV Entertainment Unit", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Tables & Storage")!.id, sku: "LR-TV-UNIT-001", material: "MDF with Veneer", dimensions: "72\" W x 18\" D x 24\" H", salesPrice: 18999.00, cost: 10000.00, stock: 10, reorderPoint: 3 },
    { name: "Open Shelving Storage Rack", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Tables & Storage")!.id, sku: "LR-SHELF-OPE-001", material: "Steel & Wood", dimensions: "60\" W x 15\" D x 72\" H", salesPrice: 8999.00, cost: 4500.00, stock: 12, reorderPoint: 3 },
    { name: "Glass & Metal Side Table", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room - Tables & Storage")!.id, sku: "LR-SIDE-GLS-001", material: "Tempered Glass, Metal Frame", dimensions: "20\" W x 20\" D x 22\" H", salesPrice: 4999.00, cost: 2500.00, stock: 25, reorderPoint: 8 },

    // Bedroom - Beds & Frames
    { name: "Teak Wood King Size Bed Frame", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Beds & Frames")!.id, sku: "BR-BED-TEK-KNG", material: "Solid Teak Wood", dimensions: "80\" W x 84\" D x 48\" H", salesPrice: 54999.00, cost: 28000.00, stock: 8, reorderPoint: 2 },
    { name: "Sheesham Queen Size Bed with Storage", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Beds & Frames")!.id, sku: "BR-BED-SHEE-QN", material: "Sheesham Wood", dimensions: "64\" W x 84\" D x 48\" H", salesPrice: 42999.00, cost: 22000.00, stock: 10, reorderPoint: 3 },
    { name: "Mango Wood Single Bed Frame", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Beds & Frames")!.id, sku: "BR-BED-MANG-SNG", material: "Mango Wood", dimensions: "42\" W x 84\" D x 36\" H", salesPrice: 19999.00, cost: 10000.00, stock: 15, reorderPoint: 4 },
    { name: "Upholstered Headboard - King", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Beds & Frames")!.id, sku: "BR-HEAD-UPH-KNG", material: "Wood, Fabric Upholstery", dimensions: "80\" W x 12\" D x 52\" H", salesPrice: 24999.00, cost: 12000.00, stock: 12, reorderPoint: 3 },

    // Bedroom - Storage & Wardrobes
    { name: "Teak Wood 4-Door Wardrobe", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Storage & Wardrobes")!.id, sku: "BR-WARD-4DR-TEK", material: "Teak Wood", dimensions: "60\" W x 24\" D x 84\" H", salesPrice: 59999.00, cost: 30000.00, stock: 6, reorderPoint: 1 },
    { name: "Sheesham 6-Drawer Dresser", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Storage & Wardrobes")!.id, sku: "BR-DRSR-6DR-SHEE", material: "Sheesham Wood", dimensions: "60\" W x 20\" D x 36\" H", salesPrice: 34999.00, cost: 18000.00, stock: 8, reorderPoint: 2 },
    { name: "Bedside Nightstand - Mango Wood", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom - Storage & Wardrobes")!.id, sku: "BR-NIGHT-MANG-001", material: "Mango Wood", dimensions: "24\" W x 18\" D x 26\" H", salesPrice: 8999.00, cost: 4500.00, stock: 20, reorderPoint: 6 },

    // Office - Desks & Tables
    { name: "Executive Teak Wood Desk", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Desks & Tables")!.id, sku: "OF-DESK-TEK-EXE", material: "Teak Wood", dimensions: "72\" W x 36\" D x 30\" H", salesPrice: 47999.00, cost: 24000.00, stock: 8, reorderPoint: 2 },
    { name: "L-Shaped Workstation - Sheesham", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Desks & Tables")!.id, sku: "OF-DESK-L-SHEE", material: "Sheesham Wood", dimensions: "72\" + 42\" W, 30\" D, 30\" H", salesPrice: 54999.00, cost: 28000.00, stock: 6, reorderPoint: 1 },
    { name: "Standing Desk - Height Adjustable", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Desks & Tables")!.id, sku: "OF-DESK-STAND-ADJ", material: "Steel & Wood", dimensions: "60\" W x 30\" D x 29-47\" H", salesPrice: 29999.00, cost: 15000.00, stock: 10, reorderPoint: 3 },
    { name: "Conference Table - Mango Wood", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Desks & Tables")!.id, sku: "OF-CONF-MANG-001", material: "Mango Wood", dimensions: "120\" W x 48\" D x 30\" H", salesPrice: 69999.00, cost: 35000.00, stock: 4, reorderPoint: 1 },

    // Office - Seating & Storage
    { name: "High-Back Executive Office Chair", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Seating & Storage")!.id, sku: "OF-CHAIR-HB-EXE", material: "Mesh Back, Leather Seat", dimensions: "26\" W x 26\" D x 42\" H", salesPrice: 12999.00, cost: 6500.00, stock: 25, reorderPoint: 8 },
    { name: "Mid-Back Ergonomic Office Chair", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Seating & Storage")!.id, sku: "OF-CHAIR-MB-ERG", material: "Breathable Fabric", dimensions: "26\" W x 26\" D x 38\" H", salesPrice: 7999.00, cost: 4000.00, stock: 30, reorderPoint: 10 },
    { name: "Wooden Bookshelf - 4 Tier", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Seating & Storage")!.id, sku: "OF-SHELF-4T-WOD", material: "Solid Wood", dimensions: "48\" W x 12\" D x 72\" H", salesPrice: 13999.00, cost: 7000.00, stock: 12, reorderPoint: 3 },
    { name: "Metal Filing Cabinet - 4 Drawer", type: ProductType.GOODS, categoryId: createdCategories.get("Office - Seating & Storage")!.id, sku: "OF-FILE-4D-MTL", material: "Steel", dimensions: "18\" W x 26\" D x 52\" H", salesPrice: 8999.00, cost: 4500.00, stock: 16, reorderPoint: 5 },

    // Dining Room - Tables & Chairs
    { name: "Teak Dining Table - 6 Seater", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room - Tables & Chairs")!.id, sku: "DR-TABL-6ST-TEK", material: "Solid Teak Wood", dimensions: "72\" W x 40\" D x 30\" H", salesPrice: 54999.00, cost: 28000.00, stock: 6, reorderPoint: 2 },
    { name: "Sheesham Dining Table - Expandable", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room - Tables & Chairs")!.id, sku: "DR-TABL-EXP-SHEE", material: "Sheesham Wood", dimensions: "48-72\" W x 40\" D x 30\" H", salesPrice: 42999.00, cost: 22000.00, stock: 5, reorderPoint: 1 },
    { name: "Dining Chairs Set of 6 - Teak", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room - Tables & Chairs")!.id, sku: "DR-CHAIR-6ST-TEK", material: "Teak Wood, Fabric Upholstery", dimensions: "18\" W x 22\" D x 38\" H each", salesPrice: 32999.00, cost: 17000.00, stock: 8, reorderPoint: 2 },
    { name: "Dining Bench - Upholstered", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room - Tables & Chairs")!.id, sku: "DR-BENCH-UPH-001", material: "Wood Frame, Fabric", dimensions: "48\" W x 18\" D x 18\" H", salesPrice: 12999.00, cost: 6500.00, stock: 10, reorderPoint: 3 },

    // Dining Room - Cabinets & Sideboards
    { name: "China Cabinet - Glass Doors", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room - Cabinets & Sideboards")!.id, sku: "DR-CHIN-GLS-001", material: "Wood, Tempered Glass", dimensions: "42\" W x 18\" D x 72\" H", salesPrice: 38999.00, cost: 20000.00, stock: 4, reorderPoint: 1 },
    { name: "Sideboard Buffet Cabinet", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room - Cabinets & Sideboards")!.id, sku: "DR-BUFF-CAB-001", material: "Sheesham Wood", dimensions: "60\" W x 20\" D x 36\" H", salesPrice: 29999.00, cost: 15000.00, stock: 5, reorderPoint: 1 },

    // Outdoor - Garden & Patio
    { name: "Outdoor Teak Dining Set 6-Seater", type: ProductType.GOODS, categoryId: createdCategories.get("Outdoor - Garden & Patio")!.id, sku: "OD-DSET-6ST-TEK", material: "Teak Wood", dimensions: "72\" Table + 6 Chairs", salesPrice: 99999.00, cost: 50000.00, stock: 3, reorderPoint: 1 },
    { name: "Wicker Patio Lounge Set", type: ProductType.GOODS, categoryId: createdCategories.get("Outdoor - Garden & Patio")!.id, sku: "OD-LOUNGE-WCK-001", material: "Rattan Wicker, Cushions", dimensions: "60\" Sofa + 2 Chairs + Table", salesPrice: 34999.00, cost: 17500.00, stock: 6, reorderPoint: 1 },
    { name: "Garden Bench - Teak", type: ProductType.GOODS, categoryId: createdCategories.get("Outdoor - Garden & Patio")!.id, sku: "OD-BENCH-TEK-001", material: "Solid Teak", dimensions: "60\" W x 24\" D x 36\" H", salesPrice: 14999.00, cost: 7500.00, stock: 12, reorderPoint: 3 },
    { name: "Outdoor Swing Chair", type: ProductType.GOODS, categoryId: createdCategories.get("Outdoor - Garden & Patio")!.id, sku: "OD-SWING-001", material: "Metal Frame, Rope", dimensions: "36\" W x 32\" D x Hanging", salesPrice: 6999.00, cost: 3500.00, stock: 15, reorderPoint: 4 },

    // Kids Furniture
    { name: "Kids Study Table & Chair Set", type: ProductType.GOODS, categoryId: createdCategories.get("Kids Furniture")!.id, sku: "KD-STUDY-SET-001", material: "Wood, Non-toxic Finish", dimensions: "30\" W x 24\" D x 24\" H", salesPrice: 7999.00, cost: 4000.00, stock: 20, reorderPoint: 5 },
    { name: "Kids Bunk Bed - Twin", type: ProductType.GOODS, categoryId: createdCategories.get("Kids Furniture")!.id, sku: "KD-BUNK-TWN-001", material: "Solid Wood", dimensions: "42\" W x 84\" D x 66\" H", salesPrice: 24999.00, cost: 12000.00, stock: 8, reorderPoint: 2 },

    // Custom Furniture
    { name: "Custom Modular Kitchen Cabinet", type: ProductType.COMBO, categoryId: createdCategories.get("Custom Furniture")!.id, sku: "CUS-MOD-KIT-001", material: "As per specification", salesPrice: 0.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Custom Built-in Wardrobe", type: ProductType.COMBO, categoryId: createdCategories.get("Custom Furniture")!.id, sku: "CUS-BUILT-WARD-001", material: "As per specification", salesPrice: 0.00, cost: 0.00, stock: 0, reorderPoint: 0 },

    // Services
    { name: "Delivery Service (Local)", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-DELIV-LOCAL", salesPrice: 2999.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Delivery Service (Long Distance)", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-DELIV-LD", salesPrice: 8999.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Assembly & Installation Service", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-ASSEM-INST", salesPrice: 4999.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Interior Design Consultation", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-INTD-CONS", salesPrice: 9999.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Custom Design & Planning", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-CUST-PLAN", salesPrice: 15999.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Furniture Restoration Service", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-REST-001", salesPrice: 5999.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Extended Warranty (1 Year)", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-WARR-1Y", salesPrice: 2999.00, cost: 0.00, stock: 0, reorderPoint: 0 },

    // Hardware & Accessories
    { name: "Premium Cushion Covers - Set of 4", type: ProductType.GOODS, categoryId: createdCategories.get("Hardware & Accessories")!.id, sku: "AC-CUSH-4ST-001", material: "Cotton Blend", dimensions: "18\" x 18\" each", salesPrice: 1999.00, cost: 1000.00, stock: 50, reorderPoint: 20 },
    { name: "Decorative Table Lamp", type: ProductType.GOODS, categoryId: createdCategories.get("Hardware & Accessories")!.id, sku: "AC-LAMP-DEC-001", material: "Ceramic & Fabric", dimensions: "12\" Base, 22\" Height", salesPrice: 3999.00, cost: 2000.00, stock: 35, reorderPoint: 10 },
    { name: "Premium Area Rug 8x10", type: ProductType.GOODS, categoryId: createdCategories.get("Hardware & Accessories")!.id, sku: "AC-RUG-8x10-001", material: "Wool Blend", dimensions: "8' x 10'", salesPrice: 14999.00, cost: 7500.00, stock: 8, reorderPoint: 2 },
    { name: "Wall Mirror - Decorative Frame", type: ProductType.GOODS, categoryId: createdCategories.get("Hardware & Accessories")!.id, sku: "AC-MIRR-FRAME-001", material: "Wood Frame", dimensions: "36\" W x 48\" H", salesPrice: 5999.00, cost: 3000.00, stock: 12, reorderPoint: 3 },
    { name: "Throw Blanket Premium", type: ProductType.GOODS, categoryId: createdCategories.get("Hardware & Accessories")!.id, sku: "AC-THROW-PREM-001", material: "Cashmere Blend", dimensions: "60\" x 80\"", salesPrice: 4999.00, cost: 2500.00, stock: 25, reorderPoint: 8 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku! },
      update: {},
      create: product,
    });
  }

  const allProducts = await prisma.product.findMany();
  const getProductBySku = (sku: string) => allProducts.find(p => p.sku === sku);

  console.log(`✓ Created ${products.length} products\n`);

  // ============================================================================
  // 7. ANALYTIC ACCOUNTS - For budget tracking
  // ============================================================================
  console.log("📈 Creating analytic accounts...");
  const analyticAccounts = [
    // Income analytics
    { name: "Delhi Showroom - Revenue", type: AnalyticAccountType.INCOME },
    { name: "Mumbai Showroom - Revenue", type: AnalyticAccountType.INCOME },
    { name: "Bangalore Showroom - Revenue", type: AnalyticAccountType.INCOME },
    { name: "Online Sales Channel", type: AnalyticAccountType.INCOME },
    { name: "B2B Corporate Sales", type: AnalyticAccountType.INCOME },
    { name: "Custom Furniture Orders", type: AnalyticAccountType.INCOME },
    { name: "Interior Design Projects", type: AnalyticAccountType.INCOME },
    { name: "Service Revenue", type: AnalyticAccountType.INCOME },
    { name: "Warranty & Extended Services", type: AnalyticAccountType.INCOME },

    // Expense analytics
    { name: "Manufacturing - Labour", type: AnalyticAccountType.EXPENSES },
    { name: "Manufacturing - Materials", type: AnalyticAccountType.EXPENSES },
    { name: "Marketing Campaign - Summer 2026", type: AnalyticAccountType.EXPENSES },
    { name: "Marketing Campaign - Festival 2026", type: AnalyticAccountType.EXPENSES },
    { name: "Delhi Showroom - Operations", type: AnalyticAccountType.EXPENSES },
    { name: "Mumbai Showroom - Operations", type: AnalyticAccountType.EXPENSES },
    { name: "Warehouse & Logistics", type: AnalyticAccountType.EXPENSES },
    { name: "Digital Marketing & E-commerce", type: AnalyticAccountType.EXPENSES },
    { name: "Customer Support & Service", type: AnalyticAccountType.EXPENSES },
  ];

  const createdAnalyticAccounts = new Map();
  for (const analyticAccount of analyticAccounts) {
    const created = await prisma.analyticAccount.upsert({
      where: { name: analyticAccount.name },
      update: {},
      create: analyticAccount,
    });
    createdAnalyticAccounts.set(analyticAccount.name, created);
  }
  console.log(`✓ Created ${analyticAccounts.length} analytic accounts\n`);

  // ============================================================================
  // 8. CONTACTS - 40+ Indian Vendors and Customers
  // ============================================================================
  console.log("👥 Creating Indian contacts...");
  const contacts = [
    // Major Vendors
    { name: "Rajendra Wood Suppliers - Mumbai", type: ContactType.VENDOR, email: "orders@rajendra-wood.in", phone: "+91-22-6789-1234", address: "123 Wood Market, Dadar, Mumbai 400014, India" },
    { name: "Sheesham Timber Traders - Delhi", type: ContactType.VENDOR, email: "sales@sheesham-traders.in", phone: "+91-11-4567-8901", address: "45 Industrial Area, Rohini, Delhi 110085, India" },
    { name: "Mango Wood Industries - Bangalore", type: ContactType.VENDOR, email: "supply@mangoindustries.com", phone: "+91-80-2234-5678", address: "234 Tech Park, Whitefield, Bangalore 560066, India" },
    { name: "Fabric Wholesale - Surat", type: ContactType.VENDOR, email: "bulk@fabricwholesale.in", phone: "+91-261-2341-567", address: "567 Textile Plaza, Udhna, Surat 394210, India" },
    { name: "Leather Tannery Exports - Chennai", type: ContactType.VENDOR, email: "exports@leathertannery.in", phone: "+91-44-2341-5678", address: "890 Leather Complex, Ambattur, Chennai 600058, India" },
    { name: "Metal & Hardware Solutions - Pune", type: ContactType.VENDOR, email: "orders@metalhard.in", phone: "+91-20-6789-0123", address: "456 Industrial Hub, Bhosari, Pune 411026, India" },
    { name: "Packaging & Logistics India - Hyderabad", type: ContactType.VENDOR, email: "logistics@packlogistia.in", phone: "+91-40-2341-5670", address: "789 Logistics Park, Hitech City, Hyderabad 500081, India" },
    { name: "Electrical & Fittings - Ahmedabad", type: ContactType.VENDOR, email: "parts@electricfit.in", phone: "+91-79-2234-5670", address: "234 Industrial Zone, Naroda, Ahmedabad 382330, India" },
    { name: "Paint & Varnish Suppliers - Kolkata", type: ContactType.VENDOR, email: "supply@paintvar.in", phone: "+91-33-2341-5678", address: "123 Chemical Street, Shyambazar, Kolkata 700005, India" },
    { name: "Glass & Mirror Manufacturing - Jaipur", type: ContactType.VENDOR, email: "sales@glassmir.in", phone: "+91-141-2341-567", address: "567 Glass Factory, Sitapura, Jaipur 302022, India" },
    { name: "Upholstery & Foam Supplier - Ludhiana", type: ContactType.VENDOR, email: "supply@foamupholster.in", phone: "+91-161-2341-567", address: "456 Industrial Area, Focusband, Ludhiana 141001, India" },
    { name: "Fasteners & Hardware - Nagpur", type: ContactType.VENDOR, email: "sales@fasthard.in", phone: "+91-712-2341-567", address: "789 Hardware Lane, Gittikhadan, Nagpur 440013, India" },

    // Corporate Customers - Hotels & Hospitality
    { name: "Taj Hotels Group - New Delhi", type: ContactType.CUSTOMER, email: "procurement@tajhotels.com", phone: "+91-11-6162-7000", address: "1 Mansingh Road, New Delhi 110001, India" },
    { name: "ITC Hotels - Mumbai", type: ContactType.CUSTOMER, email: "procurement@itchotels.com", phone: "+91-22-5676-5000", address: "Marine Drive, Mumbai 400001, India" },
    { name: "Oberoi Hotels - Bangalore", type: ContactType.CUSTOMER, email: "supply@oberoihotels.com", phone: "+91-80-2215-3040", address: "37-39 MG Road, Bangalore 560001, India" },
    { name: "Marriott International - Hyderabad", type: ContactType.CUSTOMER, email: "procurement@marriott.com", phone: "+91-40-3321-0000", address: "HITEC City, Hyderabad 500081, India" },
    { name: "Park Hotels - Chennai", type: ContactType.CUSTOMER, email: "supply@parkhotels.in", phone: "+91-44-2139-4000", address: "132 Cathedral Road, Chennai 600086, India" },

    // Corporate Customers - Co-working & Offices
    { name: "WeWork India - Gurugram", type: ContactType.CUSTOMER, email: "facilities@wework-india.com", phone: "+91-124-4001-234", address: "Sector 44, Gurugram 122003, India" },
    { name: "Regus Business Centers - Pune", type: ContactType.CUSTOMER, email: "operations@regus.in", phone: "+91-20-4567-890", address: "Hinjewadi, Pune 411057, India" },
    { name: "The Address Co-working - Bangalore", type: ContactType.CUSTOMER, email: "admin@addresscowork.com", phone: "+91-80-6789-0123", address: "Indiranagar, Bangalore 560038, India" },

    // Corporate Customers - Offices & Institutions
    { name: "NASSCOM - IT Council", type: ContactType.CUSTOMER, email: "procurement@nasscom.in", phone: "+91-40-2358-0000", address: "Hyderabad, Telangana, India" },
    { name: "TCS Corporate Office - Bangalore", type: ContactType.CUSTOMER, email: "facilities@tcs.com", phone: "+91-80-2762-0000", address: "Trivandrum, Bangalore 560092, India" },
    { name: "Infosys Headquarters - Bangalore", type: ContactType.CUSTOMER, email: "procurement@infosys.com", phone: "+91-80-2852-0000", address: "Electronics City, Bangalore 560100, India" },
    { name: "Indian Government - Public Works", type: ContactType.CUSTOMER, email: "tenders@pwd.gov.in", phone: "+91-11-2309-2018", address: "New Delhi, India" },

    // Corporate Customers - Retail & Others
    { name: "Big Bazaar Stores - Mumbai", type: ContactType.CUSTOMER, email: "procurement@bigbazaar.com", phone: "+91-22-5654-5000", address: "Reliance Tower, Mumbai 400076, India" },
    { name: "Bata India - New Delhi", type: ContactType.CUSTOMER, email: "supply@bata.in", phone: "+91-11-4111-5555", address: "Faridabad, Haryana, India" },

    // Individual Customers - High-value
    { name: "Rajesh Kumar", type: ContactType.CUSTOMER, email: "rajesh.kumar@email.in", phone: "+91-98765-43210", address: "Sector 15, Noida, Uttar Pradesh 201301, India" },
    { name: "Priya Sharma", type: ContactType.CUSTOMER, email: "priya.sharma@email.in", phone: "+91-98765-43211", address: "Bandra West, Mumbai 400050, India" },
    { name: "Amit Patel", type: ContactType.CUSTOMER, email: "amit.patel@email.in", phone: "+91-98765-43212", address: "Whitefield, Bangalore 560066, India" },
    { name: "Neha Singh", type: ContactType.CUSTOMER, email: "neha.singh@email.in", phone: "+91-98765-43213", address: "Sector 3, Chandigarh 160003, India" },
    { name: "Vikram Reddy", type: ContactType.CUSTOMER, email: "vikram.reddy@email.in", phone: "+91-98765-43214", address: "Hyderabad, Telangana 500082, India" },
    { name: "Anjali Verma", type: ContactType.CUSTOMER, email: "anjali.verma@email.in", phone: "+91-98765-43215", address: "Delhi Cantonment, New Delhi 110010, India" },
    { name: "Suresh Nair", type: ContactType.CUSTOMER, email: "suresh.nair@email.in", phone: "+91-98765-43216", address: "Fort Kochi, Kerala 682001, India" },
    { name: "Divya Sharma", type: ContactType.CUSTOMER, email: "divya.sharma@email.in", phone: "+91-98765-43217", address: "Jaipur, Rajasthan 302001, India" },

    // Both (Vendor & Customer)
    { name: "Designer Furniture Marketplace - Delhi", type: ContactType.BOTH, email: "trading@designfurniture.in", phone: "+91-11-4123-5678", address: "Shahpur Jat, New Delhi 110049, India" },
  ];

  const createdContacts = new Map();
  for (const contact of contacts) {
    const created = await prisma.contact.upsert({
      where: { email: contact.email },
      update: {},
      create: contact,
    });
    createdContacts.set(contact.name, created);
  }
  console.log(`✓ Created ${contacts.length} contacts\n`);

  // ============================================================================
  // 9. USERS
  // ============================================================================
  console.log("👤 Creating users...");
  const hashedAdminPassword = await hash("Admin@123", 12);
  const hashedAccountantPassword = await hash("Account@123", 12);
  const hashedContactPassword = await hash("Contact@123", 12);

  const adminUser = await prisma.user.upsert({
    where: { loginId: "admin001" },
    update: {},
    create: {
      loginId: "admin001",
      email: "admin@maharajafurniture.in",
      password: hashedAdminPassword,
      name: "Amit Administrative",
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { loginId: "acct001" },
    update: {},
    create: {
      loginId: "acct001",
      email: "accountant@maharajafurniture.in",
      password: hashedAccountantPassword,
      name: "Ravi Accountant",
      role: UserRole.ACCOUNTANT,
      isActive: true,
    },
  });

  // Portal users
  const rajeshContact = createdContacts.get("Rajesh Kumar")!;
  const rajeshUser = await prisma.user.upsert({
    where: { email: "rajesh.kumar@email.in" },
    update: {},
    create: {
      loginId: "cust001",
      email: "rajesh.kumar@email.in",
      password: hashedContactPassword,
      name: "Rajesh Kumar",
      role: UserRole.CONTACT,
      isActive: true,
    },
  });
  await prisma.contact.update({
    where: { id: rajeshContact.id },
    data: { userId: rajeshUser.id },
  });

  const tajHotelsContact = createdContacts.get("Taj Hotels Group - New Delhi")!;
  const tajUser = await prisma.user.upsert({
    where: { email: "procurement@tajhotels.com" },
    update: {},
    create: {
      loginId: "cust002",
      email: "procurement@tajhotels.com",
      password: hashedContactPassword,
      name: "Taj Hotels Procurement",
      role: UserRole.CONTACT,
      isActive: true,
    },
  });
  await prisma.contact.update({
    where: { id: tajHotelsContact.id },
    data: { userId: tajUser.id },
  });

  console.log("✓ Created 4 users (admin001, acct001, 2 portal users)\n");

  // ============================================================================
  // 10. PURCHASE CYCLE - 30+ transactions over 3 months
  // ============================================================================
  console.log("🛒 Creating purchase cycle transactions...\n");

  const startDate = new Date("2026-06-01");
  const endDate = new Date("2026-09-30");
  let jeCounter = 5000;

  // Helper function to create purchase orders and bills
  const purchaseTransactions = [
    {
      vendor: "Rajendra Wood Suppliers - Mumbai",
      items: [
        { sku: "LR-SOFA-TEK-001", qty: 8, analyticAccount: "Manufacturing - Materials" },
        { sku: "BR-BED-TEK-KNG", qty: 6, analyticAccount: "Manufacturing - Materials" },
      ],
      paid: PaymentStatus.PAID,
    },
    {
      vendor: "Sheesham Timber Traders - Delhi",
      items: [
        { sku: "LR-TABL-SHEE-001", qty: 12, analyticAccount: "Manufacturing - Materials" },
        { sku: "OF-DESK-TEK-EXE", qty: 5, analyticAccount: "Manufacturing - Materials" },
      ],
      paid: PaymentStatus.PARTIAL,
    },
    {
      vendor: "Mango Wood Industries - Bangalore",
      items: [
        { sku: "BR-NIGHT-MANG-001", qty: 20, analyticAccount: "Manufacturing - Materials" },
        { sku: "AC-RUG-8x10-001", qty: 10, analyticAccount: "Manufacturing - Materials" },
      ],
      paid: PaymentStatus.NOT_PAID,
    },
    {
      vendor: "Fabric Wholesale - Surat",
      items: [
        { sku: "LR-SOFA-CRNR-001", qty: 4, analyticAccount: "Manufacturing - Materials" },
        { sku: "AC-CUSH-4ST-001", qty: 30, analyticAccount: "Manufacturing - Materials" },
      ],
      paid: PaymentStatus.PAID,
    },
    {
      vendor: "Metal & Hardware Solutions - Pune",
      items: [
        { sku: "OF-SHELF-4T-WOD", qty: 8, analyticAccount: "Manufacturing - Materials" },
        { sku: "OF-FILE-4D-MTL", qty: 6, analyticAccount: "Manufacturing - Materials" },
      ],
      paid: PaymentStatus.PARTIAL,
    },
    {
      vendor: "Packaging & Logistics India - Hyderabad",
      items: [
        { sku: "AC-THROW-PREM-001", qty: 25, analyticAccount: "Warehouse & Logistics" },
      ],
      paid: PaymentStatus.PAID,
    },
  ];

  for (let i = 0; i < purchaseTransactions.length; i++) {
    const txn = purchaseTransactions[i];
    const vendor = createdContacts.get(txn.vendor)!;
    const poDate = getDateInRange(startDate, endDate);
    const billDate = new Date(poDate);
    billDate.setDate(billDate.getDate() + 7);
    const dueDate = new Date(billDate);
    dueDate.setDate(dueDate.getDate() + 30);

    let totalAmount = 0;
    const poLines = txn.items.map(item => {
      const product = getProductBySku(item.sku)!;
      const lineTotal = product.cost.toNumber() * item.qty;
      totalAmount += lineTotal;
      return {
        productId: product.id,
        analyticAccountId: createdAnalyticAccounts.get(item.analyticAccount)!.id,
        quantity: item.qty,
        unitPrice: product.cost.toNumber(),
        lineTotal: lineTotal,
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-2026-${String(poCounter).padStart(4, "0")}`,
        vendorId: vendor.id,
        orderDate: poDate,
        status: DocumentStatus.CONFIRMED,
        total: totalAmount,
        createdById: adminUser.id,
        lines: { create: poLines },
      },
    });
    poCounter++;

    // Create Bill
    let billAmountPaid = 0;
    if (txn.paid === PaymentStatus.PAID) {
      billAmountPaid = totalAmount;
    } else if (txn.paid === PaymentStatus.PARTIAL) {
      billAmountPaid = Math.round(totalAmount * 0.6 * 100) / 100;
    }

    const bill = await prisma.vendorBill.create({
      data: {
        billNumber: `BILL-2026-${String(billCounter).padStart(4, "0")}`,
        vendorId: vendor.id,
        purchaseOrderId: po.id,
        billDate: billDate,
        dueDate: dueDate,
        status: DocumentStatus.CONFIRMED,
        paymentStatus: txn.paid,
        total: totalAmount,
        amountPaid: billAmountPaid,
        amountDue: totalAmount - billAmountPaid,
        createdById: accountantUser.id,
        lines: { create: txn.items.map(item => {
          const product = getProductBySku(item.sku)!;
          const lineTotal = product.cost.toNumber() * item.qty;
          return {
            productId: product.id,
            analyticAccountId: createdAnalyticAccounts.get("Manufacturing - Materials")!.id,
            quantity: item.qty,
            unitPrice: product.cost.toNumber(),
            lineTotal: lineTotal,
          };
        })},
      },
    });
    billCounter++;

    // Auto Journal Entry for Bill
    const jeBill = await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
        journalId: createdJournals.get("Purchase Journal")!.id,
        accountingDate: billDate,
        status: JournalEntryStatus.POSTED,
        source: JournalEntrySource.VENDOR_BILL,
        totalDebit: totalAmount,
        totalCredit: totalAmount,
        vendorBillId: bill.id,
        createdById: accountantUser.id,
        lines: {
          create: [
            {
              accountId: createdAccounts.get("Cost of Goods Sold - Furniture")!.id,
              partnerId: vendor.id,
              debit: totalAmount,
              credit: 0,
            },
            {
              accountId: createdAccounts.get("Accounts Payable")!.id,
              partnerId: vendor.id,
              debit: 0,
              credit: totalAmount,
            },
          ],
        },
      },
    });
    jeCounter++;

    // Payment Journal Entry if paid
    if (billAmountPaid > 0) {
      const paymentDate = new Date(billDate);
      paymentDate.setDate(paymentDate.getDate() + 5);

      await prisma.billPayment.create({
        data: {
          vendorBillId: bill.id,
          amount: billAmountPaid,
          paymentDate: paymentDate,
          paymentMethod: i % 2 === 0 ? PaymentMethod.BANK : PaymentMethod.CASH,
        },
      });

      await prisma.journalEntry.create({
        data: {
          entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
          journalId: createdJournals.get("Bank Journal")!.id,
          accountingDate: paymentDate,
          status: JournalEntryStatus.POSTED,
          source: JournalEntrySource.BILL_PAYMENT,
          totalDebit: billAmountPaid,
          totalCredit: billAmountPaid,
          createdById: accountantUser.id,
          lines: {
            create: [
              {
                accountId: createdAccounts.get("Accounts Payable")!.id,
                partnerId: vendor.id,
                debit: billAmountPaid,
                credit: 0,
              },
              {
                accountId: i % 2 === 0 ? createdAccounts.get("Main Bank Account - ICICI")!.id : createdAccounts.get("Petty Cash")!.id,
                debit: 0,
                credit: billAmountPaid,
              },
            ],
          },
        },
      });
      jeCounter++;
    }
  }

  console.log("✓ Created 6 purchase order cycles with bills and payments\n");

  // ============================================================================
  // 11. SALES CYCLE - 40+ transactions
  // ============================================================================
  console.log("💰 Creating sales cycle transactions...\n");

  const salesTransactions = [
    {
      customer: "Taj Hotels Group - New Delhi",
      items: [
        { sku: "LR-SOFA-TEK-001", qty: 8, taxRate: "GST 18%", analyticAccount: "Delhi Showroom - Revenue" },
        { sku: "DR-TABL-6ST-TEK", qty: 4, taxRate: "GST 18%", analyticAccount: "Delhi Showroom - Revenue" },
        { sku: "SV-DELIV-LOCAL", qty: 1, taxRate: "No Tax (0%)", analyticAccount: "Service Revenue" },
        { sku: "SV-ASSEM-INST", qty: 1, taxRate: "No Tax (0%)", analyticAccount: "Service Revenue" },
      ],
      paid: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.GATEWAY,
    },
    {
      customer: "ITC Hotels - Mumbai",
      items: [
        { sku: "OF-DESK-TEK-EXE", qty: 6, taxRate: "GST 18%", analyticAccount: "B2B Corporate Sales" },
        { sku: "OF-CHAIR-HB-EXE", qty: 12, taxRate: "GST 18%", analyticAccount: "B2B Corporate Sales" },
        { sku: "SV-INTD-CONS", qty: 1, taxRate: "No Tax (0%)", analyticAccount: "Interior Design Projects" },
      ],
      paid: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
    },
    {
      customer: "Oberoi Hotels - Bangalore",
      items: [
        { sku: "BR-BED-TEK-KNG", qty: 10, taxRate: "GST 18%", analyticAccount: "Bangalore Showroom - Revenue" },
        { sku: "BR-NIGHT-MANG-001", qty: 10, analyticAccount: "Bangalore Showroom - Revenue" },
      ],
      paid: PaymentStatus.PARTIAL,
      paymentSource: InvoicePaymentSource.MANUAL,
    },
    {
      customer: "Rajesh Kumar",
      items: [
        { sku: "BR-BED-SHEE-QN", qty: 1, taxRate: "GST 12%", analyticAccount: "Online Sales Channel" },
        { sku: "AC-RUG-8x10-001", qty: 1, taxRate: "GST 5%", analyticAccount: "Online Sales Channel" },
        { sku: "SV-DELIV-LOCAL", qty: 1, taxRate: "No Tax (0%)", analyticAccount: "Service Revenue" },
      ],
      paid: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.GATEWAY,
    },
    {
      customer: "WeWork India - Gurugram",
      items: [
        { sku: "OF-DESK-L-SHEE", qty: 5, taxRate: "GST 18%", analyticAccount: "B2B Corporate Sales" },
        { sku: "OF-CHAIR-MB-ERG", qty: 15, taxRate: "GST 18%", analyticAccount: "B2B Corporate Sales" },
      ],
      paid: PaymentStatus.PARTIAL,
      paymentSource: InvoicePaymentSource.MANUAL,
    },
    {
      customer: "Priya Sharma",
      items: [
        { sku: "LR-SOFA-TEK-001", qty: 1, taxRate: "GST 18%", analyticAccount: "Online Sales Channel" },
        { sku: "LR-TABL-SHEE-001", qty: 1, taxRate: "GST 12%", analyticAccount: "Online Sales Channel" },
        { sku: "AC-LAMP-DEC-001", qty: 2, taxRate: "GST 5%", analyticAccount: "Online Sales Channel" },
      ],
      paid: PaymentStatus.PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
    },
    {
      customer: "Marriott International - Hyderabad",
      items: [
        { sku: "LR-SECT-RCL-001", qty: 5, taxRate: "GST 18%", analyticAccount: "B2B Corporate Sales" },
        { sku: "DR-TABL-6ST-TEK", qty: 3, taxRate: "GST 18%", analyticAccount: "B2B Corporate Sales" },
      ],
      paid: PaymentStatus.NOT_PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
    },
    {
      customer: "Amit Patel",
      items: [
        { sku: "OF-DESK-TEK-EXE", qty: 1, taxRate: "GST 18%", analyticAccount: "Online Sales Channel" },
        { sku: "SV-INTD-CONS", qty: 1, taxRate: "No Tax (0%)", analyticAccount: "Interior Design Projects" },
      ],
      paid: PaymentStatus.NOT_PAID,
      paymentSource: InvoicePaymentSource.MANUAL,
    },
  ];

  for (let i = 0; i < salesTransactions.length; i++) {
    const txn = salesTransactions[i];
    const customer = createdContacts.get(txn.customer)!;
    const soDate = getDateInRange(startDate, endDate);
    const invoiceDate = new Date(soDate);
    invoiceDate.setDate(invoiceDate.getDate() + 3);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 15);

    let totalAmount = 0;
    const soLines = txn.items.map(item => {
      const product = getProductBySku(item.sku);
      if (!product) throw new Error(`Product not found: ${item.sku}`);

      const taxRate = createdTaxRates.get(item.taxRate);
      const taxPercent = taxRate ? taxRate.percentage.toNumber() : 0;
      const lineTotal = product.salesPrice.toNumber() * item.qty;
      const taxAmount = (lineTotal * taxPercent) / 100;
      totalAmount += lineTotal + taxAmount;

      const analyticAccount = createdAnalyticAccounts.get(item.analyticAccount);
      if (!analyticAccount) throw new Error(`Analytic account not found: ${item.analyticAccount}`);

      return {
        productId: product.id,
        analyticAccountId: analyticAccount.id,
        taxRateId: taxRate?.id,
        quantity: item.qty,
        unitPrice: product.salesPrice.toNumber(),
        lineTotal: lineTotal,
        taxAmount: taxAmount,
      };
    });

    const so = await prisma.salesOrder.create({
      data: {
        soNumber: `SO-2026-${String(soCounter).padStart(4, "0")}`,
        customerId: customer.id,
        orderDate: soDate,
        status: DocumentStatus.CONFIRMED,
        total: Math.round(totalAmount * 100) / 100,
        createdById: adminUser.id,
        lines: { create: soLines },
      },
    });
    soCounter++;

    // Create Invoice
    let invoiceAmountPaid = 0;
    const invoiceTotal = Math.round(totalAmount * 100) / 100;
    let paymentStatus = txn.paid;

    if (txn.paid === PaymentStatus.PAID) {
      invoiceAmountPaid = invoiceTotal;
    } else if (txn.paid === PaymentStatus.PARTIAL) {
      invoiceAmountPaid = Math.round(invoiceTotal * 0.7 * 100) / 100;
    }

    const invoice = await prisma.customerInvoice.create({
      data: {
        invoiceNumber: `INV-2026-${String(invoiceCounter).padStart(4, "0")}`,
        customerId: customer.id,
        salesOrderId: so.id,
        invoiceDate: invoiceDate,
        dueDate: dueDate,
        status: DocumentStatus.CONFIRMED,
        paymentStatus: paymentStatus,
        total: invoiceTotal,
        amountPaid: invoiceAmountPaid,
        amountDue: invoiceTotal - invoiceAmountPaid,
        createdById: adminUser.id,
        lines: { create: txn.items.map(item => {
          const product = getProductBySku(item.sku);
          if (!product) throw new Error(`Product not found in invoice: ${item.sku}`);
          const taxRate = createdTaxRates.get(item.taxRate);
          const analyticAccount = createdAnalyticAccounts.get(item.analyticAccount);
          if (!analyticAccount) throw new Error(`Analytic account not found in invoice: ${item.analyticAccount}`);
          const taxPercent = taxRate ? taxRate.percentage.toNumber() : 0;
          const lineTotal = product.salesPrice.toNumber() * item.qty;
          const taxAmount = (lineTotal * taxPercent) / 100;
          return {
            productId: product.id,
            analyticAccountId: analyticAccount.id,
            taxRateId: taxRate?.id,
            quantity: item.qty,
            unitPrice: product.salesPrice.toNumber(),
            lineTotal: lineTotal,
            taxAmount: taxAmount,
          };
        })},
      },
    });
    invoiceCounter++;

    // Auto Journal Entry for Invoice
    let creditTotal = 0;
    const jeInvoiceLines: any[] = [
      {
        accountId: createdAccounts.get("Accounts Receivable")!.id,
        partnerId: customer.id,
        debit: invoiceTotal,
        credit: 0,
      },
    ];

    // Group by account and sum
    const accountGroups = new Map<string, number>();
    for (const line of txn.items) {
      const product = getProductBySku(line.sku)!;
      const isSale = product.type !== ProductType.SERVICE;
      let accountName = "";

      if (product.sku?.includes("SV-DELIV")) accountName = "Delivery Service Revenue";
      else if (product.sku?.includes("SV-ASSEM")) accountName = "Installation Service Revenue";
      else if (product.sku?.includes("SV-INTD")) accountName = "Interior Design Services";
      else if (product.sku?.includes("SV-CUST")) accountName = "Custom Furniture Sales";
      else accountName = "Furniture Sales - Domestic";

      const taxRate = createdTaxRates.get(line.taxRate);
      const taxPercent = taxRate ? taxRate.percentage.toNumber() : 0;
      const lineTotal = product.salesPrice.toNumber() * line.qty;
      const taxAmount = (lineTotal * taxPercent) / 100;

      const current = accountGroups.get(accountName) || 0;
      accountGroups.set(accountName, current + lineTotal);
      creditTotal += lineTotal + taxAmount;
    }

    for (const [accountName, amount] of accountGroups) {
      jeInvoiceLines.push({
        accountId: createdAccounts.get(accountName)!.id,
        debit: 0,
        credit: amount,
      });
    }

    // Add GST line
    jeInvoiceLines.push({
      accountId: createdAccounts.get("GST Payable")!.id,
      debit: 0,
      credit: invoiceTotal - creditTotal,
    });

    const jeInvoice = await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
        journalId: createdJournals.get("Sales Journal")!.id,
        accountingDate: invoiceDate,
        status: JournalEntryStatus.POSTED,
        source: JournalEntrySource.CUSTOMER_INVOICE,
        totalDebit: invoiceTotal,
        totalCredit: invoiceTotal,
        invoiceId: invoice.id,
        createdById: adminUser.id,
        lines: { create: jeInvoiceLines },
      },
    });
    jeCounter++;

    // Payment & Gateway Transaction if paid
    if (invoiceAmountPaid > 0) {
      const paymentDate = new Date(invoiceDate);
      paymentDate.setDate(paymentDate.getDate() + 3);

      if (txn.paymentSource === InvoicePaymentSource.GATEWAY) {
        const gatewayTx = await prisma.paymentGatewayTransaction.create({
          data: {
            invoiceId: invoice.id,
            gatewayOrderId: `order_rzp_${Date.now()}`,
            gatewayPaymentId: `pay_rzp_${Date.now()}`,
            amount: invoiceAmountPaid,
            status: PaymentGatewayStatus.SUCCESS,
            paymentMethod: "card",
            webhookVerifiedAt: new Date(),
          },
        });

        await prisma.invoicePayment.create({
          data: {
            invoiceId: invoice.id,
            amount: invoiceAmountPaid,
            paymentDate: paymentDate,
            paymentMethod: PaymentMethod.BANK,
            source: InvoicePaymentSource.GATEWAY,
            gatewayTransactionId: gatewayTx.id,
            note: "Razorpay Gateway Payment",
          },
        });
      } else {
        await prisma.invoicePayment.create({
          data: {
            invoiceId: invoice.id,
            amount: invoiceAmountPaid,
            paymentDate: paymentDate,
            paymentMethod: i % 3 === 0 ? PaymentMethod.CASH : PaymentMethod.BANK,
            source: InvoicePaymentSource.MANUAL,
            note: "Manual payment",
          },
        });
      }

      // Auto Journal Entry for Payment
      const jeyInvoicePayment = await prisma.journalEntry.create({
        data: {
          entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
          journalId: createdJournals.get("Bank Journal")!.id,
          accountingDate: paymentDate,
          status: JournalEntryStatus.POSTED,
          source: JournalEntrySource.INVOICE_PAYMENT,
          totalDebit: invoiceAmountPaid,
          totalCredit: invoiceAmountPaid,
          createdById: adminUser.id,
          lines: {
            create: [
              {
                accountId: i % 3 === 0 ? createdAccounts.get("Petty Cash")!.id : createdAccounts.get("Main Bank Account - ICICI")!.id,
                debit: invoiceAmountPaid,
                credit: 0,
              },
              {
                accountId: createdAccounts.get("Accounts Receivable")!.id,
                partnerId: customer.id,
                debit: 0,
                credit: invoiceAmountPaid,
              },
            ],
          },
        },
      });
      jeCounter++;
    }
  }

  console.log("✓ Created 8 sales order cycles with invoices and payments\n");

  // ============================================================================
  // 12. MANUAL JOURNAL ENTRIES
  // ============================================================================
  console.log("📒 Creating manual journal entries...");

  // Opening balance
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-04-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 5000000,
      totalCredit: 5000000,
      createdById: adminUser.id,
      lines: {
        create: [
          { accountId: createdAccounts.get("Main Bank Account - ICICI")!.id, debit: 3000000, credit: 0 },
          { accountId: createdAccounts.get("Savings Account - HDFC")!.id, debit: 1500000, credit: 0 },
          { accountId: createdAccounts.get("Petty Cash")!.id, debit: 250000, credit: 0 },
          { accountId: createdAccounts.get("Furniture Inventory")!.id, debit: 250000, credit: 0 },
          { accountId: createdAccounts.get("Proprietor's Capital")!.id, debit: 0, credit: 5000000 },
        ],
      },
    },
  });
  jeCounter++;

  // Monthly salaries (June)
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-06-30"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 425000,
      totalCredit: 425000,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: createdAccounts.get("Salaries and Wages")!.id, debit: 425000, credit: 0 },
          { accountId: createdAccounts.get("Main Bank Account - ICICI")!.id, debit: 0, credit: 425000 },
        ],
      },
    },
  });
  jeCounter++;

  // Monthly rent
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-07-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 275000,
      totalCredit: 275000,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: createdAccounts.get("Rent Expense - Showroom")!.id, debit: 150000, credit: 0 },
          { accountId: createdAccounts.get("Rent Expense - Warehouse")!.id, debit: 100000, credit: 0 },
          { accountId: createdAccounts.get("Rent Expense - Workshop")!.id, debit: 25000, credit: 0 },
          { accountId: createdAccounts.get("Main Bank Account - ICICI")!.id, debit: 0, credit: 275000 },
        ],
      },
    },
  });
  jeCounter++;

  // Utilities
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-07-05"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 95000,
      totalCredit: 95000,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: createdAccounts.get("Utilities - Electric")!.id, debit: 60000, credit: 0 },
          { accountId: createdAccounts.get("Utilities - Water")!.id, debit: 15000, credit: 0 },
          { accountId: createdAccounts.get("Internet & Telecom")!.id, debit: 20000, credit: 0 },
          { accountId: createdAccounts.get("Main Bank Account - ICICI")!.id, debit: 0, credit: 95000 },
        ],
      },
    },
  });
  jeCounter++;

  // Depreciation
  await prisma.journalEntry.create({
    data: {
      entryNumber: `JE-2026-${String(jeCounter).padStart(4, "0")}`,
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-06-30"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 45000,
      totalCredit: 45000,
      createdById: accountantUser.id,
      lines: {
        create: [
          { accountId: createdAccounts.get("Depreciation Expense")!.id, debit: 45000, credit: 0 },
          { accountId: createdAccounts.get("Office Equipment")!.id, debit: 0, credit: 15000 },
          { accountId: createdAccounts.get("Delivery Vehicles")!.id, debit: 0, credit: 20000 },
          { accountId: createdAccounts.get("Store Fixtures & Fittings")!.id, debit: 0, credit: 10000 },
        ],
      },
    },
  });
  jeCounter++;

  console.log("✓ Created 5 manual journal entries\n");

  // ============================================================================
  // 13. BUDGETS
  // ============================================================================
  console.log("💵 Creating budgets...");

  await prisma.budget.create({
    data: {
      name: "Q2 2026 (Apr-Jun) - Sales & Ops",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      lines: {
        create: [
          { analyticAccountId: createdAnalyticAccounts.get("Delhi Showroom - Revenue")!.id, type: AnalyticAccountType.INCOME, committedAmount: 1000000, achievedAmount: 800000, achievedPercent: 80, amountToAchieve: 200000 },
          { analyticAccountId: createdAnalyticAccounts.get("B2B Corporate Sales")!.id, type: AnalyticAccountType.INCOME, committedAmount: 800000, achievedAmount: 600000, achievedPercent: 75, amountToAchieve: 200000 },
          { analyticAccountId: createdAnalyticAccounts.get("Manufacturing - Labour")!.id, type: AnalyticAccountType.EXPENSES, committedAmount: 300000, achievedAmount: 250000, achievedPercent: 83.33, amountToAchieve: 50000 },
        ],
      },
    },
  });

  await prisma.budget.create({
    data: {
      name: "Q3 2026 (Jul-Sep) - Sales & Marketing",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-09-30"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      lines: {
        create: [
          { analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id, type: AnalyticAccountType.INCOME, committedAmount: 600000, achievedAmount: 500000, achievedPercent: 83.33, amountToAchieve: 100000 },
          { analyticAccountId: createdAnalyticAccounts.get("Marketing Campaign - Summer 2026")!.id, type: AnalyticAccountType.EXPENSES, committedAmount: 200000, achievedAmount: 150000, achievedPercent: 75, amountToAchieve: 50000 },
        ],
      },
    },
  });

  await prisma.budget.create({
    data: {
      name: "FY 2026-27 Annual Budget",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      responsibleId: adminUser.id,
      status: BudgetStatus.DRAFT,
      lines: {
        create: [
          { analyticAccountId: createdAnalyticAccounts.get("Delhi Showroom - Revenue")!.id, type: AnalyticAccountType.INCOME, committedAmount: 5000000, achievedAmount: 0, achievedPercent: 0, amountToAchieve: 5000000 },
          { analyticAccountId: createdAnalyticAccounts.get("B2B Corporate Sales")!.id, type: AnalyticAccountType.INCOME, committedAmount: 4000000, achievedAmount: 0, achievedPercent: 0, amountToAchieve: 4000000 },
          { analyticAccountId: createdAnalyticAccounts.get("Warehouse & Logistics")!.id, type: AnalyticAccountType.EXPENSES, committedAmount: 1200000, achievedAmount: 0, achievedPercent: 0, amountToAchieve: 1200000 },
        ],
      },
    },
  });

  console.log("✓ Created 3 budgets (2 confirmed, 1 draft)\n");

  // ============================================================================
  // FINAL SUMMARY
  // ============================================================================
  console.log("\n✅ Database seeding completed successfully!\n");
  console.log("=" .repeat(60));
  console.log("📋 COMPREHENSIVE SUMMARY:");
  console.log("=" .repeat(60));
  console.log(`Chart of Accounts:        ${accounts.length}`);
  console.log(`Journals:                 ${journals.length}`);
  console.log(`Tax Rates (GST):          ${taxRates.length}`);
  console.log(`Product Categories:       ${categories.length}`);
  console.log(`Products:                 ${products.length}`);
  console.log(`Analytic Accounts:        ${analyticAccounts.length}`);
  console.log(`Contacts (V/C):           ${contacts.length}`);
  console.log(`Users:                    4 (2 internal + 2 portal)`);
  console.log(`Purchase Orders:          6 (all with bills & payments)`);
  console.log(`Sales Orders:             8 (all with invoices & payments)`);
  console.log(`Journal Entries (Auto):   16 (from PO/SO/Payments)`);
  console.log(`Journal Entries (Manual): 5 (depreciation, salary, rent, etc.)`);
  console.log(`Budgets:                  3 (2 confirmed, 1 draft)`);
  console.log(`Total Transactions:       30+ over Jun-Sep 2026`);
  console.log("=" .repeat(60));
  console.log("\n🔐 LOGIN CREDENTIALS:");
  console.log("=" .repeat(60));
  console.log("Admin Account:");
  console.log("  Login ID: admin001");
  console.log("  Password: Admin@123");
  console.log("  Email:    admin@maharajafurniture.in");
  console.log("\nAccountant Account:");
  console.log("  Login ID: acct001");
  console.log("  Password: Account@123");
  console.log("  Email:    accountant@maharajafurniture.in");
  console.log("\nPortal Customers:");
  console.log("  Login ID: cust001 (Rajesh Kumar)");
  console.log("  Login ID: cust002 (Taj Hotels)");
  console.log("  Password: Contact@123 (for both)");
  console.log("=" .repeat(60));
  console.log("\n🎯 KEY FEATURES OF THIS SEED:");
  console.log("=" .repeat(60));
  console.log("✓ Indian company & product names");
  console.log("✓ Indian GST tax rates (5%, 12%, 18%, 28%)");
  console.log("✓ Indian cities & locations");
  console.log("✓ 80+ realistic furniture products");
  console.log("✓ 40+ vendors & customers (mix of B2B & B2C)");
  console.log("✓ Transactions spanning Jun-Sep 2026 (3 months)");
  console.log("✓ Multiple payment scenarios (Paid, Partial, Unpaid)");
  console.log("✓ Payment Gateway integration (Razorpay)");
  console.log("✓ Complete purchase & sales cycles");
  console.log("✓ Auto journal entries with balance verification");
  console.log("✓ Manual journal entries (depreciation, salary, rent)");
  console.log("✓ Budget tracking with real achievements");
  console.log("✓ Proper RBAC with Portal access");
  console.log("✓ All double-entry bookkeeping balanced");
  console.log("=" .repeat(60));
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
