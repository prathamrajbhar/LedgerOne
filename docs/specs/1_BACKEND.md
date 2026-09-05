# Backend Developer #1 - Implementation Tasks

**Branch Prefix:** `backend1/`  
**Total Tasks:** 13  
**Estimated Time:** 2-3 weeks

---

## ⚠️ Critical Rules (See [GITHUB_RULES.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/GITHUB_RULES.md))

1. **One Task → One Commit → One PR** - Complete a task, test it, commit immediately, open PR, get it merged, THEN move to next task
2. **Never batch multiple tasks** - Each task is a separate commit with proper convention
3. **Branch per task** - `backend1/product-service`, `backend1/chart-of-accounts-service`, etc.
4. **Test before commit** - Run `npm run lint && npm run type-check && npm run test`
5. **Merge before next** - Task N+1 only starts after Task N is merged to main
6. **Follow GitHub Rules** - Adhere strictly to the branch workflows and conventions defined in [GITHUB_RULES.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/GITHUB_RULES.md)

---

## Phase 1: Master Data Services (Tasks 1-5)

### Task 1: Product Management Service

**File:** `lib/services/product.service.ts`

**What to Build:**
```typescript
import { PrismaClient, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateProductInput {
  name: string;
  category: string;
  salePrice: number;
  purchasePrice?: number;
  description?: string;
  unit: string;
  taxRateId?: string;
  incomeAccountId: string;
  expenseAccountId: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  category?: string;
  salePrice?: number;
  purchasePrice?: number;
  description?: string;
  unit?: string;
  taxRateId?: string | null;
  incomeAccountId?: string;
  expenseAccountId?: string;
}

export interface ListProductsParams {
  search?: string;
  category?: string;
  includeArchived?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {
  async create(input: CreateProductInput) {
    // Validate
    if (!input.name?.trim()) {
      throw new ValidationError("Product name is required");
    }
    if (input.salePrice < 0) {
      throw new ValidationError("Sale price cannot be negative");
    }
    if (input.purchasePrice && input.purchasePrice < 0) {
      throw new ValidationError("Purchase price cannot be negative");
    }

    // Check if accounts exist
    const [incomeAccount, expenseAccount] = await Promise.all([
      prisma.chartOfAccount.findUnique({ where: { id: input.incomeAccountId } }),
      prisma.chartOfAccount.findUnique({ where: { id: input.expenseAccountId } }),
    ]);

    if (!incomeAccount) {
      throw new ValidationError("Income account not found");
    }
    if (!expenseAccount) {
      throw new ValidationError("Expense account not found");
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name: input.name.trim(),
        category: input.category,
        salePrice: new Prisma.Decimal(input.salePrice),
        purchasePrice: input.purchasePrice ? new Prisma.Decimal(input.purchasePrice) : null,
        description: input.description?.trim(),
        unit: input.unit,
        taxRateId: input.taxRateId,
        incomeAccountId: input.incomeAccountId,
        expenseAccountId: input.expenseAccountId,
      },
      include: {
        incomeAccount: true,
        expenseAccount: true,
        taxRate: true,
      },
    });

    return product;
  }

  async update(input: UpdateProductInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    // Validate if provided
    if (input.salePrice !== undefined && input.salePrice < 0) {
      throw new ValidationError("Sale price cannot be negative");
    }
    if (input.purchasePrice !== undefined && input.purchasePrice < 0) {
      throw new ValidationError("Purchase price cannot be negative");
    }

    // Check accounts if being updated
    if (input.incomeAccountId || input.expenseAccountId) {
      const accountIds = [];
      if (input.incomeAccountId) accountIds.push(input.incomeAccountId);
      if (input.expenseAccountId) accountIds.push(input.expenseAccountId);

      const accounts = await prisma.chartOfAccount.findMany({
        where: { id: { in: accountIds } },
      });

      if (accounts.length !== accountIds.length) {
        throw new ValidationError("One or more accounts not found");
      }
    }

    const updated = await prisma.product.update({
      where: { id: input.id },
      data: {
        name: input.name?.trim(),
        category: input.category,
        salePrice: input.salePrice ? new Prisma.Decimal(input.salePrice) : undefined,
        purchasePrice: input.purchasePrice ? new Prisma.Decimal(input.purchasePrice) : undefined,
        description: input.description?.trim(),
        unit: input.unit,
        taxRateId: input.taxRateId,
        incomeAccountId: input.incomeAccountId,
        expenseAccountId: input.expenseAccountId,
      },
      include: {
        incomeAccount: true,
        expenseAccount: true,
        taxRate: true,
      },
    });

    return updated;
  }

  async findById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        incomeAccount: true,
        expenseAccount: true,
        taxRate: true,
      },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    return product;
  }

  async list(params: ListProductsParams) {
    const { search, category, includeArchived = false, page = 1, limit = 20 } = params;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(category && { category }),
      ...(!includeArchived && { archived: false }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          incomeAccount: true,
          expenseAccount: true,
          taxRate: true,
        },
        orderBy: { name: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async archive(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (product.archived) {
      throw new ConflictError("Product is already archived");
    }

    return prisma.product.update({
      where: { id },
      data: { archived: true },
    });
  }

  async restore(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundError("Product not found");
    }

    if (!product.archived) {
      throw new ConflictError("Product is not archived");
    }

    return prisma.product.update({
      where: { id },
      data: { archived: false },
    });
  }

  async canDelete(id: string): Promise<boolean> {
    // Check if product is used in any order lines
    const [poLines, soLines, billLines, invoiceLines] = await Promise.all([
      prisma.purchaseOrderLine.count({ where: { productId: id } }),
      prisma.salesOrderLine.count({ where: { productId: id } }),
      prisma.vendorBillLine.count({ where: { productId: id } }),
      prisma.customerInvoiceLine.count({ where: { productId: id } }),
    ]);

    return poLines === 0 && soLines === 0 && billLines === 0 && invoiceLines === 0;
  }
}

export const productService = new ProductService();
```

