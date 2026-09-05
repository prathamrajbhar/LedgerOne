# Backend Developer Implementation Guide
## LedgerOne - Sequential Feature Development

**Your Role:** Implement all backend services, API routes, authentication, and integrations.

**Branch Strategy:** `backend/<feature-name>`

**Rules:**
- ✅ Complete ONE task at a time
- ✅ Commit immediately after each task
- ✅ Follow commit conventions from CLAUDE.md
- ✅ Write tests for each service
- ✅ Never move to next task until current is committed

---

## 📚 Required Reading (Do This First)

Before starting ANY task, read these documents:

1. `/docs/PRD.md` - Product Requirements
2. `/docs/USECASE.md` - All 38 use cases
3. `/docs/architecture.md` - Architecture patterns
4. `/CLAUDE.md` - Code standards and commit conventions
5. `/lib/services/` - Review existing service patterns

---

## Phase 1: Core Services Foundation (Tasks 1-10)

### Task 1: Product Service
**Branch:** `backend/product-service`

**What to Build:**
```typescript
// lib/services/product.service.ts
- create(input: CreateProductInput)
- update(input: UpdateProductInput)
- findById(id: string)
- list(params: ListProductsParams) - with search, category filter, archive filter
- archive(id: string)
- restore(id: string)
- canDelete(id: string) - check if used in transactions
```

**Acceptance Criteria:**
- Product creation with category (create category on-the-fly if needed)
- Email uniqueness validation
- Archive/restore functionality
- Search by name or category
- Returns proper error types

**Reference:** UC-06 in USECASE.md

**Test Requirements:**
- Unit tests for CRUD operations
- Test archive/restore
- Test canDelete with transactions

**Commit:**
```bash
git add lib/services/product.service.ts
git commit -m "feat(products): add product management service

- Create products with type (Goods/Service/Combo)
- Update product information with validation
- List products with search and category filters
- Archive and restore products
- Safe delete check prevents deletion with transaction history

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Chart of Accounts Service
**Branch:** `backend/chart-of-accounts-service`

**What to Build:**
```typescript
// lib/services/account.service.ts
- create(input: CreateAccountInput)
- update(input: UpdateAccountInput)
- findById(id: string)
- list(params: { type?: AccountType, isArchived?: boolean })
- archive(id: string)
- restore(id: string)
- seedDefaultAccounts() - create default CoA on first setup
- canDelete(id: string)
```

**Default Accounts to Seed:**
- Bank (BANK type)
- Cash (CASH type)
- Debtors (ASSET type)
- Creditors (LIABILITY type)
- Sales Income (INCOME type)
- Purchase Expense (EXPENSES type)
- Other Expense (OTHER_EXPENSES type)
- Capital (CAPITAL type)

**Acceptance Criteria:**
- Only leaf types selectable (not group headings)
- Archive accounts with transaction history
- Prevent hard delete if used in journal entries

**Reference:** UC-07 in USECASE.md

**Commit:**
```bash
git commit -m "feat(accounts): add chart of accounts service with default seeding

- Create accounts with proper type validation
- Seed default chart of accounts on setup
- Archive and restore accounts
- Prevent deletion of accounts with transaction history
- Support filtering by account type

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Journal Service
**Branch:** `backend/journal-service`

**What to Build:**
```typescript
// lib/services/journal.service.ts
- create(input: CreateJournalInput)
- update(input: UpdateJournalInput)
- findById(id: string)
- list(params: { type?: JournalType })
- seedDefaultJournals() - create Sales, Purchase, Bank, Cash journals
```

**Default Journals:**
- Sales (SALES type, default account: Sales Income)
- Purchase (PURCHASE type, default account: Purchase Expense)
- Bank (BANK type, default account: Bank)
- Cash (CASH type, default account: Cash)

**Reference:** UC-08 in USECASE.md

**Commit:**
```bash
git commit -m "feat(journals): add journal management service

- Create journals with type and default account
- Seed default journals (Sales, Purchase, Bank, Cash)
- Link journals to chart of accounts

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Analytic Account Service
**Branch:** `backend/analytic-account-service`

**What to Build:**
```typescript
// lib/services/analytic-account.service.ts
- create(input: CreateAnalyticAccountInput)
- update(input: UpdateAnalyticAccountInput)
- findById(id: string)
- list(params: { type?: AnalyticAccountType })
```

**Reference:** UC-09 in USECASE.md

**Commit:**
```bash
git commit -m "feat(analytics): add analytic account service

