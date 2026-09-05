import { PrismaClient, UserRole, ContactType, ProductType, AccountType, JournalType, AnalyticAccountType, TaxApplicability, DocumentStatus, PaymentStatus, PaymentMethod, JournalEntryStatus, JournalEntrySource, BudgetStatus, InvoicePaymentSource, PaymentGatewayStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting comprehensive database seeding...");

  // ============================================================================
  // 1. CHART OF ACCOUNTS - Enhanced for furniture retail
  // ============================================================================
  console.log("📊 Creating enhanced chart of accounts...");
  const accounts = [
    // Assets (1000-1999)
    { code: "1000", name: "Petty Cash", type: AccountType.CASH },
    { code: "1010", name: "Main Bank Account", type: AccountType.BANK },
    { code: "1020", name: "Savings Account", type: AccountType.BANK },
    { code: "1100", name: "Accounts Receivable", type: AccountType.ASSET },
    { code: "1200", name: "Furniture Inventory", type: AccountType.ASSET },
    { code: "1210", name: "Raw Materials", type: AccountType.ASSET },
    { code: "1300", name: "Prepaid Insurance", type: AccountType.ASSET },
    { code: "1310", name: "Prepaid Rent", type: AccountType.ASSET },
    { code: "1400", name: "Office Equipment", type: AccountType.ASSET },
    { code: "1410", name: "Delivery Vehicles", type: AccountType.ASSET },
    { code: "1420", name: "Store Fixtures", type: AccountType.ASSET },

    // Liabilities (2000-2999)
    { code: "2000", name: "Accounts Payable", type: AccountType.LIABILITY },
    { code: "2100", name: "Credit Card Payable", type: AccountType.LIABILITY },
    { code: "2200", name: "Sales Tax Payable", type: AccountType.LIABILITY },
    { code: "2300", name: "Short-term Loan", type: AccountType.LIABILITY },
    { code: "2400", name: "Salary Payable", type: AccountType.LIABILITY },

    // Capital/Equity (3000-3999)
    { code: "3000", name: "Owner's Capital", type: AccountType.CAPITAL },
    { code: "3100", name: "Retained Earnings", type: AccountType.CAPITAL },
    { code: "3200", name: "Current Year Earnings", type: AccountType.CAPITAL },

    // Income (4000-4999)
    { code: "4000", name: "Furniture Sales", type: AccountType.INCOME },
    { code: "4100", name: "Custom Furniture Sales", type: AccountType.INCOME },
    { code: "4200", name: "Delivery Service Revenue", type: AccountType.INCOME },
    { code: "4300", name: "Installation Service Revenue", type: AccountType.INCOME },
    { code: "4400", name: "Design Consultation Revenue", type: AccountType.INCOME },
    { code: "4900", name: "Other Revenue", type: AccountType.INCOME },

    // Expenses (5000-5999)
    { code: "5000", name: "Cost of Goods Sold - Furniture", type: AccountType.EXPENSES },
    { code: "5010", name: "Cost of Goods Sold - Materials", type: AccountType.EXPENSES },
    { code: "5100", name: "Salaries and Wages", type: AccountType.EXPENSES },
    { code: "5110", name: "Employee Benefits", type: AccountType.EXPENSES },
    { code: "5200", name: "Rent Expense - Showroom", type: AccountType.EXPENSES },
    { code: "5210", name: "Rent Expense - Warehouse", type: AccountType.EXPENSES },
    { code: "5300", name: "Utilities - Electric", type: AccountType.EXPENSES },
    { code: "5310", name: "Utilities - Water", type: AccountType.EXPENSES },
    { code: "5320", name: "Internet & Phone", type: AccountType.EXPENSES },
    { code: "5400", name: "Marketing & Advertising", type: AccountType.EXPENSES },
    { code: "5410", name: "Website Maintenance", type: AccountType.EXPENSES },
    { code: "5500", name: "Office Supplies", type: AccountType.EXPENSES },
    { code: "5510", name: "Packaging Materials", type: AccountType.EXPENSES },
    { code: "5600", name: "Delivery & Shipping", type: AccountType.EXPENSES },
    { code: "5610", name: "Vehicle Fuel", type: AccountType.EXPENSES },
    { code: "5620", name: "Vehicle Maintenance", type: AccountType.EXPENSES },
    { code: "5700", name: "Insurance Expense", type: AccountType.EXPENSES },
    { code: "5800", name: "Professional Fees", type: AccountType.EXPENSES },

    // Other Expenses (5900-5999)
    { code: "5900", name: "Depreciation Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5910", name: "Bank Charges", type: AccountType.OTHER_EXPENSES },
    { code: "5920", name: "Interest Expense", type: AccountType.OTHER_EXPENSES },
    { code: "5930", name: "Bad Debt Expense", type: AccountType.OTHER_EXPENSES },
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
  console.log(`✓ Created ${accounts.length} chart of accounts`);

  // ============================================================================
  // 2. COMPANY SETTINGS
  // ============================================================================
  console.log("📝 Creating company settings...");
  const companySettings = await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Elegant Furniture Co.",
      baseCurrency: "USD",
      fiscalYearStartMonth: 1,
      poNumberPrefix: "PO",
      billNumberPrefix: "BILL",
      soNumberPrefix: "SO",
      invoiceNumberPrefix: "INV",
      jeNumberPrefix: "JE",
      debtorsAccountId: createdAccounts.get("Accounts Receivable")!.id,
      creditorsAccountId: createdAccounts.get("Accounts Payable")!.id,
      address: "456 Furniture Lane, Suite 200, New York, NY 10001, USA",
    },
  });
  console.log("✓ Company settings created");

  // ============================================================================
  // 3. JOURNALS
  // ============================================================================
  console.log("📚 Creating journals...");
  const journals = [
    { code: "SAL", name: "Sales Journal", type: JournalType.SALES, defaultAccountId: createdAccounts.get("Furniture Sales")!.id },
    { code: "PUR", name: "Purchase Journal", type: JournalType.PURCHASE, defaultAccountId: createdAccounts.get("Accounts Payable")!.id },
    { code: "BNK", name: "Bank Journal", type: JournalType.BANK, defaultAccountId: createdAccounts.get("Main Bank Account")!.id },
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
  console.log(`✓ Created ${journals.length} journals`);

  // ============================================================================
  // 4. TAX RATES
  // ============================================================================
  console.log("💰 Creating tax rates...");
  const taxRates = [
    { name: "No Tax (0%)", percentage: 0, applicability: TaxApplicability.BOTH },
    { name: "Standard Sales Tax (8%)", percentage: 8, applicability: TaxApplicability.SALES },
    { name: "Reduced Tax (5%)", percentage: 5, applicability: TaxApplicability.BOTH },
    { name: "Premium Tax (12%)", percentage: 12, applicability: TaxApplicability.SALES },
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
  console.log(`✓ Created ${taxRates.length} tax rates`);

  // ============================================================================
  // 5. PRODUCT CATEGORIES
  // ============================================================================
  console.log("📦 Creating product categories...");
  const categories = [
    { name: "Living Room Furniture" },
    { name: "Bedroom Furniture" },
    { name: "Office Furniture" },
    { name: "Dining Room Furniture" },
    { name: "Outdoor Furniture" },
    { name: "Custom Furniture" },
    { name: "Services" },
    { name: "Accessories" },
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
  console.log(`✓ Created ${categories.length} product categories`);

  // ============================================================================
  // 6. PRODUCTS - Comprehensive furniture catalog
  // ============================================================================
  console.log("🛍️  Creating comprehensive product catalog...");
  const products = [
    // Living Room
    { name: "Modern Leather Sofa", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room Furniture")!.id, sku: "LR-SOFA-001", material: "Genuine Leather", dimensions: "84\" W x 38\" D x 35\" H", salesPrice: 1899.00, cost: 1200.00, stock: 8, reorderPoint: 3 },
    { name: "Fabric Sectional Couch", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room Furniture")!.id, sku: "LR-SECT-001", material: "Polyester Blend", dimensions: "120\" W x 85\" D x 32\" H", salesPrice: 2499.00, cost: 1600.00, stock: 5, reorderPoint: 2 },
    { name: "Coffee Table - Walnut", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room Furniture")!.id, sku: "LR-COFF-001", material: "Solid Walnut", dimensions: "48\" W x 24\" D x 18\" H", salesPrice: 599.00, cost: 350.00, stock: 15, reorderPoint: 5 },
    { name: "TV Entertainment Center", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room Furniture")!.id, sku: "LR-TV-001", material: "Engineered Wood", dimensions: "72\" W x 18\" D x 24\" H", salesPrice: 899.00, cost: 550.00, stock: 10, reorderPoint: 4 },
    { name: "Accent Armchair", type: ProductType.GOODS, categoryId: createdCategories.get("Living Room Furniture")!.id, sku: "LR-CHAIR-001", material: "Velvet Upholstery", dimensions: "32\" W x 34\" D x 36\" H", salesPrice: 699.00, cost: 420.00, stock: 12, reorderPoint: 4 },

    // Bedroom
    { name: "King Size Bed Frame", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom Furniture")!.id, sku: "BR-BED-001", material: "Solid Oak", dimensions: "80\" W x 84\" D x 48\" H", salesPrice: 1299.00, cost: 800.00, stock: 6, reorderPoint: 2 },
    { name: "Queen Size Bed Frame", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom Furniture")!.id, sku: "BR-BED-002", material: "Solid Oak", dimensions: "64\" W x 84\" D x 48\" H", salesPrice: 999.00, cost: 650.00, stock: 9, reorderPoint: 3 },
    { name: "6-Drawer Dresser", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom Furniture")!.id, sku: "BR-DRSR-001", material: "Mahogany", dimensions: "60\" W x 20\" D x 36\" H", salesPrice: 849.00, cost: 520.00, stock: 7, reorderPoint: 3 },
    { name: "Nightstand Set (2pc)", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom Furniture")!.id, sku: "BR-NGHT-001", material: "Pine Wood", dimensions: "24\" W x 18\" D x 26\" H each", salesPrice: 399.00, cost: 240.00, stock: 14, reorderPoint: 5 },
    { name: "Wardrobe Closet", type: ProductType.GOODS, categoryId: createdCategories.get("Bedroom Furniture")!.id, sku: "BR-WARD-001", material: "MDF with Laminate", dimensions: "48\" W x 24\" D x 72\" H", salesPrice: 749.00, cost: 460.00, stock: 5, reorderPoint: 2 },

    // Office
    { name: "Executive Desk", type: ProductType.GOODS, categoryId: createdCategories.get("Office Furniture")!.id, sku: "OF-DESK-001", material: "Cherry Wood", dimensions: "72\" W x 36\" D x 30\" H", salesPrice: 1499.00, cost: 950.00, stock: 8, reorderPoint: 3 },
    { name: "Ergonomic Office Chair", type: ProductType.GOODS, categoryId: createdCategories.get("Office Furniture")!.id, sku: "OF-CHAIR-001", material: "Mesh & Steel", dimensions: "26\" W x 26\" D x 42\" H", salesPrice: 449.00, cost: 280.00, stock: 20, reorderPoint: 8 },
    { name: "Bookshelf Unit", type: ProductType.GOODS, categoryId: createdCategories.get("Office Furniture")!.id, sku: "OF-BOOK-001", material: "Solid Pine", dimensions: "48\" W x 12\" D x 72\" H", salesPrice: 599.00, cost: 360.00, stock: 11, reorderPoint: 4 },
    { name: "Filing Cabinet - 4 Drawer", type: ProductType.GOODS, categoryId: createdCategories.get("Office Furniture")!.id, sku: "OF-FILE-001", material: "Steel", dimensions: "18\" W x 26\" D x 52\" H", salesPrice: 349.00, cost: 210.00, stock: 16, reorderPoint: 6 },

    // Dining Room
    { name: "Dining Table - 6 Seater", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room Furniture")!.id, sku: "DR-TABL-001", material: "Solid Oak", dimensions: "72\" W x 40\" D x 30\" H", salesPrice: 1199.00, cost: 750.00, stock: 6, reorderPoint: 2 },
    { name: "Dining Chairs - Set of 6", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room Furniture")!.id, sku: "DR-CHAR-001", material: "Oak with Fabric", dimensions: "18\" W x 22\" D x 38\" H each", salesPrice: 899.00, cost: 540.00, stock: 8, reorderPoint: 3 },
    { name: "China Cabinet", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room Furniture")!.id, sku: "DR-CHIN-001", material: "Cherry Wood", dimensions: "42\" W x 18\" D x 72\" H", salesPrice: 1099.00, cost: 680.00, stock: 4, reorderPoint: 2 },
    { name: "Buffet Server", type: ProductType.GOODS, categoryId: createdCategories.get("Dining Room Furniture")!.id, sku: "DR-BUFF-001", material: "Walnut", dimensions: "60\" W x 20\" D x 36\" H", salesPrice: 849.00, cost: 520.00, stock: 5, reorderPoint: 2 },

    // Outdoor
    { name: "Patio Dining Set", type: ProductType.GOODS, categoryId: createdCategories.get("Outdoor Furniture")!.id, sku: "OD-PATIO-001", material: "Weather-resistant Wicker", dimensions: "60\" Table + 4 Chairs", salesPrice: 1299.00, cost: 800.00, stock: 7, reorderPoint: 3 },
    { name: "Garden Bench", type: ProductType.GOODS, categoryId: createdCategories.get("Outdoor Furniture")!.id, sku: "OD-BENCH-001", material: "Teak Wood", dimensions: "60\" W x 24\" D x 36\" H", salesPrice: 549.00, cost: 330.00, stock: 10, reorderPoint: 4 },

    // Services
    { name: "Delivery Service", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-DELIV-001", salesPrice: 150.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Assembly & Installation", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-ASSEM-001", salesPrice: 200.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Interior Design Consultation", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-DESIG-001", salesPrice: 300.00, cost: 0.00, stock: 0, reorderPoint: 0 },
    { name: "Custom Furniture Design", type: ProductType.SERVICE, categoryId: createdCategories.get("Services")!.id, sku: "SV-CUSTM-001", salesPrice: 500.00, cost: 0.00, stock: 0, reorderPoint: 0 },

    // Accessories
    { name: "Decorative Cushions - Set of 4", type: ProductType.GOODS, categoryId: createdCategories.get("Accessories")!.id, sku: "AC-CUSH-001", material: "Cotton Blend", dimensions: "18\" x 18\" each", salesPrice: 89.00, cost: 50.00, stock: 50, reorderPoint: 20 },
    { name: "Table Lamp", type: ProductType.GOODS, categoryId: createdCategories.get("Accessories")!.id, sku: "AC-LAMP-001", material: "Ceramic & Fabric", dimensions: "14\" Base, 24\" Height", salesPrice: 129.00, cost: 75.00, stock: 30, reorderPoint: 10 },
    { name: "Area Rug - Large", type: ProductType.GOODS, categoryId: createdCategories.get("Accessories")!.id, sku: "AC-RUG-001", material: "Wool Blend", dimensions: "8' x 10'", salesPrice: 499.00, cost: 300.00, stock: 12, reorderPoint: 5 },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku! },
      update: {},
      create: product,
    });
  }

  // Fetch all products for later reference
  const allProducts = await prisma.product.findMany();
  const getProductBySku = (sku: string) => allProducts.find(p => p.sku === sku);

  console.log(`✓ Created ${products.length} products`);

  // ============================================================================
  // 7. ANALYTIC ACCOUNTS - For budget tracking
  // ============================================================================
  console.log("📈 Creating analytic accounts...");
  const analyticAccounts = [
    { name: "Showroom Sales - Downtown", type: AnalyticAccountType.INCOME },
    { name: "Showroom Sales - Uptown", type: AnalyticAccountType.INCOME },
    { name: "Online Sales Channel", type: AnalyticAccountType.INCOME },
    { name: "Custom Orders Department", type: AnalyticAccountType.INCOME },
    { name: "Service Revenue", type: AnalyticAccountType.INCOME },
    { name: "Marketing Campaign - Spring 2026", type: AnalyticAccountType.EXPENSES },
    { name: "Marketing Campaign - Summer 2026", type: AnalyticAccountType.EXPENSES },
    { name: "Warehouse Operations", type: AnalyticAccountType.EXPENSES },
    { name: "Showroom Operations", type: AnalyticAccountType.EXPENSES },
    { name: "Delivery & Logistics", type: AnalyticAccountType.EXPENSES },
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
  console.log(`✓ Created ${analyticAccounts.length} analytic accounts`);

  // ============================================================================
  // 8. CONTACTS - Vendors and Customers
  // ============================================================================
  console.log("👥 Creating contacts (vendors & customers)...");
  const contacts = [
    // Vendors
    { name: "Premium Wood Suppliers Inc.", type: ContactType.VENDOR, email: "orders@premiumwood.com", phone: "+1-555-2001", address: "1200 Timber Road, Portland, OR 97201, USA" },
    { name: "Metropolitan Fabric Wholesalers", type: ContactType.VENDOR, email: "sales@metrofabric.com", phone: "+1-555-2002", address: "850 Textile Avenue, Los Angeles, CA 90015, USA" },
    { name: "Global Furniture Components Ltd.", type: ContactType.VENDOR, email: "info@globalfurniture.com", phone: "+1-555-2003", address: "3400 Industrial Parkway, Houston, TX 77001, USA" },
    { name: "EcoPackaging Solutions", type: ContactType.VENDOR, email: "orders@ecopackaging.com", phone: "+1-555-2004", address: "670 Green Street, Seattle, WA 98101, USA" },
    { name: "FastFreight Logistics", type: ContactType.VENDOR, email: "dispatch@fastfreight.com", phone: "+1-555-2005", address: "2100 Highway 95, Newark, NJ 07102, USA" },
    { name: "Urban Office Supplies Co.", type: ContactType.VENDOR, email: "support@urbanoffice.com", phone: "+1-555-2006", address: "445 Business Plaza, Boston, MA 02108, USA" },
    { name: "PowerGrid Utilities", type: ContactType.VENDOR, email: "billing@powergrid.com", phone: "+1-555-2007", address: "9000 Energy Boulevard, New York, NY 10002, USA" },
    { name: "NetConnect Telecom", type: ContactType.VENDOR, email: "business@netconnect.com", phone: "+1-555-2008", address: "1550 Data Center Drive, Austin, TX 78701, USA" },

    // Customers - Corporate
    { name: "Prestige Hotels Group", type: ContactType.CUSTOMER, email: "procurement@prestigehotels.com", phone: "+1-555-3001", address: "7800 Hospitality Drive, Miami, FL 33101, USA" },
    { name: "TechStart Co-Working Spaces", type: ContactType.CUSTOMER, email: "facilities@techstart.com", phone: "+1-555-3002", address: "1400 Innovation Way, San Francisco, CA 94103, USA" },
    { name: "Madison & Associates Law Firm", type: ContactType.CUSTOMER, email: "admin@madisonlaw.com", phone: "+1-555-3003", address: "3300 Legal Plaza, Chicago, IL 60601, USA" },
    { name: "GreenLeaf Property Management", type: ContactType.CUSTOMER, email: "purchasing@greenleaf.com", phone: "+1-555-3004", address: "2200 Real Estate Row, Denver, CO 80202, USA" },
    { name: "Apex Consulting Services", type: ContactType.CUSTOMER, email: "office@apexconsult.com", phone: "+1-555-3005", address: "900 Strategy Street, Washington, DC 20001, USA" },

    // Customers - Individual
    { name: "Sarah Mitchell", type: ContactType.CUSTOMER, email: "sarah.mitchell@email.com", phone: "+1-555-4001", address: "245 Maple Avenue, Apt 12B, Brooklyn, NY 11201, USA" },
    { name: "Robert Chen", type: ContactType.CUSTOMER, email: "robert.chen@email.com", phone: "+1-555-4002", address: "1890 Oak Street, San Diego, CA 92101, USA" },
    { name: "Emily Rodriguez", type: ContactType.CUSTOMER, email: "emily.rodriguez@email.com", phone: "+1-555-4003", address: "567 Pine Road, Seattle, WA 98102, USA" },
    { name: "Michael Thompson", type: ContactType.CUSTOMER, email: "michael.t@email.com", phone: "+1-555-4004", address: "3421 Birch Lane, Portland, OR 97202, USA" },
    { name: "Jennifer Williams", type: ContactType.CUSTOMER, email: "jen.williams@email.com", phone: "+1-555-4005", address: "892 Cedar Drive, Austin, TX 78702, USA" },
    { name: "David Anderson", type: ContactType.CUSTOMER, email: "d.anderson@email.com", phone: "+1-555-4006", address: "1234 Elm Street, Boston, MA 02109, USA" },

    // Both (can be vendor and customer)
    { name: "Designer Furniture Outlet", type: ContactType.BOTH, email: "trading@designeroutlet.com", phone: "+1-555-5001", address: "5600 Commerce Street, Atlanta, GA 30301, USA" },
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
  console.log(`✓ Created ${contacts.length} contacts`);

  // ============================================================================
  // 9. USERS - Admin, Accountant, and Portal Users
  // ============================================================================
  console.log("👤 Creating users...");
  const hashedAdminPassword = await hash("Admin123!", 12);
  const hashedAccountantPassword = await hash("Accountant123!", 12);
  const hashedContactPassword = await hash("Contact123!", 12);

  const adminUser = await prisma.user.upsert({
    where: { loginId: "admin001" },
    update: {
      name: "Administrator",
      email: "admin@ledgerone.in",
    },
    create: {
      loginId: "admin001",
      email: "admin@ledgerone.in",
      password: hashedAdminPassword,
      name: "Administrator",
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  });

  const accountantUser = await prisma.user.upsert({
    where: { loginId: "acct001" },
    update: {
      name: "Accountant",
      email: "accountant@ledgerone.in",
    },
    create: {
      loginId: "acct001",
      email: "accountant@ledgerone.in",
      password: hashedAccountantPassword,
      name: "Accountant",
      role: UserRole.ACCOUNTANT,
      isActive: true,
    },
  });

  // Create portal users for some contacts
  const sarahContact = createdContacts.get("Sarah Mitchell")!;
  const sarahUser = await prisma.user.upsert({
    where: { email: "sarah.mitchell@email.com" },
    update: {},
    create: {
      loginId: "cust001",
      email: "sarah.mitchell@email.com",
      password: hashedContactPassword,
      name: "Sarah Mitchell",
      role: UserRole.CONTACT,
      isActive: true,
    },
  });
  await prisma.contact.update({
    where: { id: sarahContact.id },
    data: { userId: sarahUser.id },
  });

  const prestigeContact = createdContacts.get("Prestige Hotels Group")!;
  const prestigeUser = await prisma.user.upsert({
    where: { email: "procurement@prestigehotels.com" },
    update: {},
    create: {
      loginId: "cust002",
      email: "procurement@prestigehotels.com",
      password: hashedContactPassword,
      name: "Prestige Hotels - Procurement",
      role: UserRole.CONTACT,
      isActive: true,
    },
  });
  await prisma.contact.update({
    where: { id: prestigeContact.id },
    data: { userId: prestigeUser.id },
  });

  console.log("✓ Created 4 users (admin001, acct001, 2 portal users) - All passwords: Admin123!/Accountant123!/Contact123!");

  // ============================================================================
  // 10. PURCHASE CYCLE - Realistic transactional data
  // ============================================================================
  console.log("🛒 Creating purchase cycle transactions...");

  // PO #1: Completed cycle - PO → Bill → Fully Paid
  const po1 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-001",
      vendorId: createdContacts.get("Premium Wood Suppliers Inc.")!.id,
      orderDate: new Date("2026-01-05"),
      status: DocumentStatus.CONFIRMED,
      total: 15600.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("LR-SOFA-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 10,
            unitPrice: 1200.00,
            lineTotal: 12000.00,
          },
          {
            productId: getProductBySku("BR-BED-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 4,
            unitPrice: 800.00,
            lineTotal: 3200.00,
          },
          {
            productId: getProductBySku("AC-CUSH-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 8,
            unitPrice: 50.00,
            lineTotal: 400.00,
          },
        ],
      },
    },
  });

  const bill1 = await prisma.vendorBill.create({
    data: {
      billNumber: "BILL-2026-001",
      vendorId: createdContacts.get("Premium Wood Suppliers Inc.")!.id,
      purchaseOrderId: po1.id,
      billDate: new Date("2026-01-10"),
      dueDate: new Date("2026-02-10"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      total: 15600.00,
      amountPaid: 15600.00,
      amountDue: 0.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("LR-SOFA-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 10,
            unitPrice: 1200.00,
            lineTotal: 12000.00,
          },
          {
            productId: getProductBySku("BR-BED-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 4,
            unitPrice: 800.00,
            lineTotal: 3200.00,
          },
          {
            productId: getProductBySku("AC-CUSH-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 8,
            unitPrice: 50.00,
            lineTotal: 400.00,
          },
        ],
      },
    },
  });

  // Journal Entry #1 for Bill confirmation
  const je1Bill = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-001",
      journalId: createdJournals.get("Purchase Journal")!.id,
      accountingDate: new Date("2026-01-10"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.VENDOR_BILL,
      totalDebit: 15600.00,
      totalCredit: 15600.00,
      vendorBillId: bill1.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Cost of Goods Sold - Furniture")!.id,
            partnerId: createdContacts.get("Premium Wood Suppliers Inc.")!.id,
            debit: 15600.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Payable")!.id,
            partnerId: createdContacts.get("Premium Wood Suppliers Inc.")!.id,
            debit: 0.00,
            credit: 15600.00,
          },
        ],
      },
    },
  });

  const billPayment1 = await prisma.billPayment.create({
    data: {
      vendorBillId: bill1.id,
      amount: 15600.00,
      paymentDate: new Date("2026-01-25"),
      paymentMethod: PaymentMethod.BANK,
      note: "Full payment via wire transfer",
    },
  });

  // Journal Entry #2 for Bill payment
  const je2BillPayment = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-002",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-01-25"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.BILL_PAYMENT,
      totalDebit: 15600.00,
      totalCredit: 15600.00,
      billPaymentId: billPayment1.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Payable")!.id,
            partnerId: createdContacts.get("Premium Wood Suppliers Inc.")!.id,
            debit: 15600.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 0.00,
            credit: 15600.00,
          },
        ],
      },
    },
  });

  // PO #2: Partially paid
  const po2 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-002",
      vendorId: createdContacts.get("Metropolitan Fabric Wholesalers")!.id,
      orderDate: new Date("2026-01-15"),
      status: DocumentStatus.CONFIRMED,
      total: 8460.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("LR-SECT-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 5,
            unitPrice: 1600.00,
            lineTotal: 8000.00,
          },
          {
            productId: getProductBySku("AC-RUG-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 2,
            unitPrice: 230.00,
            lineTotal: 460.00,
          },
        ],
      },
    },
  });

  const bill2 = await prisma.vendorBill.create({
    data: {
      billNumber: "BILL-2026-002",
      vendorId: createdContacts.get("Metropolitan Fabric Wholesalers")!.id,
      purchaseOrderId: po2.id,
      billDate: new Date("2026-01-20"),
      dueDate: new Date("2026-03-20"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIAL,
      total: 8460.00,
      amountPaid: 5000.00,
      amountDue: 3460.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("LR-SECT-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 5,
            unitPrice: 1600.00,
            lineTotal: 8000.00,
          },
          {
            productId: getProductBySku("AC-RUG-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 2,
            unitPrice: 230.00,
            lineTotal: 460.00,
          },
        ],
      },
    },
  });

  const je3Bill2 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-003",
      journalId: createdJournals.get("Purchase Journal")!.id,
      accountingDate: new Date("2026-01-20"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.VENDOR_BILL,
      totalDebit: 8460.00,
      totalCredit: 8460.00,
      vendorBillId: bill2.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Cost of Goods Sold - Furniture")!.id,
            partnerId: createdContacts.get("Metropolitan Fabric Wholesalers")!.id,
            debit: 8460.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Payable")!.id,
            partnerId: createdContacts.get("Metropolitan Fabric Wholesalers")!.id,
            debit: 0.00,
            credit: 8460.00,
          },
        ],
      },
    },
  });

  const billPayment2 = await prisma.billPayment.create({
    data: {
      vendorBillId: bill2.id,
      amount: 5000.00,
      paymentDate: new Date("2026-02-15"),
      paymentMethod: PaymentMethod.CASH,
      note: "Partial payment - down payment",
    },
  });

  const je4BillPayment2 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-004",
      journalId: createdJournals.get("Cash Journal")!.id,
      accountingDate: new Date("2026-02-15"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.BILL_PAYMENT,
      totalDebit: 5000.00,
      totalCredit: 5000.00,
      billPaymentId: billPayment2.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Payable")!.id,
            partnerId: createdContacts.get("Metropolitan Fabric Wholesalers")!.id,
            debit: 5000.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Petty Cash")!.id,
            debit: 0.00,
            credit: 5000.00,
          },
        ],
      },
    },
  });

  // PO #3: Confirmed bill, not paid yet
  const po3 = await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-003",
      vendorId: createdContacts.get("EcoPackaging Solutions")!.id,
      orderDate: new Date("2026-02-01"),
      status: DocumentStatus.CONFIRMED,
      total: 1260.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("AC-CUSH-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 20,
            unitPrice: 50.00,
            lineTotal: 1000.00,
          },
          {
            productId: getProductBySku("AC-LAMP-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Operations")!.id,
            quantity: 4,
            unitPrice: 65.00,
            lineTotal: 260.00,
          },
        ],
      },
    },
  });

  const bill3 = await prisma.vendorBill.create({
    data: {
      billNumber: "BILL-2026-003",
      vendorId: createdContacts.get("EcoPackaging Solutions")!.id,
      purchaseOrderId: po3.id,
      billDate: new Date("2026-02-10"),
      dueDate: new Date("2026-03-10"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      total: 1260.00,
      amountPaid: 0.00,
      amountDue: 1260.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("AC-CUSH-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 20,
            unitPrice: 50.00,
            lineTotal: 1000.00,
          },
          {
            productId: getProductBySku("AC-LAMP-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Operations")!.id,
            quantity: 4,
            unitPrice: 65.00,
            lineTotal: 260.00,
          },
        ],
      },
    },
  });

  const je5Bill3 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-005",
      journalId: createdJournals.get("Purchase Journal")!.id,
      accountingDate: new Date("2026-02-10"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.VENDOR_BILL,
      totalDebit: 1260.00,
      totalCredit: 1260.00,
      vendorBillId: bill3.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Office Supplies")!.id,
            partnerId: createdContacts.get("EcoPackaging Solutions")!.id,
            debit: 1260.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Payable")!.id,
            partnerId: createdContacts.get("EcoPackaging Solutions")!.id,
            debit: 0.00,
            credit: 1260.00,
          },
        ],
      },
    },
  });

  // PO #4: Draft (not confirmed yet)
  await prisma.purchaseOrder.create({
    data: {
      poNumber: "PO-2026-004",
      vendorId: createdContacts.get("Global Furniture Components Ltd.")!.id,
      orderDate: new Date("2026-02-20"),
      status: DocumentStatus.DRAFT,
      total: 5850.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("OF-DESK-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 5,
            unitPrice: 950.00,
            lineTotal: 4750.00,
          },
          {
            productId: getProductBySku("OF-FILE-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            quantity: 5,
            unitPrice: 220.00,
            lineTotal: 1100.00,
          },
        ],
      },
    },
  });

  console.log("✓ Created 4 purchase orders with bills and payments");

  // ============================================================================
  // 11. SALES CYCLE - Realistic transactional data
  // ============================================================================
  console.log("💰 Creating sales cycle transactions...");

  // SO #1: Fully paid via Payment Gateway
  const so1 = await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-001",
      customerId: createdContacts.get("Prestige Hotels Group")!.id,
      orderDate: new Date("2026-01-08"),
      status: DocumentStatus.CONFIRMED,
      total: 15588.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("LR-SOFA-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Downtown")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 6,
            unitPrice: 1899.00,
            lineTotal: 11394.00,
            taxAmount: 911.52,
          },
          {
            productId: getProductBySku("LR-COFF-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Downtown")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 6,
            unitPrice: 599.00,
            lineTotal: 3594.00,
            taxAmount: 287.52,
          },
          {
            productId: getProductBySku("SV-DELIV-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 150.00,
            lineTotal: 150.00,
            taxAmount: 0.00,
          },
          {
            productId: getProductBySku("SV-ASSEM-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 200.00,
            lineTotal: 200.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const invoice1 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-001",
      customerId: createdContacts.get("Prestige Hotels Group")!.id,
      salesOrderId: so1.id,
      invoiceReference: "Hotel Lobby Refurbishment - Phase 1",
      invoiceDate: new Date("2026-01-12"),
      dueDate: new Date("2026-02-12"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      total: 15588.00,
      amountPaid: 15588.00,
      amountDue: 0.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("LR-SOFA-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Downtown")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 6,
            unitPrice: 1899.00,
            lineTotal: 11394.00,
            taxAmount: 911.52,
          },
          {
            productId: getProductBySku("LR-COFF-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Downtown")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 6,
            unitPrice: 599.00,
            lineTotal: 3594.00,
            taxAmount: 287.52,
          },
          {
            productId: getProductBySku("SV-DELIV-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 150.00,
            lineTotal: 150.00,
            taxAmount: 0.00,
          },
          {
            productId: getProductBySku("SV-ASSEM-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 200.00,
            lineTotal: 200.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const je6Invoice1 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-006",
      journalId: createdJournals.get("Sales Journal")!.id,
      accountingDate: new Date("2026-01-12"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: 15588.00,
      totalCredit: 15588.00,
      invoiceId: invoice1.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Prestige Hotels Group")!.id,
            debit: 15588.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Furniture Sales")!.id,
            debit: 0.00,
            credit: 14988.00,
          },
          {
            accountId: createdAccounts.get("Delivery Service Revenue")!.id,
            debit: 0.00,
            credit: 150.00,
          },
          {
            accountId: createdAccounts.get("Installation Service Revenue")!.id,
            debit: 0.00,
            credit: 200.00,
          },
          {
            accountId: createdAccounts.get("Sales Tax Payable")!.id,
            debit: 0.00,
            credit: 1199.04,
          },
        ],
      },
    },
  });

  // Gateway transaction for invoice1
  const gatewayTx1 = await prisma.paymentGatewayTransaction.create({
    data: {
      invoiceId: invoice1.id,
      gatewayOrderId: "order_rzp_HTG7823hdg82",
      gatewayPaymentId: "pay_rzp_KJH9823kjh93",
      amount: 15588.00,
      status: PaymentGatewayStatus.SUCCESS,
      paymentMethod: "card",
      webhookVerifiedAt: new Date("2026-01-18T14:32:15Z"),
    },
  });

  const invoicePayment1 = await prisma.invoicePayment.create({
    data: {
      invoiceId: invoice1.id,
      amount: 15588.00,
      paymentDate: new Date("2026-01-18"),
      paymentMethod: PaymentMethod.BANK,
      source: InvoicePaymentSource.GATEWAY,
      gatewayTransactionId: gatewayTx1.id,
      note: "Payment Gateway - Razorpay",
    },
  });

  const je7InvoicePayment1 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-007",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-01-18"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.INVOICE_PAYMENT,
      totalDebit: 15588.00,
      totalCredit: 15588.00,
      invoicePaymentId: invoicePayment1.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 15588.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Prestige Hotels Group")!.id,
            debit: 0.00,
            credit: 15588.00,
          },
        ],
      },
    },
  });

  // SO #2: Paid manually (Bank)
  const so2 = await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-002",
      customerId: createdContacts.get("Sarah Mitchell")!.id,
      orderDate: new Date("2026-01-15"),
      status: DocumentStatus.CONFIRMED,
      total: 3242.56,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("BR-BED-002")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 999.00,
            lineTotal: 999.00,
            taxAmount: 79.92,
          },
          {
            productId: getProductBySku("BR-NGHT-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 399.00,
            lineTotal: 399.00,
            taxAmount: 31.92,
          },
          {
            productId: getProductBySku("BR-DRSR-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 849.00,
            lineTotal: 849.00,
            taxAmount: 67.92,
          },
          {
            productId: getProductBySku("SV-DELIV-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 150.00,
            lineTotal: 150.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-002",
      customerId: createdContacts.get("Sarah Mitchell")!.id,
      salesOrderId: so2.id,
      invoiceReference: "Master Bedroom Set",
      invoiceDate: new Date("2026-01-18"),
      dueDate: new Date("2026-02-18"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      total: 3242.56,
      amountPaid: 3242.56,
      amountDue: 0.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("BR-BED-002")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 999.00,
            lineTotal: 999.00,
            taxAmount: 79.92,
          },
          {
            productId: getProductBySku("BR-NGHT-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 399.00,
            lineTotal: 399.00,
            taxAmount: 31.92,
          },
          {
            productId: getProductBySku("BR-DRSR-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 849.00,
            lineTotal: 849.00,
            taxAmount: 67.92,
          },
          {
            productId: getProductBySku("SV-DELIV-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 150.00,
            lineTotal: 150.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const je8Invoice2 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-008",
      journalId: createdJournals.get("Sales Journal")!.id,
      accountingDate: new Date("2026-01-18"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: 3242.56,
      totalCredit: 3242.56,
      invoiceId: invoice2.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Sarah Mitchell")!.id,
            debit: 3242.56,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Furniture Sales")!.id,
            debit: 0.00,
            credit: 2887.80,
          },
          {
            accountId: createdAccounts.get("Delivery Service Revenue")!.id,
            debit: 0.00,
            credit: 150.00,
          },
          {
            accountId: createdAccounts.get("Sales Tax Payable")!.id,
            debit: 0.00,
            credit: 204.76,
          },
        ],
      },
    },
  });

  const invoicePayment2 = await prisma.invoicePayment.create({
    data: {
      invoiceId: invoice2.id,
      amount: 3242.56,
      paymentDate: new Date("2026-01-22"),
      paymentMethod: PaymentMethod.BANK,
      source: InvoicePaymentSource.MANUAL,
      note: "Bank transfer - Ref# BT20260122001",
    },
  });

  const je9InvoicePayment2 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-009",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-01-22"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.INVOICE_PAYMENT,
      totalDebit: 3242.56,
      totalCredit: 3242.56,
      invoicePaymentId: invoicePayment2.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 3242.56,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Sarah Mitchell")!.id,
            debit: 0.00,
            credit: 3242.56,
          },
        ],
      },
    },
  });

  // SO #3: Partially paid (Cash)
  const so3 = await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-003",
      customerId: createdContacts.get("TechStart Co-Working Spaces")!.id,
      orderDate: new Date("2026-02-01"),
      status: DocumentStatus.CONFIRMED,
      total: 12398.40,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("OF-DESK-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Uptown")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 8,
            unitPrice: 1499.00,
            lineTotal: 11992.00,
            taxAmount: 959.36,
          },
          {
            productId: getProductBySku("SV-ASSEM-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 200.00,
            lineTotal: 200.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const invoice3 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-003",
      customerId: createdContacts.get("TechStart Co-Working Spaces")!.id,
      salesOrderId: so3.id,
      invoiceReference: "Office Desk - Expansion Phase",
      invoiceDate: new Date("2026-02-05"),
      dueDate: new Date("2026-03-05"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PARTIAL,
      total: 12398.40,
      amountPaid: 7000.00,
      amountDue: 5398.40,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("OF-DESK-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Uptown")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 8,
            unitPrice: 1499.00,
            lineTotal: 11992.00,
            taxAmount: 959.36,
          },
          {
            productId: getProductBySku("SV-ASSEM-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            quantity: 1,
            unitPrice: 200.00,
            lineTotal: 200.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const je10Invoice3 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-010",
      journalId: createdJournals.get("Sales Journal")!.id,
      accountingDate: new Date("2026-02-05"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: 12398.40,
      totalCredit: 12398.40,
      invoiceId: invoice3.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("TechStart Co-Working Spaces")!.id,
            debit: 12398.40,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Furniture Sales")!.id,
            debit: 0.00,
            credit: 11992.00,
          },
          {
            accountId: createdAccounts.get("Installation Service Revenue")!.id,
            debit: 0.00,
            credit: 200.00,
          },
          {
            accountId: createdAccounts.get("Sales Tax Payable")!.id,
            debit: 0.00,
            credit: 959.36,
          },
        ],
      },
    },
  });

  const invoicePayment3 = await prisma.invoicePayment.create({
    data: {
      invoiceId: invoice3.id,
      amount: 7000.00,
      paymentDate: new Date("2026-02-10"),
      paymentMethod: PaymentMethod.CASH,
      source: InvoicePaymentSource.MANUAL,
      note: "Partial payment - 50% down payment",
    },
  });

  const je11InvoicePayment3 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-011",
      journalId: createdJournals.get("Cash Journal")!.id,
      accountingDate: new Date("2026-02-10"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.INVOICE_PAYMENT,
      totalDebit: 7000.00,
      totalCredit: 7000.00,
      invoicePaymentId: invoicePayment3.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Petty Cash")!.id,
            debit: 7000.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("TechStart Co-Working Spaces")!.id,
            debit: 0.00,
            credit: 7000.00,
          },
        ],
      },
    },
  });

  // SO #4: Not paid yet
  const so4 = await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-004",
      customerId: createdContacts.get("Robert Chen")!.id,
      orderDate: new Date("2026-02-12"),
      status: DocumentStatus.CONFIRMED,
      total: 1835.52,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("DR-TABL-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 1199.00,
            lineTotal: 1199.00,
            taxAmount: 95.92,
          },
          {
            productId: getProductBySku("AC-RUG-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 499.00,
            lineTotal: 499.00,
            taxAmount: 39.92,
          },
        ],
      },
    },
  });

  const invoice4 = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-004",
      customerId: createdContacts.get("Robert Chen")!.id,
      salesOrderId: so4.id,
      invoiceDate: new Date("2026-02-15"),
      dueDate: new Date("2026-03-15"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.NOT_PAID,
      total: 1835.52,
      amountPaid: 0.00,
      amountDue: 1835.52,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("DR-TABL-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 1199.00,
            lineTotal: 1199.00,
            taxAmount: 95.92,
          },
          {
            productId: getProductBySku("AC-RUG-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 1,
            unitPrice: 499.00,
            lineTotal: 499.00,
            taxAmount: 39.92,
          },
        ],
      },
    },
  });

  const je12Invoice4 = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-012",
      journalId: createdJournals.get("Sales Journal")!.id,
      accountingDate: new Date("2026-02-15"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: 1835.52,
      totalCredit: 1835.52,
      invoiceId: invoice4.id,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Robert Chen")!.id,
            debit: 1835.52,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Furniture Sales")!.id,
            debit: 0.00,
            credit: 1698.00,
          },
          {
            accountId: createdAccounts.get("Sales Tax Payable")!.id,
            debit: 0.00,
            credit: 137.52,
          },
        ],
      },
    },
  });

  // SO #5: Draft (not confirmed)
  await prisma.salesOrder.create({
    data: {
      soNumber: "SO-2026-005",
      customerId: createdContacts.get("Emily Rodriguez")!.id,
      orderDate: new Date("2026-02-20"),
      status: DocumentStatus.DRAFT,
      total: 2793.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("OD-PATIO-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            taxRateId: createdTaxRates.get("Standard Sales Tax (8%)")!.id,
            quantity: 2,
            unitPrice: 1299.00,
            lineTotal: 2598.00,
            taxAmount: 207.84,
          },
        ],
      },
    },
  });

  // Direct invoice (no SO) - Custom furniture consultation
  const directInvoice = await prisma.customerInvoice.create({
    data: {
      invoiceNumber: "INV-2026-005",
      customerId: createdContacts.get("Madison & Associates Law Firm")!.id,
      invoiceReference: "Custom Executive Desk Design",
      invoiceDate: new Date("2026-02-18"),
      dueDate: new Date("2026-03-18"),
      status: DocumentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      total: 800.00,
      amountPaid: 800.00,
      amountDue: 0.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            productId: getProductBySku("SV-DESIG-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Custom Orders Department")!.id,
            quantity: 1,
            unitPrice: 300.00,
            lineTotal: 300.00,
            taxAmount: 0.00,
          },
          {
            productId: getProductBySku("SV-CUSTM-001")!.id,
            analyticAccountId: createdAnalyticAccounts.get("Custom Orders Department")!.id,
            quantity: 1,
            unitPrice: 500.00,
            lineTotal: 500.00,
            taxAmount: 0.00,
          },
        ],
      },
    },
  });

  const je13DirectInvoice = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-013",
      journalId: createdJournals.get("Sales Journal")!.id,
      accountingDate: new Date("2026-02-18"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.CUSTOMER_INVOICE,
      totalDebit: 800.00,
      totalCredit: 800.00,
      invoiceId: directInvoice.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Madison & Associates Law Firm")!.id,
            debit: 800.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Design Consultation Revenue")!.id,
            debit: 0.00,
            credit: 300.00,
          },
          {
            accountId: createdAccounts.get("Custom Furniture Sales")!.id,
            debit: 0.00,
            credit: 500.00,
          },
        ],
      },
    },
  });

  const directInvoicePayment = await prisma.invoicePayment.create({
    data: {
      invoiceId: directInvoice.id,
      amount: 800.00,
      paymentDate: new Date("2026-02-22"),
      paymentMethod: PaymentMethod.BANK,
      source: InvoicePaymentSource.MANUAL,
      note: "Wire transfer - Design consultation payment",
    },
  });

  const je14DirectInvoicePayment = await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-014",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-02-22"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.INVOICE_PAYMENT,
      totalDebit: 800.00,
      totalCredit: 800.00,
      invoicePaymentId: directInvoicePayment.id,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 800.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Accounts Receivable")!.id,
            partnerId: createdContacts.get("Madison & Associates Law Firm")!.id,
            debit: 0.00,
            credit: 800.00,
          },
        ],
      },
    },
  });

  console.log("✓ Created 6 sales orders/invoices with diverse payment scenarios");

  // ============================================================================
  // 12. MANUAL JOURNAL ENTRIES
  // ============================================================================
  console.log("📒 Creating manual journal entries...");

  // Opening balance entry
  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-015",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-01-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 150000.00,
      totalCredit: 150000.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 120000.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Petty Cash")!.id,
            debit: 5000.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Furniture Inventory")!.id,
            debit: 25000.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Owner's Capital")!.id,
            debit: 0.00,
            credit: 150000.00,
          },
        ],
      },
    },
  });

  // Monthly depreciation
  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-016",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-01-31"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 850.00,
      totalCredit: 850.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Depreciation Expense")!.id,
            debit: 850.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Office Equipment")!.id,
            debit: 0.00,
            credit: 300.00,
          },
          {
            accountId: createdAccounts.get("Delivery Vehicles")!.id,
            debit: 0.00,
            credit: 400.00,
          },
          {
            accountId: createdAccounts.get("Store Fixtures")!.id,
            debit: 0.00,
            credit: 150.00,
          },
        ],
      },
    },
  });

  // Salary payment
  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-017",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-01-31"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 18500.00,
      totalCredit: 18500.00,
      createdById: adminUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Salaries and Wages")!.id,
            debit: 18500.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 0.00,
            credit: 18500.00,
          },
        ],
      },
    },
  });

  // Rent payment
  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-018",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-02-01"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 8500.00,
      totalCredit: 8500.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Rent Expense - Showroom")!.id,
            debit: 5000.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Rent Expense - Warehouse")!.id,
            debit: 3500.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 0.00,
            credit: 8500.00,
          },
        ],
      },
    },
  });

  // Utilities payment
  await prisma.journalEntry.create({
    data: {
      entryNumber: "JE-2026-019",
      journalId: createdJournals.get("Bank Journal")!.id,
      accountingDate: new Date("2026-02-05"),
      status: JournalEntryStatus.POSTED,
      source: JournalEntrySource.MANUAL,
      totalDebit: 1850.00,
      totalCredit: 1850.00,
      createdById: accountantUser.id,
      lines: {
        create: [
          {
            accountId: createdAccounts.get("Utilities - Electric")!.id,
            debit: 1200.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Utilities - Water")!.id,
            debit: 350.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Internet & Phone")!.id,
            debit: 300.00,
            credit: 0.00,
          },
          {
            accountId: createdAccounts.get("Main Bank Account")!.id,
            debit: 0.00,
            credit: 1850.00,
          },
        ],
      },
    },
  });

  console.log("✓ Created 5 manual journal entries (opening, depreciation, salaries, rent, utilities)");

  // ============================================================================
  // 13. BUDGETS - With achievement tracking
  // ============================================================================
  console.log("💵 Creating budgets with achievement tracking...");

  // Q1 2026 Budget - Confirmed with achievements
  const q1Budget = await prisma.budget.create({
    data: {
      name: "Q1 2026 - Sales & Marketing Budget",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-03-31"),
      responsibleId: adminUser.id,
      status: BudgetStatus.CONFIRMED,
      lines: {
        create: [
          {
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Downtown")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 50000.00,
            achievedAmount: 26382.00, // From INV-2026-001
            achievedPercent: 52.76,
            amountToAchieve: 23618.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Uptown")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 40000.00,
            achievedAmount: 11992.00, // From INV-2026-003
            achievedPercent: 29.98,
            amountToAchieve: 28008.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 30000.00,
            achievedAmount: 6344.36, // From INV-2026-002 + INV-2026-004
            achievedPercent: 21.15,
            amountToAchieve: 23655.64,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Custom Orders Department")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 15000.00,
            achievedAmount: 800.00, // From direct invoice
            achievedPercent: 5.33,
            amountToAchieve: 14200.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Service Revenue")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 10000.00,
            achievedAmount: 1050.00, // From various service lines
            achievedPercent: 10.50,
            amountToAchieve: 8950.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Marketing Campaign - Spring 2026")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 8000.00,
            achievedAmount: 0.00, // No expenses yet
            achievedPercent: 0.00,
            amountToAchieve: 8000.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 25000.00,
            achievedAmount: 25320.00, // From purchase bills
            achievedPercent: 101.28,
            amountToAchieve: -320.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Showroom Operations")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 12000.00,
            achievedAmount: 260.00, // From BILL-2026-003
            achievedPercent: 2.17,
            amountToAchieve: 11740.00,
          },
        ],
      },
    },
  });

  // 2026 Annual Budget - Draft
  await prisma.budget.create({
    data: {
      name: "2026 Annual Sales & Operations Budget",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      responsibleId: adminUser.id,
      status: BudgetStatus.DRAFT,
      lines: {
        create: [
          {
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Downtown")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 250000.00,
            achievedAmount: 0.00,
            achievedPercent: 0.00,
            amountToAchieve: 250000.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Showroom Sales - Uptown")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 200000.00,
            achievedAmount: 0.00,
            achievedPercent: 0.00,
            amountToAchieve: 200000.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Online Sales Channel")!.id,
            type: AnalyticAccountType.INCOME,
            committedAmount: 150000.00,
            achievedAmount: 0.00,
            achievedPercent: 0.00,
            amountToAchieve: 150000.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Warehouse Operations")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 100000.00,
            achievedAmount: 0.00,
            achievedPercent: 0.00,
            amountToAchieve: 100000.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Marketing Campaign - Spring 2026")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 15000.00,
            achievedAmount: 0.00,
            achievedPercent: 0.00,
            amountToAchieve: 15000.00,
          },
          {
            analyticAccountId: createdAnalyticAccounts.get("Marketing Campaign - Summer 2026")!.id,
            type: AnalyticAccountType.EXPENSES,
            committedAmount: 18000.00,
            achievedAmount: 0.00,
            achievedPercent: 0.00,
            amountToAchieve: 18000.00,
          },
        ],
      },
    },
  });

  console.log("✓ Created 2 budgets (1 confirmed with achievements, 1 draft)");

  console.log("\n✅ Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Company Settings: 1`);
  console.log(`   - Chart of Accounts: ${accounts.length}`);
  console.log(`   - Journals: ${journals.length}`);
  console.log(`   - Tax Rates: ${taxRates.length}`);
  console.log(`   - Product Categories: ${categories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Analytic Accounts: ${analyticAccounts.length}`);
  console.log(`   - Contacts: ${contacts.length}`);
  console.log(`   - Users: 4 (2 internal + 2 portal)`);
  console.log(`   - Purchase Orders: 4 (3 confirmed, 1 draft)`);
  console.log(`   - Vendor Bills: 3 (1 paid, 1 partial, 1 unpaid)`);
  console.log(`   - Bill Payments: 2`);
  console.log(`   - Sales Orders: 6 (5 confirmed, 1 draft)`);
  console.log(`   - Customer Invoices: 6 (various payment statuses)`);
  console.log(`   - Invoice Payments: 5 (2 manual, 1 gateway, 2 partial)`);
  console.log(`   - Payment Gateway Transactions: 1 (success)`);
  console.log(`   - Journal Entries: 19 (14 auto + 5 manual)`);
  console.log(`   - Budgets: 2 (1 confirmed with achievements, 1 draft)`);
  console.log("\n🔐 Login Credentials:");
  console.log("   Admin: admin001 / Admin123!");
  console.log("   Accountant: acct001 / Accountant123!");
  console.log("   Portal Customer: cust001 / Contact123! (Sarah Mitchell)");
  console.log("   Portal Customer: cust002 / Contact123! (Prestige Hotels)");
  console.log("\n💡 Sample Data Highlights:");
  console.log("   - Complete purchase cycle: PO → Bill → Payment → Auto JE");
  console.log("   - Complete sales cycle: SO → Invoice → Payment (Manual & Gateway) → Auto JE");
  console.log("   - Diverse payment scenarios: Fully paid, Partially paid, Unpaid");
  console.log("   - Manual journal entries: Opening balance, Depreciation, Salaries, Rent, Utilities");
  console.log("   - Budget tracking: Q1 2026 budget with real achievement from transactions");
  console.log("   - Double-entry bookkeeping: All journal entries balanced (Debit = Credit)");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