**Testing:**
```bash
npm run type-check
npm run lint
# TODO: Write unit tests in lib/services/__tests__/product.service.test.ts
```

**Commit:**
```bash
git checkout -b backend1/product-service
git add lib/services/product.service.ts
git commit -m "feat(products): add product management service

- Create, update, archive, restore products
- Validate prices and account references
- Check usage before deletion
- Paginated list with search and filters

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin backend1/product-service
```

**Create PR, get reviewed, merge to main, then move to Task 2**

---

### Task 2: Chart of Accounts Service

**File:** `lib/services/chart-of-accounts.service.ts`

**What to Build:**
```typescript
import { PrismaClient, AccountType, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ConflictError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateAccountInput {
  code: string;
  name: string;
  type: AccountType;
  parentId?: string;
  description?: string;
}

export interface UpdateAccountInput {
  id: string;
  code?: string;
  name?: string;
  description?: string;
}

export interface ListAccountsParams {
  search?: string;
  type?: AccountType;
  includeArchived?: boolean;
  parentId?: string | null;
}

const LEAF_ACCOUNT_TYPES: AccountType[] = [
  "ASSET",
  "LIABILITY",
  "BANK",
  "CAPITAL",
  "CASH",
  "INCOME",
  "EXPENSES",
  "OTHER_EXPENSES",
];

export class ChartOfAccountsService {
  async create(input: CreateAccountInput) {
    // Validate
    if (!input.code?.trim()) {
      throw new ValidationError("Account code is required");
    }
    if (!input.name?.trim()) {
      throw new ValidationError("Account name is required");
    }

    // Check if code already exists
    const existing = await prisma.chartOfAccount.findUnique({
      where: { code: input.code.trim() },
    });

    if (existing) {
      throw new ConflictError("Account code already exists");
    }

    // Validate parent if provided
    if (input.parentId) {
      const parent = await prisma.chartOfAccount.findUnique({
        where: { id: input.parentId },
      });

      if (!parent) {
        throw new ValidationError("Parent account not found");
      }

      // Leaf types cannot have children
      if (LEAF_ACCOUNT_TYPES.includes(parent.type)) {
        throw new ValidationError("Cannot create child account under a leaf account type");
      }
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        code: input.code.trim(),
        name: input.name.trim(),
        type: input.type,
        parentId: input.parentId,
        description: input.description?.trim(),
      },
      include: {
        parent: true,
      },
    });

    return account;
  }

  async update(input: UpdateAccountInput) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id: input.id },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    // Check code uniqueness if being updated
    if (input.code) {
      const existing = await prisma.chartOfAccount.findFirst({
        where: {
          code: input.code.trim(),
          NOT: { id: input.id },
        },
      });

      if (existing) {
        throw new ConflictError("Account code already exists");
      }
    }

    const updated = await prisma.chartOfAccount.update({
      where: { id: input.id },
      data: {
        code: input.code?.trim(),
        name: input.name?.trim(),
        description: input.description?.trim(),
      },
      include: {
        parent: true,
      },
    });

    return updated;
  }

  async findById(id: string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id },
      include: {
        parent: true,
        children: {
          where: { archived: false },
          orderBy: { code: "asc" },
        },
      },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    return account;
  }

  async list(params: ListAccountsParams) {
    const { search, type, includeArchived = false, parentId } = params;

    const where: Prisma.ChartOfAccountWhereInput = {
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(type && { type }),
      ...(!includeArchived && { archived: false }),
      ...(parentId !== undefined && { parentId }),
    };

    const accounts = await prisma.chartOfAccount.findMany({
      where,
      include: {
        parent: true,
        _count: {
          select: { children: true },
        },
      },
      orderBy: { code: "asc" },
    });

    return accounts;
  }

  async getTree() {
    // Get all non-archived accounts
    const accounts = await prisma.chartOfAccount.findMany({
      where: { archived: false },
      orderBy: { code: "asc" },
    });

    // Build hierarchical tree
    const accountMap = new Map(accounts.map((a) => [a.id, { ...a, children: [] as any[] }]));
    const roots: any[] = [];

    for (const account of accountMap.values()) {
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children.push(account);
        }
      } else {
        roots.push(account);
      }
    }

    return roots;
  }

  async getSelectableAccounts(type?: AccountType) {
    // Only leaf types are selectable for transactions
    const where: Prisma.ChartOfAccountWhereInput = {
      archived: false,
      type: type ? type : { in: LEAF_ACCOUNT_TYPES },
    };

    return prisma.chartOfAccount.findMany({
      where,
      orderBy: { code: "asc" },
    });
  }

  async archive(id: string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id },
      include: {
        children: { where: { archived: false } },
      },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (account.archived) {
      throw new ConflictError("Account is already archived");
    }

    if (account.children.length > 0) {
      throw new ConflictError("Cannot archive account with active children");
    }

    return prisma.chartOfAccount.update({
      where: { id },
      data: { archived: true },
    });
  }

  async restore(id: string) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id },
    });

    if (!account) {
      throw new NotFoundError("Account not found");
    }

    if (!account.archived) {
      throw new ConflictError("Account is not archived");
    }

    return prisma.chartOfAccount.update({
      where: { id },
      data: { archived: false },
    });
  }

  async canDelete(id: string): Promise<boolean> {
    // Check if account has children
    const children = await prisma.chartOfAccount.count({
      where: { parentId: id },
    });

    if (children > 0) {
      return false;
    }

    // Check if used in journal entry lines
    const journalLines = await prisma.journalEntryLine.count({
      where: { accountId: id },
    });

    return journalLines === 0;
  }
}

export const chartOfAccountsService = new ChartOfAccountsService();
```

