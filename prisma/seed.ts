import { PrismaClient, UserRole, ContactType, ProductType, AccountType, JournalType, AnalyticAccountType, TaxApplicability } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create default company settings
  console.log("📝 Creating company settings...");
  const companySettings = await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "LedgerOne Demo Company",
      baseCurrency: "USD",
      fiscalYearStartMonth: 1,
      poNumberPrefix: "PO",
      billNumberPrefix: "BILL",
      soNumberPrefix: "SO",
      invoiceNumberPrefix: "INV",
      jeNumberPrefix: "JE",
      address: "123 Business Street, Suite 100, New York, NY 10001",
    },
  });
  console.log("✓ Company settings created");

  // 2. Create default chart of accounts
  console.log("📊 Creating chart of accounts...");
  const accounts = [
    // Assets
    { name: "Cash", type: AccountType.CASH },
    { name: "Bank Account", type: AccountType.BANK },
    { name: "Accounts Receivable", type: AccountType.ASSET },
    { name: "Inventory", type: AccountType.ASSET },
    { name: "Office Equipment", type: AccountType.ASSET },

    // Liabilities
    { name: "Accounts Payable", type: AccountType.LIABILITY },
    { name: "Short-term Loans", type: AccountType.LIABILITY },
    { name: "Taxes Payable", type: AccountType.LIABILITY },

    // Capital/Equity
    { name: "Owner's Equity", type: AccountType.CAPITAL },
    { name: "Retained Earnings", type: AccountType.CAPITAL },

    // Income
    { name: "Product Sales Revenue", type: AccountType.INCOME },
    { name: "Service Revenue", type: AccountType.INCOME },
    { name: "Other Income", type: AccountType.INCOME },

    // Expenses
    { name: "Cost of Goods Sold", type: AccountType.EXPENSES },
    { name: "Salaries Expense", type: AccountType.EXPENSES },
    { name: "Rent Expense", type: AccountType.EXPENSES },
    { name: "Utilities Expense", type: AccountType.EXPENSES },
    { name: "Marketing Expense", type: AccountType.EXPENSES },
    { name: "Office Supplies Expense", type: AccountType.EXPENSES },
    { name: "Depreciation Expense", type: AccountType.OTHER_EXPENSES },
    { name: "Interest Expense", type: AccountType.OTHER_EXPENSES },
  ];

  const createdAccounts = [];
  for (const account of accounts) {
    const created = await prisma.chartOfAccount.upsert({
      where: { name: account.name },
      update: {},
      create: account,
    });
    createdAccounts.push(created);
  }
  console.log(`✓ Created ${createdAccounts.length} accounts`);

  // 3. Create default journals
  console.log("📚 Creating journals...");
  const bankAccount = createdAccounts.find((a) => a.name === "Bank Account")!;
  const cashAccount = createdAccounts.find((a) => a.name === "Cash")!;
  const salesRevenueAccount = createdAccounts.find((a) => a.name === "Product Sales Revenue")!;
  const accountsPayableAccount = createdAccounts.find((a) => a.name === "Accounts Payable")!;

  const journals = [
    { name: "Sales Journal", type: JournalType.SALES, defaultAccountId: salesRevenueAccount.id },
    { name: "Purchase Journal", type: JournalType.PURCHASE, defaultAccountId: accountsPayableAccount.id },
    { name: "Bank Journal", type: JournalType.BANK, defaultAccountId: bankAccount.id },
    { name: "Cash Journal", type: JournalType.CASH, defaultAccountId: cashAccount.id },
  ];

  for (const journal of journals) {
    await prisma.journal.upsert({
      where: { name: journal.name },
      update: {},
      create: journal,
    });
  }
  console.log(`✓ Created ${journals.length} journals`);

  // 4. Create sample tax rates
  console.log("💰 Creating tax rates...");
  const taxRates = [
    { name: "No Tax (0%)", percentage: 0, applicability: TaxApplicability.BOTH },
    { name: "Standard VAT (5%)", percentage: 5, applicability: TaxApplicability.BOTH },
    { name: "High VAT (18%)", percentage: 18, applicability: TaxApplicability.BOTH },
    { name: "Sales Tax (10%)", percentage: 10, applicability: TaxApplicability.SALES },
  ];

  for (const taxRate of taxRates) {
    await prisma.taxRate.upsert({
      where: { name: taxRate.name },
      update: {},
      create: taxRate,
    });
  }
  console.log(`✓ Created ${taxRates.length} tax rates`);

  // 5. Create product categories
  console.log("📦 Creating product categories...");
  const categories = [
    { name: "Furniture" },
    { name: "Electronics" },
    { name: "Office Supplies" },
    { name: "Services" },
  ];

  const createdCategories = [];
  for (const category of categories) {
    const created = await prisma.productCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    createdCategories.push(created);
  }
  console.log(`✓ Created ${createdCategories.length} product categories`);

  // 6. Create sample products
  console.log("🛍️  Creating sample products...");
  const furnitureCategory = createdCategories.find((c) => c.name === "Furniture")!;
  const electronicsCategory = createdCategories.find((c) => c.name === "Electronics")!;
  const servicesCategory = createdCategories.find((c) => c.name === "Services")!;

  const products = [
    {
      name: "Office Desk",
      type: ProductType.GOODS,
      categoryId: furnitureCategory.id,
      salesPrice: 350.00,
      cost: 200.00,
    },
    {
      name: "Executive Chair",
      type: ProductType.GOODS,
      categoryId: furnitureCategory.id,
      salesPrice: 250.00,
      cost: 150.00,
    },
    {
      name: "Laptop Computer",
      type: ProductType.GOODS,
      categoryId: electronicsCategory.id,
      salesPrice: 1200.00,
      cost: 800.00,
    },
    {
      name: "Consulting Service",
      type: ProductType.SERVICE,
      categoryId: servicesCategory.id,
      salesPrice: 150.00,
      cost: 0.00,
    },
    {
      name: "Installation Service",
      type: ProductType.SERVICE,
      categoryId: servicesCategory.id,
      salesPrice: 100.00,
      cost: 0.00,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }
  console.log(`✓ Created ${products.length} products`);

  // 7. Create sample analytic accounts
  console.log("📈 Creating analytic accounts...");
  const analyticAccounts = [
    { name: "Sales - North Region", type: AnalyticAccountType.INCOME },
    { name: "Sales - South Region", type: AnalyticAccountType.INCOME },
    { name: "Marketing Campaign Q1", type: AnalyticAccountType.EXPENSES },
    { name: "Office Operations", type: AnalyticAccountType.EXPENSES },
  ];

  for (const analyticAccount of analyticAccounts) {
    await prisma.analyticAccount.upsert({
      where: { name: analyticAccount.name },
      update: {},
      create: analyticAccount,
    });
  }
  console.log(`✓ Created ${analyticAccounts.length} analytic accounts`);

  // 8. Create sample contacts
  console.log("👥 Creating sample contacts...");
  const contacts = [
    {
      name: "ABC Corporation",
      type: ContactType.CUSTOMER,
      email: "contact@abccorp.com",
      phone: "+1-555-0101",
      address: "456 Corporate Blvd, Suite 200, Los Angeles, CA 90001",
    },
    {
      name: "XYZ Enterprises",
      type: ContactType.CUSTOMER,
      email: "info@xyzenterprises.com",
      phone: "+1-555-0102",
      address: "789 Business Ave, Chicago, IL 60601",
    },
    {
      name: "Furniture Suppliers Inc",
      type: ContactType.VENDOR,
      email: "sales@furnituresuppliers.com",
      phone: "+1-555-0201",
      address: "321 Industrial Park, Houston, TX 77001",
    },
    {
      name: "Tech Distributors Ltd",
      type: ContactType.VENDOR,
      email: "orders@techdist.com",
      phone: "+1-555-0202",
      address: "654 Tech Way, San Francisco, CA 94101",
    },
  ];

  for (const contact of contacts) {
    await prisma.contact.upsert({
      where: { email: contact.email },
      update: {},
      create: contact,
    });
  }
  console.log(`✓ Created ${contacts.length} contacts`);

  // 9. Create default admin user
  console.log("👤 Creating default users...");
  const hashedPassword = await hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@ledgerone.com" },
    update: {},
    create: {
      loginId: "admin001",
      email: "admin@ledgerone.com",
      password: hashedPassword,
      name: "System Administrator",
      role: UserRole.ADMINISTRATOR,
      isActive: true,
    },
  });

  const accountantPassword = await hash("Accountant123!", 12);
  await prisma.user.upsert({
    where: { email: "accountant@ledgerone.com" },
    update: {},
    create: {
      loginId: "acct001",
      email: "accountant@ledgerone.com",
      password: accountantPassword,
      name: "John Accountant",
      role: UserRole.ACCOUNTANT,
      isActive: true,
    },
  });

  console.log("✓ Created default users (admin001 / Admin123! and acct001 / Accountant123!)");

  console.log("\n✅ Database seeding completed successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Company Settings: 1`);
  console.log(`   - Chart of Accounts: ${createdAccounts.length}`);
  console.log(`   - Journals: ${journals.length}`);
  console.log(`   - Tax Rates: ${taxRates.length}`);
  console.log(`   - Product Categories: ${createdCategories.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Analytic Accounts: ${analyticAccounts.length}`);
  console.log(`   - Contacts: ${contacts.length}`);
  console.log(`   - Users: 2`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
