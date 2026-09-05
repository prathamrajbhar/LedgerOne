# Architecture — Urban Furniture Accounting System

**Version:** 1.0 · **Related:** `prd.md`, `TECH_STACK.md`, `Urban_Furniture_Accounting_System_Workflow.md`

---

## 1. Architecture Style

**Modular Monolith** — a single Next.js application, deployed as one unit, internally organized into clearly bounded domain modules.

This is intentional, not a shortcut: at this scale (one company, three roles, moderate transaction volume), a monolith keeps deployment, debugging, and — most importantly — **transactional consistency** simple. Confirming an invoice, for example, must update the invoice, create a journal entry, and update budget figures as a single atomic operation; that's trivial in one process/database and needlessly complex across services. Module boundaries inside the monolith keep the codebase clean and give a clear split point later if the business ever outgrows it.

---

## 2. High-Level Diagram

```
                ┌─────────────────────────────┐
                │        Browser Clients        │
                │  Admin/Accountant Workspace    │
                │        Contact Portal          │
                └───────────────┬────────────────┘
                                │ HTTPS
                                ▼
                ┌─────────────────────────────┐
                │           Next.js              │
                │  Presentation Layer (routes,   │
                │  Server/Client Components)     │
                ├─────────────────────────────┤
                │      Application/Service       │
                │   Layer (business rules per     │
                │          domain module)         │
                ├─────────────────────────────┤
                │        Data Access Layer        │
                │           (Prisma)              │
                └───────┬───────────────┬─────────┘
                        │               │
                        ▼               ▼
                ┌───────────────┐ ┌───────────────┐
                │  PostgreSQL    │ │  AWS S3        │
                │  (single DB)   │ │  (files/PDFs)  │
                └───────────────┘ └───────────────┘
                        │
                        ▼
                ┌───────────────┐
                │    Resend      │
                │ (email)        │
                └───────────────┘
```

---

## 3. Layers

| Layer | Responsibility | Never Does |
|---|---|---|
| **Presentation** (Next.js routes, Server/Client Components) | Renders UI, collects input, calls services | Does not contain business rules or direct DB queries |
| **Application/Service** | Owns all business logic — validation, calculations, orchestration, transactions | Does not render UI |
| **Data Access** (Prisma) | Reads/writes PostgreSQL | Does not contain business rules |
| **External Integrations** (S3, Resend, Auth.js) | File storage, email delivery, authentication | Not called directly from the Presentation layer — always through a service |

**Rule:** routes and components call services; services call Prisma. No layer is ever skipped.

---

## 4. Domain Modules

| Module | Responsibility | Core Entities |
|---|---|---|
| **Auth** | Login, sign-up, password reset, session/role checks, portal invitations | User (internal), Contact login |
| **Master Data** | Contacts, Products, Chart of Accounts, Journals, Analytic Accounts, Tax Rates | Contact, Product, Account, Journal, AnalyticAccount, TaxRate |
| **Purchase** | Purchase Order → Vendor Bill → Payment | PurchaseOrder, VendorBill, BillPayment |
| **Sales** | Sales Order → Customer Invoice → Receipt | SalesOrder, CustomerInvoice, InvoicePayment |
| **Accounting** | Manual + auto Journal Entries, balance enforcement | JournalEntry, JournalEntryLine |
| **Budgeting** | Budget lifecycle, achievement computation | Budget, BudgetLine |
| **Reporting** | Balance Sheet, P&L, Budget Report | (read-only, derived from Accounting + Budgeting) |
| **Portal** | Contact-scoped invoice/bill viewing and payment | Reuses Sales/Purchase entities, scoped by Contact |
| **Settings** | Company profile, numbering, fiscal year | CompanySettings |

Each module = one service (e.g., `SalesOrderService`, `BudgetService`) that owns its validation and transaction logic. Modules interact only through service calls, never by reaching into another module's data directly (e.g., Budgeting reads Sales/Purchase data through their services, not raw queries).

---

## 5. Request Flow Examples

### 5.1 Confirm a Customer Invoice
1. User clicks **Confirm** on the Invoice Form (Presentation).
2. `CustomerInvoiceService.confirm(invoiceId)` is called.
3. Service opens a single `prisma.$transaction`:
   - Validates the invoice is still Draft.
   - Computes line totals.
   - Creates a balanced `JournalEntry` (Debit: Debtor, Credit: Sales Income).
   - Updates invoice status to Confirmed.
4. Transaction commits — either all writes succeed or none do.
5. Updated invoice returned to the UI; Journal Entries list reflects the new entry immediately.