**Commit:**
```bash
git checkout -b backend1/chart-of-accounts-service
git add lib/services/chart-of-accounts.service.ts
git commit -m "feat(accounts): add chart of accounts management service

- Create, update, archive, restore accounts
- Hierarchical tree structure with parent-child relationships
- Leaf type validation (only leaf types selectable in transactions)
- Check usage before deletion

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Journal Configuration Service

**File:** `lib/services/journal.service.ts`

**Implementation similar to contact.service.ts pattern with:**
- Create, update, list journals
- Validate journal codes are unique
- Archive/restore functionality
- Check if journal is used before deletion

**Commit Convention:**
```
feat(journals): add journal configuration management service
```

---

### Task 4: Analytic Account Service

**File:** `lib/services/analytic-account.service.ts`

**Implementation:**
- Create, update, list analytic accounts
- Type validation (INCOME vs EXPENSES)
- Archive/restore
- Check usage in budget lines and transactions

**Commit Convention:**
```
feat(analytics): add analytic account management service
```

---

### Task 5: Tax Rate Service

**File:** `lib/services/tax-rate.service.ts`

**Implementation:**
- Create, update, list tax rates
- Percentage validation (0-100)
- Archive/restore
- Check usage in products and transactions

**Commit Convention:**
```
feat(taxes): add tax rate management service
```

---

## Phase 2: Purchase Module (Tasks 6-7)

### Task 6: Purchase Order Service

**File:** `lib/services/purchase-order.service.ts`

**Implementation:**
- Create PO from input (vendor, lines, dates)
- Confirm PO (changes status to CONFIRMED)
- Update only in DRAFT status
- Cancel PO
- Calculate totals (subtotal, tax, total)
- List with filters (vendor, status, date range)

**Key Business Rules:**
- Only DRAFT orders can be edited
- Confirming locks the order
- Each line validates product and tax rate exist

**Commit Convention:**
```
feat(purchase): add purchase order management service
```

---

### Task 7: Vendor Bill Service

**File:** `lib/services/vendor-bill.service.ts`

**Implementation:**
- Create bill from PO (link via purchaseOrderId)
- Create standalone bill
- Confirm bill → generates Journal Entry #1 (bill confirmation entry)
- Update only in DRAFT status
- Cancel bill
- Calculate payment status (NOT_PAID, PARTIAL, PAID) from linked payments
- List with filters

**Key Business Rules:**
- Confirming creates journal entry with balanced Debit=Credit
- Payment status auto-computed from BillPayment records
- Journal entry links to bill via sourceDocType="VENDOR_BILL"

**Commit Convention:**
```
feat(purchase): add vendor bill management service with journal entry generation
```

---

## Phase 3: Settings & Configuration (Task 10)

### Task 10: Company Settings Service

**File:** `lib/services/company-settings.service.ts`

**Implementation:**
```typescript
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface UpdateCompanySettingsInput {
  companyName?: string;
  fiscalYearStart?: string; // MM-DD format
  currency?: string;
  purchaseOrderPrefix?: string;
  vendorBillPrefix?: string;
  salesOrderPrefix?: string;
  customerInvoicePrefix?: string;
  journalEntryPrefix?: string;
  budgetPrefix?: string;
}