- Create analytic accounts with type (Income/Expenses)
- List with type filtering
- Used for budget tracking and transaction tagging

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Tax Rate Service
**Branch:** `backend/tax-rate-service`

**What to Build:**
```typescript
// lib/services/tax-rate.service.ts
- create(input: CreateTaxRateInput)
- update(input: UpdateTaxRateInput)
- findById(id: string)
- list(params: { applicability?: TaxApplicability })
- calculateTaxAmount(lineTotal: Decimal, taxRateId: string)
```

**Reference:** FR-8.1 in PRD.md

**Commit:**
```bash
git commit -m "feat(tax): add tax rate service

- Create tax rates with percentage and applicability
- Calculate tax amounts for sales order lines
- Filter by applicability (Sales/Purchase/Both)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Purchase Order Service
**Branch:** `backend/purchase-order-service`

**What to Build:**
```typescript
// lib/services/purchase-order.service.ts
- create(input: CreatePurchaseOrderInput)
- update(input: UpdatePurchaseOrderInput)
- confirm(poId: string, userId: string)
- cancel(poId: string)
- findById(id: string)
- list(params: ListPurchaseOrdersParams)
- checkBudgetWarning(lines: POLineInput[]) - returns warnings if exceeds budget
```

**Key Logic:**
- Auto-generate PO number (PO000001, PO000002, etc.)
- Calculate line total = quantity × unit price
- Check budget on confirmation (warning only, don't block)
- Status: DRAFT → CONFIRMED or CANCELLED

**Reference:** UC-13, UC-14 in USECASE.md

**Commit:**
```bash
git commit -m "feat(purchase): add purchase order service

- Create purchase orders with multiple line items
- Auto-generate PO numbers sequentially
- Confirm POs with budget validation (non-blocking warning)
- Calculate line totals and grand total
- Status lifecycle: Draft → Confirmed → Cancelled

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Vendor Bill Service
**Branch:** `backend/vendor-bill-service`

**What to Build:**
```typescript
// lib/services/vendor-bill.service.ts
- createFromPO(poId: string, input: CreateVendorBillInput)
- createManual(input: CreateVendorBillInput)
- confirm(billId: string, userId: string) - creates Journal Entry #1
- cancel(billId: string)
- findById(id: string)
- list(params: ListVendorBillsParams)
```

**Key Logic:**
- Auto-generate bill number
- On confirmation:
  - Create Journal Entry #1 (Debit: Purchase Expense, Credit: Creditors)
  - Call journalEntryService.autoGenerate()
  - Update bill status to CONFIRMED
  - Set amountDue = total

**Reference:** UC-15, UC-16 in USECASE.md

**Commit:**
```bash
git commit -m "feat(purchase): add vendor bill service with journal entry generation

- Create vendor bills from purchase orders
- Create manual vendor bills
- Auto-generate bill numbers
- Confirm bills with automatic journal entry (Expense Dr / Creditors Cr)
- Link to source purchase order

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Sales Order Service
**Branch:** `backend/sales-order-service`

**What to Build:**
```typescript
// lib/services/sales-order.service.ts
- create(input: CreateSalesOrderInput)
- update(input: UpdateSalesOrderInput)
- confirm(soId: string, userId: string)
- cancel(soId: string)
- findById(id: string)
- list(params: ListSalesOrdersParams)
```

**Key Logic:**
- Auto-generate SO number
- Calculate line total including tax
- Status: DRAFT → CONFIRMED or CANCELLED

**Reference:** UC-18, UC-19 in USECASE.md

**Commit:**
```bash
git commit -m "feat(sales): add sales order service

- Create sales orders with line items and tax
- Auto-generate SO numbers
- Calculate line totals with tax amounts
- Confirm and cancel sales orders

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: Customer Invoice Service
**Branch:** `backend/customer-invoice-service`

**What to Build:**
```typescript
// lib/services/customer-invoice.service.ts
- createFromSO(soId: string, input: CreateCustomerInvoiceInput)
- createManual(input: CreateCustomerInvoiceInput)
- confirm(invoiceId: string, userId: string) - creates Journal Entry #1
- cancel(invoiceId: string)
- findById(id: string)
- list(params: ListCustomerInvoicesParams)
- getForContact(contactId: string) - for portal
```