### 5.2 Contact Portal Payment
1. Contact User clicks **Pay Now** on Document Detail (Portal).
2. `PaymentService.recordPayment(invoiceId, amount)` runs, first re-verifying the invoice's `contactId` matches the logged-in session's contact — request is rejected otherwise.
3. Payment recorded, Invoice's Amount Due/Status recomputed in the same transaction.
4. `EmailService` (via Resend) sends a payment confirmation — called synchronously after the transaction commits.

### 5.3 Confirm a Budget
1. User clicks **Confirm** on the Budget Form.
2. `BudgetService.confirm(budgetId)` locks committed amounts and, for each budget line, calls `BudgetService.computeAchieved(analyticAccountId, period)`, which sums matching Sales Invoice / Vendor Bill lines via `SalesOrderService`/`PurchaseOrderService` read methods.
3. Achieved Amount, Achieved %, and Amount to Achieve are persisted and returned.

---

## 6. Data Architecture

- **One PostgreSQL database, one schema** — no sharding, no per-tenant database (single company in scope).
- All monetary columns use `Decimal`, never floating point.
- Full entity list and relationships: see `prd.md` §9. Core transactional spine:

```
Contact ──< PurchaseOrder ──< VendorBill ──< BillPayment
Contact ──< SalesOrder ──< CustomerInvoice ──< InvoicePayment
Account ──< JournalEntryLine >── JournalEntry ── Journal
AnalyticAccount ──< (Sales/Purchase lines, BudgetLine)
Budget ──< BudgetLine
```

- Foreign keys enforced at the database level (not just application-level checks).
- Indexes on all foreign keys plus `status`, `date`, and `contactId` (the last one is also a security boundary — see §7).

---

## 7. Security Architecture

| Concern | Approach |
|---|---|
| Authentication | Auth.js credentials provider; hashed passwords (bcrypt/argon2) |
| Authorization | Role check (Administrator / Accountant / Contact) enforced inside each service method — never assumed from the route alone |
| Contact data isolation | Every Portal-facing query includes `WHERE contactId = session.contactId`; this is treated as a security control, not just a filter |
| Input validation | Zod schemas at every service entry point — reject before any DB write |
| Transport | HTTPS only; secure, HTTP-only session cookies |
| Secrets | Environment variables per environment, never committed to source |

---

## 8. Deployment Architecture

- Single Next.js application on Vercel (serverless functions, auto-scaled per request — no manual capacity planning needed at this scale).
- Single managed PostgreSQL instance (Neon/Supabase) with connection pooling for serverless connections.
- Three environments: **Development** (local/preview), **Staging**, **Production** — same codebase, separate databases.
- No caching layer, message queue, or container orchestration — deliberately out of scope (see §10).

---

## 9. Cross-Cutting Concerns

| Concern | Approach |
|---|---|
| Validation | Zod, applied once at the service boundary, reused by both client and server forms |
| Error handling | Services throw typed errors (e.g., `ValidationError`, `UnbalancedEntryError`); a single error-handling wrapper in the Presentation layer converts these to user-facing messages |
| Money/rounding | All amounts `Decimal`, rounded to 2 places only at display/PDF time — never mid-calculation |
| Logging | Structured logs at the service layer (one line per business action: created/confirmed/paid), shipped per `TECH_STACK.md` |

---

## 10. What This Architecture Deliberately Avoids

To keep the system production-grade *without* over-engineering it for its actual scale:

- **No microservices** — one deployable app is sufficient and keeps transactions simple.
- **No message queue / event-driven architecture** — email and PDF generation run synchronously in the request; revisit only if this measurably slows down user actions.
- **No CQRS or event sourcing** — standard CRUD with an audit-safe status model (Draft/Confirmed/Cancelled) is enough for this domain.
- **No container orchestration (Kubernetes, etc.)** — serverless hosting (Vercel) covers the scaling need without operational overhead.
- **No multi-region/active-active setup** — a single-region managed database is appropriate for a single-company system.

These are documented as conscious decisions so they can be revisited explicitly if the business genuinely outgrows them — not defaults chosen by omission.

---

## 11. Proposed Project Structure

```
app/
  (auth)/            → login, sign-up, forgot/reset password
  (workspace)/        → Admin & Accountant screens (dashboard, masters, transactions, reports)
  (portal)/            → Contact portal screens
lib/
  services/            → one file per domain service (salesOrder, vendorBill, budget, ...)
  validation/          → Zod schemas, one per entity
  auth/                → Auth.js config, session helpers
  email/               → Resend client + templates
  pdf/                 → @react-pdf/renderer templates
prisma/
  schema.prisma        → single source of truth for the data model
```