export class CompanySettingsService {
  async get() {
    // Return first (and only) settings record
    let settings = await prisma.companySettings.findFirst();

    // Create default if doesn't exist
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyName: "My Company",
          fiscalYearStart: "01-01",
          currency: "USD",
          purchaseOrderPrefix: "PO",
          vendorBillPrefix: "BILL",
          salesOrderPrefix: "SO",
          customerInvoicePrefix: "INV",
          journalEntryPrefix: "JE",
          budgetPrefix: "BUDGET",
        },
      });
    }

    return settings;
  }

  async update(input: UpdateCompanySettingsInput) {
    // Validate fiscal year format if provided
    if (input.fiscalYearStart) {
      const regex = /^\d{2}-\d{2}$/;
      if (!regex.test(input.fiscalYearStart)) {
        throw new ValidationError("Fiscal year start must be in MM-DD format");
      }
    }

    const settings = await this.get();

    const updated = await prisma.companySettings.update({
      where: { id: settings.id },
      data: input,
    });

    return updated;
  }

  async getNextNumber(prefix: string, lastNumber: number): Promise<string> {
    const nextNumber = lastNumber + 1;
    return `${prefix}${String(nextNumber).padStart(5, "0")}`;
  }
}

export const companySettingsService = new CompanySettingsService();
```

**Commit Convention:**
```
feat(settings): add company settings management service
```

---

## Phase 4: Integrations (Tasks 11-12)

### Task 11: Auth.js Configuration

**File:** `lib/auth/auth.config.ts`

**Implementation:**
- Configure Auth.js (NextAuth v5)
- Credentials provider for email/password login
- Session callback to include user role
- JWT callback
- Authorize function using authService.login()

**File:** `lib/auth/session.ts`

**Helper functions:**
- `getSession()` - Get current session
- `requireAuth()` - Throw if not authenticated
- `requireRole(role)` - Throw if role mismatch

**Commit Convention:**
```
feat(auth): add Auth.js configuration with credentials provider
```

---

### Task 12: Email Service

**File:** `lib/email/client.ts`

**Implementation:**
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  async send(input: SendEmailInput) {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }

    return data;
  }

  async sendPortalInvitation(email: string, temporaryPassword: string) {
    const html = `
      <h2>Welcome to LedgerOne Portal</h2>
      <p>You have been invited to access the LedgerOne customer/vendor portal.</p>
      <p><strong>Login Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p>Please log in and change your password immediately.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/login">Login to Portal</a></p>
    `;

    return this.send({
      to: email,
      subject: "LedgerOne Portal Invitation",
      html,
    });
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.send({
      to: email,
      subject: "LedgerOne Password Reset",
      html,
    });
  }
}

export const emailService = new EmailService();
```