**Key Logic:**
- Auto-generate invoice number
- On confirmation:
  - Create Journal Entry #1 (Debit: Debtors, Credit: Sales Income)
  - Set amountDue = total

**Reference:** UC-20, UC-21 in USECASE.md

**Commit:**
```bash
git commit -m "feat(sales): add customer invoice service with journal entry generation

- Create invoices from sales orders
- Create manual invoices
- Auto-generate invoice numbers
- Confirm invoices with automatic journal entry (Debtors Dr / Sales Cr)
- Support contact portal queries

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Company Settings Service
**Branch:** `backend/company-settings-service`

**What to Build:**
```typescript
// lib/services/company-settings.service.ts
- initialize() - create default settings if not exist
- get() - get current settings
- update(input: UpdateCompanySettingsInput)
- getNextNumber(type: 'PO' | 'BILL' | 'SO' | 'INVOICE' | 'JE')
```

**Default Settings:**
- Company Name: "LedgerOne Business"
- Base Currency: "USD"
- Fiscal Year Start: 1 (January)
- All number prefixes

**Reference:** FR-14.1 in PRD.md

**Commit:**
```bash
git commit -m "feat(settings): add company settings service

- Initialize default company settings
- Update company profile and preferences
- Generate sequential document numbers
- Configure fiscal year and currency

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Integrations & External Services (Tasks 11-15)

### Task 11: Auth.js Configuration
**Branch:** `backend/auth-config`

**What to Build:**
```typescript
// lib/auth/config.ts
- Auth.js configuration with Prisma adapter
- Credentials provider using authService.login()
- Session callback with role
- JWT callback with user info

// lib/auth/session.ts
- getCurrentUser() - server-side helper
- requireAuth() - throw if not authenticated
- requireRole(role: UserRole) - throw if wrong role
```

**Commit:**
```bash
git commit -m "feat(auth): configure Auth.js with credentials provider

- Set up Prisma adapter for session storage
- Configure credentials provider with password hashing
- Add session and JWT callbacks with role
- Server-side session helpers
- Role-based authorization helpers

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 12: Email Service (Resend)
**Branch:** `backend/email-service`

**What to Build:**
```typescript
// lib/email/client.ts
- Resend client configuration

// lib/email/templates/
- portal-invitation.tsx
- password-reset.tsx
- payment-confirmation.tsx

// lib/email/service.ts
- sendPortalInvitation(to: string, loginId: string, resetLink: string)
- sendPasswordReset(to: string, resetLink: string)
- sendPaymentConfirmation(to: string, invoice: CustomerInvoice, payment: InvoicePayment)
```

**Commit:**
```bash
git commit -m "feat(email): add email service with Resend integration

- Configure Resend client
- Create email templates (portal invite, password reset, payment confirmation)
- Email sending service with proper error handling

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 13: PDF Generation Service
**Branch:** `backend/pdf-service`

**What to Build:**
```typescript
// lib/pdf/templates/
- invoice-pdf.tsx - Customer Invoice
- bill-pdf.tsx - Vendor Bill
- balance-sheet-pdf.tsx
- profit-loss-pdf.tsx

// lib/pdf/service.ts
- generateInvoicePDF(invoiceId: string)
- generateBillPDF(billId: string)
- generateBalanceSheetPDF(year: number)
- generateProfitLossPDF(year: number)
- uploadToS3(buffer: Buffer, filename: string)
```

**Commit:**
```bash
git commit -m "feat(pdf): add PDF generation service with @react-pdf/renderer

- Invoice and bill PDF templates
- Financial report PDF templates
- PDF generation and S3 upload
- Signed URL generation for downloads

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 14: Payment Gateway Client (Razorpay)
**Branch:** `backend/razorpay-client`

**What to Build:**
```typescript
// lib/payments/razorpay-client.ts
- createOrder(amount: Decimal, invoiceId: string)
- verifyWebhookSignature(body: string, signature: string)
- getPaymentDetails(paymentId: string)

// lib/payments/webhook-handler.ts
- handlePaymentSuccess(payload: RazorpayWebhookPayload)
- handlePaymentFailure(payload: RazorpayWebhookPayload)
```

**Reference:** UC-36, UC-37 in USECASE.md

**Commit:**
```bash
git commit -m "feat(payments): add Razorpay payment gateway client

