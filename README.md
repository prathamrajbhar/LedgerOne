# LedgerOne — Production-Grade Accounting System

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

> **LedgerOne** is a production-grade, modular monolith accounting and business management ERP system tailored for enterprises, distributors, and furniture retailers. Built on strict double-entry bookkeeping principles, it provides real-time financial reporting, automated purchase and sales document lifecycles, payment gateway reconciliation, and a dedicated self-service customer/vendor portal.

---

## 📑 Table of Contents

1. [Key Highlights & Principles](#-key-highlights--principles)
2. [Application Screenshots (Live Application)](#-application-screenshots-live-application)
3. [System Architecture](#-system-architecture)
4. [Functional Modules](#-functional-modules)
5. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
6. [Tech Stack](#-tech-stack)
7. [Directory Structure](#-directory-structure)
8. [Getting Started & Installation](#-getting-started--installation)
9. [Environment Configuration](#-environment-configuration)
10. [Database Management & Seeding](#-database-management--seeding)
11. [Testing & Quality Assurance](#-testing--quality-assurance)
12. [Deployment Guidelines](#-deployment-guidelines)

---

## 🌟 Key Highlights & Principles

* **100% Deterministic Accounting Engine**: All ledger computations, tax calculations, balance sheet totals, and P&L aggregations are strictly computed through explicit double-entry mathematical rules (`Debits = Credits`). No generative AI touches the core financial ledger.
* **Isolated Help Assistant (AI)**: An intelligent contextual assistant (Google Gemini / Anthropic Claude) directly integrated into the Workspace and Portal to answer workflow and feature questions without access to sensitive database records.
* **Automated Double-Entry Accounting**: Real-time journal entry generation upon confirming Invoices, Vendor Bills, and Payments, with validation preventing unbalanced postings.
* **Complete Business Cycles**:
  * **Sales Cycle**: Sales Orders $\rightarrow$ Customer Invoices $\rightarrow$ Payment Receipts (Cash, Bank, or Razorpay Gateway).
  * **Purchase Cycle**: Purchase Orders $\rightarrow$ Vendor Bills $\rightarrow$ Payment Clearances.
* **Customer & Vendor Self-Service Portal**: Direct, role-scoped tenant portal for external parties to inspect invoice dues, verify payment history, download PDFs, and settle outstanding balances online.
* **Budgeting & Variance Tracking**: Set departmental or project expenditure limits mapped to Analytic Accounts with real-time variance calculation.
* **Document Engine**: Server-side PDF generation for invoices, statements, and reports using `@react-pdf/renderer` and transactional emails via Resend / AWS SES.

---

## 📸 Application Screenshots (Live Application)

*Actual screenshots captured from the live LedgerOne system instance in production configuration.*

### 1. Executive Analytics Dashboard
*Comprehensive KPI grid tracking gross revenue, operating expenses, net profit margins, outstanding receivables, payables, inventory status, and real-time revenue vs. expense curves.*

![LedgerOne Dashboard](docs/screenshots/real-dashboard.png)

---

### 2. Customer Invoices (Sales Cycle)
*Complete sales invoice register tracking document numbers, customer entities, issue dates, due dates, total amounts, paid portions, balances, and multi-tier payment statuses.*

![Customer Invoices](docs/screenshots/real-invoices.png)

---

### 3. Purchase Orders & Procurement
*Supplier procurement tracking with line-item ordering, tax breakdown, and draft-to-confirmed workflow controls.*

![Purchase Orders](docs/screenshots/real-purchases.png)

---

### 4. Payments & Banking Reconciliation
*Unified banking and cash register showing customer receipts, vendor disbursements, payment modes, and linked accounting vouchers.*

![Payments & Banking](docs/screenshots/real-payments.png)

---

### 5. Products & Inventory Catalog
*Catalog item management featuring SKU tracking, category breakdowns, unit cost, selling prices, and real-time inventory levels.*

![Products & Inventory](docs/screenshots/real-products.png)

---

### 6. Statutory Financial Statements (Profit & Loss / Balance Sheet)
*Automated period-based Profit & Loss (P&L) statements, Cost of Goods Sold (COGS), operating overheads, and printable Balance Sheets.*

![Financial Statements](docs/screenshots/real-financial-reports.png)

---

### 7. Authentication & Secure Portal Login
*Enterprise login interface with unified entry for administrators, accountants, and external customer/vendor portal users.*

![Login Screen](docs/screenshots/login-page.png)

---

## 🏗 System Architecture

LedgerOne is organized as a **Modular Monolith** using the Next.js 14 App Router, keeping operational deployment simple while strictly isolating domain layers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                              │
│   Next.js 14 App Router • Server Components • Client Form Hydration    │
│   - app/(auth): Authentication, Password Reset, Registration           │
│   - app/(workspace): Admin & Accountant Enterprise ERP Workspace       │
│   - app/portal: Customer & Vendor Self-Service Experience              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Server Actions & API Handlers
┌───────────────────────────────────▼────────────────────────────────────┐
│                        Domain Service Layer                            │
│   - AuthService          - PurchaseService       - ReportingService    │
│   - ContactService       - SalesService          - BudgetService       │
│   - JournalEntryService  - PaymentService        - ChatbotService      │
│   Validation & Safety: Zod Schema Enforcement • Transaction Bounds     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Prisma ORM
┌───────────────────────────────────▼────────────────────────────────────┐
│                         Persistence Layer                              │
│       PostgreSQL 16 Database with PgBouncer Connection Pooling         │
│   - Double-Entry Journals    - Trade Documents    - Master Catalog     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Functional Modules

| Module | Scope & Core Capabilities | Core Models |
| :--- | :--- | :--- |
| **Authentication & RBAC** | Credential validation, bcrypt password hashing, session revocation, role-based route guards. | `User`, `RefreshToken` |
| **Master Data** | Chart of Accounts (COA), Tax Rates, Journals, Analytic Accounts, Contacts, Products. | `Account`, `Journal`, `Contact`, `Product`, `TaxRate` |
| **Sales Cycle** | Sales Orders, Invoices, Delivery notes, Customer receipts, payment status computation. | `SalesOrder`, `CustomerInvoice`, `InvoicePayment` |
| **Purchase Cycle** | Purchase Orders, Vendor Bills, 3-way line item match, bill settlement entries. | `PurchaseOrder`, `VendorBill`, `BillPayment` |
| **Accounting Engine** | Journal Entries (`DRAFT` $\rightarrow$ `POSTED`), automated double-entry line generation, reconciliation. | `JournalEntry`, `JournalEntryLine` |
| **Budgeting** | Spending caps by Analytic Account and period, real-time variance calculation. | `Budget`, `BudgetLine` |
| **Financial Reports** | Balance Sheet, Profit & Loss (P&L), General Ledger, and Budget Consumption reports. | Derived on-demand |
| **Payment Gateway** | Razorpay order creation, hosted checkout widget, webhook signature verification. | `PaymentGatewayTransaction` |
| **Contact Portal** | Isolated tenant access for clients/vendors to review invoices, bills, and pay online. | Scoped to session `contactId` |
| **Help Assistant** | Floating conversational chatbot providing contextual assistance and FAQ lookup. | Powered by Gemini / Claude |

---

## 🔐 Role-Based Access Control (RBAC)

LedgerOne enforces strict, server-side RBAC across three distinct roles:

| Capability | Administrator | Accountant | Contact (Customer / Vendor) |
| :--- | :---: | :---: | :---: |
| **Internal User Management** | Full | ❌ No Access | ❌ No Access |
| **Company Settings & Fiscal Year** | Full | ❌ No Access | ❌ No Access |
| **Master Data (Create & Edit)** | Full | Full (Archive only, no hard delete) | ❌ No Access |
| **Sales & Purchase Orders** | Full | Full | ❌ No Access |
| **Post Journal Entries** | Full | Full | ❌ No Access |
| **Define & Revise Budgets** | Full | Full | ❌ No Access |
| **Generate & Print Financial Reports** | Full | Full | ❌ No Access |
| **Portal Self-Service Invoices** | ❌ Internal | ❌ Internal | View own invoices & Pay online (Customer) |
| **Portal Self-Service Bills** | ❌ Internal | ❌ Internal | View own vendor bills (Read-only) |
| **Help Assistant Chatbot** | Full | Full | Full |

---

## 🛠 Tech Stack

* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
* **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS variables & semantic tokens
* **Component Library**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
* **Form & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
* **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
* **Authentication**: [NextAuth.js v5 (Auth.js)](https://authjs.dev/) with credential provider & bcrypt hashing
* **Payment Gateway**: [Razorpay](https://razorpay.com/) (Orders API, Webhooks, Signature HMAC verification)
* **Document Generation**: [@react-pdf/renderer](https://react-pdf.org/) for programmatic invoice & statement PDFs
* **Transactional Email**: [Resend](https://resend.com/) & AWS SES
* **Testing**: [Vitest](https://vitest.dev/) for unit/integration testing, [Playwright](https://playwright.dev/) for E2E workflows
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Directory Structure

```text
LedgerOne/
├── app/                              # Next.js 14 App Router
│   ├── (auth)/                       # Login, registration, password reset
│   ├── (workspace)/                  # Back-office ERP (Admin & Accountant)
│   │   ├── accounts/                 # Chart of accounts
│   │   ├── bills/                    # Vendor bills
│   │   ├── budgets/                  # Budget planning & analytics
│   │   ├── contacts/                 # Customer & vendor directory
│   │   ├── dashboard/                # Main analytics dashboard
│   │   ├── financial-reports/        # Balance sheet, P&L, reports
│   │   ├── invoices/                 # Customer invoices
│   │   ├── journal-entries/          # Double-entry ledger entries
│   │   ├── payments/                 # Cash, bank & gateway payments
│   │   ├── products/                 # Product & pricing catalog
│   │   ├── purchases/                # Purchase orders
│   │   ├── sales/                    # Sales orders
│   │   ├── settings/                 # Company profile & config
│   │   └── users/                    # System user administration
│   ├── api/                          # Webhooks (Razorpay) & REST routes
│   └── portal/                       # External customer/vendor portal
├── components/                       # Reusable UI component library
│   ├── forms/                        # Shared form controls & line item tables
│   └── ui/                           # shadcn/ui base primitives
├── docs/                             # Engineering & product documentation
│   ├── PRD.md                        # Product requirements document
│   ├── WORKFLOW.md                   # Screen navigation & business rules
│   ├── TECH_STACK.md                 # Technical stack specification
│   ├── architecture.md               # System architectural blueprint
│   ├── SCREENS.md                    # UI & theme token specification
│   └── screenshots/                  # High-resolution screenshots of the live system
├── lib/                              # Core application logic
│   ├── auth/                         # Session options & RBAC middleware
│   ├── chatbot/                      # Help Assistant LLM integration
│   ├── email/                        # Transactional email templates
│   ├── pdf/                          # React-PDF document templates
│   ├── prisma/                       # Prisma client singleton
│   ├── services/                     # Domain business logic & transactions
│   ├── utils/                        # Currency, date, & math formatting
│   └── validation/                   # Shared Zod validation schemas
├── prisma/                           # Database schema & migrations
│   ├── migrations/                   # SQL migration history
│   └── schema.prisma                 # Declarative data model
├── public/                           # Static assets, logos, and screenshots
├── scripts/                          # Test orchestration & automation scripts
├── package.json                      # Dependencies & npm scripts
├── tailwind.config.ts                # Design tokens & color definitions
└── tsconfig.json                     # TypeScript strict configuration
```

---

## 🚀 Getting Started & Installation

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Package Manager**: `npm` (v9+) or `pnpm`
* **Database**: PostgreSQL 14+ (Local instance, Docker, Neon, or Supabase)

### 1. Clone the Repository
```bash
git clone https://github.com/prathamrajbhar/LedgerOne.git
cd LedgerOne
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and update credentials:
```bash
cp .env.example .env
```

---

## ⚙️ Environment Configuration

Ensure the following variables are configured in your `.env` file:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@localhost:5432/ledgerone?schema=public"

# Auth.js / NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-min-32-characters-long"

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret_key"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Transactional Email (Resend or SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="billing@yourcompany.com"
SMTP_PASS="your-app-password"
SMTP_FROM="LedgerOne <billing@yourcompany.com>"

# Object Storage (AWS S3) - Optional for avatars/attachments
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your_aws_access_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_S3_BUCKET_NAME="ledgerone-documents"

# Help Assistant AI (Google Gemini or Claude)
GEMINI_API_KEY="your_gemini_api_key"
```

---

## 🗄 Database Management & Seeding

```bash
# Generate Prisma Client
npm run db:generate

# Sync schema with local database
npm run db:push

# Run database migrations
npm run db:migrate

# Seed demo enterprise business data
npx tsx scripts/seed_production_runner.ts

# Open Prisma Studio GUI
npm run db:studio
```

### Default Login Accounts
After database setup, use the following credentials to access the workspace:

| Role | Login ID | Password | Access Path |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin001` | `AdminPassword123!` | `/dashboard` |
| **Accountant** | `acct001` | `AccountantPass123!` | `/dashboard` |
| **Portal Customer** | `cust001` | `Password@123` | `/portal` |

---

## 🧪 Testing & Quality Assurance

```bash
# Run Vitest unit & integration tests
npm run test

# Run tests with interactive Vitest UI
npm run test:ui

# Generate test coverage report
npm run test:coverage

# Run Playwright end-to-end tests
npm run e2e

# Run Playwright E2E tests in headed browser mode
npm run e2e:ui

# Verify TypeScript type check
npm run type-check

# Run ESLint check
npm run lint
```

---

## 🚢 Deployment Guidelines

* **Vercel Deployment**: Link repository, set environment variables in Project Settings, and build with standard Next.js preset (`npm run build`).
* **Connection Pooling**: Use PgBouncer or connection poolers (such as Neon or AWS RDS Proxy) for serverless environments.
* **Webhook Registration**: In your Razorpay Dashboard, set the Webhook URL to `https://yourdomain.com/api/webhooks/payment` and paste the matching `RAZORPAY_WEBHOOK_SECRET`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