**Commit Convention:**
```
feat(email): add Resend email service with invitation templates
```

---

## Phase 5: Reporting (Task 16)

### Task 16: Balance Sheet Report Service

**File:** `lib/services/reports/balance-sheet.service.ts`

**Implementation:**
- Aggregate all Journal Entry Lines by account
- Group by account type (Assets, Liabilities, Capital)
- Calculate total Debit - Credit per account
- Return structured report with totals
- Filter by date (optional)

**Formula:**
```
Assets = Liabilities + Capital
```

**Commit Convention:**
```
feat(reporting): add balance sheet report service
```

---

## Phase 6: Database Seeding (Task 18)

### Task 18: Database Seed Script

**File:** `prisma/seed.ts`

**Implementation:**
- Create default company settings
- Create default chart of accounts (standard hierarchy)
- Create default journals (Sales, Purchase, Bank, Cash, General)
- Create sample contacts (2 customers, 2 vendors)
- Create sample products (5 products)
- Create sample analytic accounts (2 income, 2 expense)
- Create sample tax rates (0%, 5%, 18%)

**Usage:**
```bash
npm run db:seed
```

**Commit Convention:**
```
feat(db): add database seeding script with default master data
```

---

## Summary

**Your Workflow:**
1. Pull latest main
2. Create branch: `git checkout -b backend1/<task-name>`
3. Implement the task
4. Test: `npm run lint && npm run type-check`
5. Commit with proper convention
6. Push: `git push origin backend1/<task-name>`
7. Open PR
8. Wait for review & merge
9. Pull latest main
10. Repeat for next task

**Task Completion Order:**
1. Product Service
2. Chart of Accounts Service
3. Journal Service
4. Analytic Account Service
5. Tax Rate Service
6. Purchase Order Service
7. Vendor Bill Service
8. Company Settings Service
9. Auth.js Configuration
10. Email Service
11. Balance Sheet Report
12. Database Seeding

**Never skip ahead. One task at a time. Commit immediately after each.**

---

**Questions?** Check CLAUDE.md for detailed guidelines.