- Order creation for invoice payments
- Webhook signature verification
- Payment confirmation handling
- Error handling for failed payments

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 15: Help Assistant Service (Anthropic Claude)
**Branch:** `backend/help-assistant`

**What to Build:**
```typescript
// lib/chatbot/knowledge-base.ts
- FAQ data structure with product usage questions

// lib/chatbot/service.ts
- askQuestion(question: string, role: UserRole)
- Never queries Prisma
- Returns FAQ answers only
- Redirects account-specific questions to relevant screens
```

**Reference:** UC-38, FR-17 in PRD.md

**Commit:**
```bash
git commit -m "feat(chatbot): add Help Assistant with Claude API integration

- FAQ knowledge base for product usage
- Chat service with role-based context
- Isolated from financial data (no Prisma access)
- Redirect account-specific queries to UI

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: Reports & Advanced Features (Tasks 16-20)

### Task 16: Reporting Service - Balance Sheet
**Branch:** `backend/balance-sheet-report`

**What to Build:**
```typescript
// lib/services/report.service.ts
- generateBalanceSheet(year: number)
  - Query posted journal entries for the year
  - Group by account type:
    - Assets: ASSET, BANK, CASH, plus Debtors
    - Liabilities: LIABILITY, plus Creditors
    - Capital: CAPITAL
  - Calculate totals
  - Return structured report data
```

**Reference:** UC-27, FR-13.2 in PRD.md

**Commit:**
```bash
git commit -m "feat(reporting): add balance sheet report generation

- Generate balance sheet for selected year
- Group accounts by type (Assets, Liabilities, Capital)
- Calculate totals from posted journal entries
- Return structured report data

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 17: Reporting Service - Profit & Loss
**Branch:** `backend/profit-loss-report`

**What to Build:**
```typescript
// Continue in lib/services/report.service.ts
- generateProfitAndLoss(year: number)
  - Query posted journal entries
  - Income: INCOME type accounts
  - Expenses: EXPENSES + OTHER_EXPENSES
  - Calculate Net Income = Income - Expenses
```

**Reference:** UC-28, FR-13.1 in PRD.md

**Commit:**
```bash
git commit -m "feat(reporting): add profit and loss report generation

- Generate P&L for selected year
- Calculate income from INCOME accounts
- Calculate expenses from EXPENSES and OTHER_EXPENSES accounts
- Compute net income

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 18: Database Seeding
**Branch:** `backend/database-seed`

**What to Build:**
```typescript
// prisma/seed.ts
- Seed admin user
- Seed default company settings
- Seed default chart of accounts
- Seed default journals
- Seed sample contacts (2 customers, 2 vendors)
- Seed sample products (5 products)
- Seed sample analytic accounts
```

**Commit:**
```bash
git commit -m "chore(db): add database seeding script

- Seed admin user account
- Seed default company settings
- Seed default chart of accounts
- Seed default journals
- Seed sample master data for testing

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 19: AWS S3 File Upload Service
**Branch:** `backend/s3-service`

**What to Build:**
```typescript
// lib/utils/s3-client.ts
- uploadFile(file: Buffer, key: string, contentType: string)
- getSignedUrl(key: string, expiresIn: number)
- deleteFile(key: string)

// Support uploads:
- Contact profile images
- Product images
- Generated PDFs
```

**Commit:**
```bash
git commit -m "feat(storage): add S3 file upload service

- File upload to S3 bucket
- Signed URL generation for secure access
- File deletion
- Support for images and PDFs

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 20: Server Actions & API Routes
**Branch:** `backend/server-actions`

**What to Build:**
```typescript
// app/actions/
- auth.actions.ts - login, signup, logout
- contact.actions.ts - CRUD operations
- product.actions.ts - CRUD operations
- purchase.actions.ts - PO, Bill operations
- sales.actions.ts - SO, Invoice operations
- payment.actions.ts - record payments
- budget.actions.ts - budget operations
- report.actions.ts - generate reports

// app/api/webhooks/payment/route.ts
- POST handler for Razorpay webhook
- Verify signature
- Call paymentService.confirmGatewayPayment()
```

**Pattern for all actions:**
```typescript
"use server";

export async function createContact(input: CreateContactInput) {
  try {
    const session = await getCurrentUser();
    if (!session) throw new UnauthorizedError("Not authenticated");
    
    const contact = await contactService.create(input);
    revalidatePath("/workspace/contacts");
    return { success: true, data: contact };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

**Commit:**
```bash
git commit -m "feat(api): add server actions and webhook route

- Server actions for all domain operations
- Proper error handling and revalidation
- Session verification on all protected actions
- Razorpay webhook route with signature verification

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: Testing (Tasks 21-25)

### Task 21: Service Unit Tests - Core Services
**Branch:** `backend/tests-core-services`

**What to Test:**
```typescript
// lib/services/__tests__/
- auth.service.test.ts
- contact.service.test.ts
- product.service.test.ts
- account.service.test.ts
- journal.service.test.ts
```

**Commit:**
```bash
git commit -m "test(services): add unit tests for core services

- Auth service tests (signup, login, validation)
- Contact service tests (CRUD, archive, validation)
- Product service tests
- Account service tests
- Journal service tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 22: Service Unit Tests - Transaction Services
**Branch:** `backend/tests-transaction-services`

**What to Test:**
```typescript
- purchase-order.service.test.ts
- vendor-bill.service.test.ts
- sales-order.service.test.ts
- customer-invoice.service.test.ts
```

**Commit:**
```bash
git commit -m "test(services): add unit tests for transaction services

- Purchase order tests
- Vendor bill tests with journal entry generation
- Sales order tests
- Customer invoice tests with journal entry generation

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 23: Service Unit Tests - Critical Business Rules
**Branch:** `backend/tests-business-rules`

**What to Test:**
```typescript
- journal-entry.service.test.ts
  - Test balance validation (Debit = Credit)
  - Test unbalanced entry rejection
- payment.service.test.ts
  - Test payment status computation
  - Test webhook idempotency
  - Test gateway signature verification
- budget.service.test.ts
  - Test achievement computation
  - Test budget revision
```

**Commit:**
```bash
git commit -m "test(services): add tests for critical business rules

- Journal entry balance enforcement tests
- Payment gateway idempotency tests
- Webhook signature verification tests
- Budget achievement computation tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 24: Integration Tests
**Branch:** `backend/integration-tests`

**What to Test:**
```typescript
// tests/integration/
- database-transactions.test.ts
  - Test Prisma transaction rollback
  - Test concurrent updates
- purchase-flow.test.ts
  - Full flow: PO → Bill → Payment
- sales-flow.test.ts
  - Full flow: SO → Invoice → Payment
```

**Commit:**
```bash
git commit -m "test(integration): add integration tests for full flows

- Database transaction tests
- Complete purchase cycle test
- Complete sales cycle test

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 25: E2E API Tests
**Branch:** `backend/e2e-tests`

**What to Test:**
```typescript
// e2e/api/
- auth-flow.spec.ts
- purchase-flow.spec.ts
- sales-flow.spec.ts
- payment-gateway.spec.ts (with mocked Razorpay)
```

**Commit:**
```bash
git commit -m "test(e2e): add end-to-end API tests

- Authentication flow tests
- Purchase cycle E2E tests
- Sales cycle E2E tests
- Payment gateway flow tests with mocked responses

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📝 Task Completion Checklist (For Each Task)

Before committing:

- [ ] Code follows service layer pattern
- [ ] Proper TypeScript types (no `any`)
- [ ] Zod validation at service entry
- [ ] Error handling with typed errors
- [ ] Uses Prisma transactions for multi-step operations
- [ ] Tests written (if required)
- [ ] Tested locally
- [ ] Commit message follows convention

---

## 🚀 Getting Started

1. **Set up your environment:**
   ```bash
   npm install
   cp .env.example .env
   # Configure database and other credentials
   npm run db:push
   ```

2. **Start with Task 1:**
   ```bash
   git checkout -b backend/product-service
   # Complete Task 1
   # Commit
   git push origin backend/product-service
   # Open PR, get reviewed, merge
   ```

3. **Move to Task 2:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b backend/chart-of-accounts-service
   # Continue...
   ```

---

## 📞 Need Help?

- Read `/docs/` for product specs
- Check existing services in `/lib/services/` for patterns
- Review CLAUDE.md for code standards
- Ask team for code review

---

**Total Tasks:** 25  
**Estimated Time:** 3-4 weeks (1-2 tasks per day)
