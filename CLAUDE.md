---
name: ledgerone
description: LedgerOne - A modular monolith accounting system for small businesses built with Next.js, Prisma, and PostgreSQL
version: 1.0.0
---

# LedgerOne - Accounting System

**Version:** 1.0.0  
**Architecture:** Modular Monolith  
**Stack:** Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL

---

## Project Overview

LedgerOne is a production-grade accounting system designed for small businesses (e.g., furniture retailers). It replaces fragmented spreadsheets with a structured, auditable workflow covering:

- **Master Data**: Contacts, Products, Chart of Accounts, Journals, Analytic Accounts, Tax Rates
- **Purchase Cycle**: Purchase Order → Vendor Bill → Payment (manual, internal)
- **Sales Cycle**: Sales Order → Customer Invoice → Receipt (manual or Payment Gateway)
- **Accounting**: Manual & auto Journal Entries with balance enforcement (Debit = Credit)
- **Budgeting**: Budget lifecycle with real-time achievement tracking
- **Reporting**: Balance Sheet, Profit & Loss, Budget Reports
- **Portal**: Customer/Vendor self-service for invoices and payments
- **Help Assistant**: FAQ-based chatbot for product usage guidance (isolated from financial data)

**Core Principle:** The accounting engine is fully deterministic — every number is produced by explicit, auditable calculation rules. The only AI component is the scoped Help Assistant chatbot, which never touches financial data.

---

## Architecture

### Modular Monolith

This is a **single Next.js application** deployed as one unit, internally organized into clearly bounded domain modules. At this scale (one company, three roles, moderate transaction volume), a monolith keeps deployment, debugging, and **transactional consistency** simple.

### Domain Modules

| Module | Responsibility | Core Entities |
|--------|----------------|---------------|
| **Auth** | Login, sign-up, password reset, session/role checks | User, Contact login |
| **Master Data** | Contacts, Products, Chart of Accounts, Journals, Analytic Accounts, Tax Rates | Contact, Product, Account, Journal, AnalyticAccount, TaxRate |
| **Purchase** | Purchase Order → Vendor Bill → Payment | PurchaseOrder, VendorBill, BillPayment |
| **Sales** | Sales Order → Customer Invoice → Receipt | SalesOrder, CustomerInvoice, InvoicePayment |
| **Payments** | Payment Gateway integration, webhook verification | PaymentGatewayTransaction |
| **Accounting** | Manual + auto Journal Entries, balance enforcement | JournalEntry, JournalEntryLine |
| **Budgeting** | Budget lifecycle, achievement computation | Budget, BudgetLine |
| **Reporting** | Balance Sheet, P&L, Budget Report | (read-only, derived) |
| **Portal** | Contact-scoped invoice/bill viewing and payment | (reuses Sales/Purchase) |
| **Support Assistant** | FAQ-based product-help chat | (session-only, no DB access) |
| **Settings** | Company profile, numbering, fiscal year | CompanySettings |

**Module Interaction Rule:** Modules interact only through service calls, never by reaching into another module's data directly.

### Layers

```
┌─────────────────────────────┐
│   Presentation Layer         │  Routes, Server/Client Components
│   (app/ directory)           │  → Calls services, never direct DB
├─────────────────────────────┤
│   Application/Service Layer  │  Business rules, validation, orchestration
│   (lib/services/)            │  → Calls Prisma
├─────────────────────────────┤
│   Data Access Layer          │  Prisma ORM
│   (lib/prisma/)              │  → PostgreSQL
└─────────────────────────────┘
```

**Rule:** Routes and components call services; services call Prisma. No layer is ever skipped.

---

## Codebase Structure

```
LedgerOne/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth routes (login, sign-up, forgot password)
│   ├── (workspace)/                  # Admin & Accountant workspace
│   ├── (portal)/                     # Contact Portal
│   └── api/
│       └── webhooks/
│           └── payment/              # Public Payment Gateway webhook route
├── lib/
│   ├── services/                     # Domain services (business logic)
│   │   ├── auth.service.ts
│   │   ├── contact.service.ts
│   │   ├── payment.service.ts
│   │   ├── journal-entry.service.ts
│   │   ├── budget.service.ts
│   │   └── ... (one per domain module)
│   ├── validation/                   # Zod schemas
│   ├── auth/                         # Auth.js config, session helpers
│   ├── email/                        # Resend client + templates
│   ├── pdf/                          # PDF generation (@react-pdf/renderer)
│   ├── payments/                     # Payment Gateway client
│   ├── chatbot/                      # Help Assistant (LLM API + FAQ)
│   └── utils/                        # Helpers, errors, types
├── components/
│   ├── ui/                           # shadcn/ui components
│   └── forms/                        # Shared form components
├── prisma/
│   ├── schema.prisma                 # Database schema (single source of truth)
│   ├── migrations/                   # Migration history
│   └── seed.ts                       # Seed data
├── docs/                             # Product documentation
│   ├── PRD.md
│   ├── USECASE.md
│   ├── TECH_STACK.md
│   ├── architecture.md
│   ├── WORKFLOW.md
│   └── SCREENS.md
├── .claude/                          # Claude Code configuration
│   ├── agents/                       # Custom agent definitions
│   ├── skills/                       # Custom skills
│   └── settings.json                 # Project-specific settings
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
└── CLAUDE.md                         # This file
```

---

## Development Workflow

### Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd LedgerOne
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Database Setup**
   ```bash
   npm run db:push          # Push schema to database
   npm run db:seed          # Seed initial data
   npm run db:studio        # Open Prisma Studio
   ```

4. **Development Server**
   ```bash
   npm run dev              # Start Next.js dev server (http://localhost:3000)
   ```

### Development Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema changes (dev)
npm run db:migrate       # Create and apply migration (prod)
npm run db:studio        # Open Prisma Studio GUI

# Testing
npm run test             # Run Vitest unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Run tests with coverage report
npm run e2e              # Run Playwright E2E tests
npm run e2e:ui           # Run E2E tests with UI
```

---

## Commit Conventions

### Commit Message Format

Every commit must follow this format:

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **test**: Adding or updating tests
- **chore**: Changes to build process, dependencies, or tooling
- **perf**: Performance improvements

### Scopes (Domain Modules)

- `auth` - Authentication and user management
- `contacts` - Contact master data
- `products` - Product master data
- `accounts` - Chart of Accounts
- `journals` - Journal configuration
- `analytics` - Analytic Accounts
- `purchase` - Purchase cycle (PO, Bills, Payments)
- `sales` - Sales cycle (SO, Invoices, Receipts)
- `payments` - Payment Gateway integration
- `accounting` - Journal Entries
- `budgeting` - Budget lifecycle
- `reporting` - Financial reports
- `portal` - Customer/Vendor Portal
- `chatbot` - Help Assistant
- `settings` - Company settings
- `ui` - UI components
- `config` - Configuration files
- `db` - Database schema/migrations

### Subject Guidelines

- Use imperative mood: "add feature" not "added feature"
- Don't capitalize first letter
- No period at the end
- Maximum 72 characters

### Examples

```bash
# Good commits
feat(sales): add customer invoice creation from sales order
fix(accounting): prevent posting of unbalanced journal entries
refactor(payments): extract gateway signature verification to helper
docs(readme): update database setup instructions
test(budget): add unit tests for achievement computation

# Bad commits (avoid these)
feat: stuff                              # Too vague
Added new feature                        # Wrong tense and capitalized
fix(sales): Fixed bug in invoice.       # Wrong tense and has period
feat(sales): Add a really super awesome invoice feature with multiple things and details  # Too long
```

### Commit Frequency

**IMPORTANT:** Each team member should commit after completing **each discrete feature or fix**:

- ✅ Complete one feature → commit immediately
- ✅ Fix one bug → commit immediately
- ✅ Refactor one module → commit immediately
- ❌ Don't wait until end of day to commit multiple changes
- ❌ Don't combine unrelated changes in one commit

### Branch Strategy & Multi-Track Workflow

The project uses 4 dedicated tracks for parallel feature development. See detailed rules in [GITHUB_RULES.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/GITHUB_RULES.md):

- `main` - Production-ready code (direct pushes forbidden)
- `backend1` / `backend1/<task-name>` - Backend Track 1 (Master Data, Purchase, Accounting)
- `backend2` / `backend2/<task-name>` - Backend Track 2 (Sales, Gateway, Budget, Chatbot)
- `frontend1` / `frontend1/<task-name>` - Frontend Track 1 (UI Foundation, Master Data, Purchase UI)
- `frontend2` / `frontend2/<task-name>` - Frontend Track 2 (Layout, Sales UI, Budgets, Portal)

Always branch per task using your track prefix and open a PR with proper checks passing.

---

## Code Standards

### TypeScript

- **Strict mode enabled** - No `any` types unless absolutely necessary
- Use proper type annotations for function parameters and return values
- Prefer interfaces over types for object shapes
- Use enums from Prisma schema, don't redefine them

### Service Layer (Business Logic)

- **All business rules live in services** - Never in routes or components
- Services must validate inputs using Zod schemas
- Services throw typed errors (ValidationError, UnauthorizedError, etc.)
- Use Prisma transactions for multi-step operations
- Services are stateless and export a singleton instance

**Example Service Pattern:**
```typescript
// lib/services/example.service.ts
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError } from "../utils/errors";

const prisma = new PrismaClient();

export interface CreateExampleInput {
  name: string;
  // ... other fields
}

export class ExampleService {
  async create(input: CreateExampleInput) {
    // Validate
    if (!input.name) {
      throw new ValidationError("Name is required");
    }

    // Business logic
    const example = await prisma.example.create({
      data: input,
    });

    return example;
  }
}

export const exampleService = new ExampleService();
```

### API Routes & Server Actions

- Use Next.js Server Actions for mutations
- Use Route Handlers only for webhooks and external integrations
- Always validate inputs with Zod before calling services
- Handle errors consistently and return appropriate HTTP status codes
- Never expose raw Prisma errors to the client

### Components

- Use Server Components by default
- Use Client Components only when needed (interactive elements, hooks)
- Keep components small and focused (single responsibility)
- Extract reusable UI to `components/ui/`
- Extract form components to `components/forms/`

### Styling

- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Use design tokens from `tailwind.config.ts`
- Mobile-first responsive design

---

## Testing Requirements

### Test Coverage

- **Minimum 80% coverage** for service layer (business logic)
- Unit tests for all business rules (balance validation, status computation, achievement calculation)
- Integration tests for Prisma queries and transactions
- E2E tests for critical user flows

### Critical Business Rules to Test

1. **Journal Entry Balance Validation** - Must reject unbalanced entries
2. **Payment Status Computation** - NOT_PAID → PARTIAL → PAID logic
3. **Budget Achievement Calculation** - Sum matching analytic account transactions
4. **Payment Gateway Webhook** - Signature verification, idempotency
5. **Auto Journal Entry Generation** - From Bills/Invoices/Payments

### Test File Organization

```
lib/services/__tests__/
  ├── auth.service.test.ts
  ├── payment.service.test.ts
  ├── journal-entry.service.test.ts
  └── ...

e2e/
  ├── purchase-flow.spec.ts
  ├── sales-flow.spec.ts
  ├── portal-payment.spec.ts
  └── ...
```

---

## Security Guidelines

### Authentication & Authorization

- **Role check on every service method** - Never trust role from client
- **Contact data isolation** - Every Contact-scoped query must filter by `contactId` from session
- Passwords hashed with bcrypt (12 rounds)
- Session cookies are HTTP-only and secure

### Secrets Management

- All secrets in environment variables, never committed
- Payment Gateway keys and webhook secrets are environment-level only
- Never store API keys in database or expose in UI

### Input Validation

- Zod validation at every service entry point
- Validate webhook signatures cryptographically
- Sanitize user inputs before display

### Payment Gateway Security

- Webhook signature verification before processing any payment
- Idempotency check on gateway transaction ID
- Never trust client-side payment confirmation alone

---

## Claude Code Skills & Agents

This project includes custom Claude Code skills and agents in `.claude/` directory. **All team members must follow these when using Claude Code:**

### Available Agents

Refer to `.claude/agents/README.md` for full documentation. Key agents:

- **auditor** - Scan for hardcoded values, mock data, placeholder logic
- **builder** - Implement real working code in place of placeholders
- **qa-reviewer** - Verify changes are fully real, handle errors properly
- **tester** - Write/update tests for new logic

### Available Skills

Refer to individual skill files in `.claude/skills/` for usage:

- **project-type-picker** - Identify project patterns
- **rbac-guard** - Role-based access control patterns
- **generic-crud** - CRUD operation scaffolding
- **qa-verify** - Quality assurance verification
- **design-standards** - UI design standards
- **reviewer-doc** - Code review guidelines

### Using Skills in Development

When using Claude Code to build features:

1. **Load relevant skills** before implementation
2. **Follow skill patterns** for consistency
3. **Use custom agents** for multi-step tasks
4. **Commit after each feature** following conventions above

Example workflow:
```bash
# In Claude Code terminal
/skill generic-crud            # Load CRUD patterns
/skill rbac-guard              # Load auth patterns

# Then ask Claude to implement feature
# Claude will follow loaded skill guidelines
```

---

## Database Migrations

### Development

```bash
npm run db:push              # Quick schema sync (no migration file)
```

### Production

```bash
npm run db:migrate           # Create migration file
# Review migration file in prisma/migrations/
git add prisma/migrations/
git commit -m "db: add customer invoice payment status field"
```

**Rules:**
- Always review generated migrations before committing
- Test migrations on staging before production
- Never modify Prisma schema directly in production

---

## Code Review Checklist

Before approving any PR, verify:

### Functionality
- [ ] Feature works as specified in PRD/USECASE docs
- [ ] All business rules enforced (see Key Business Rules in architecture.md)
- [ ] Error handling covers edge cases
- [ ] No hardcoded values or mock data

### Code Quality
- [ ] Follows service layer pattern
- [ ] Uses Prisma transactions for multi-step operations
- [ ] Proper TypeScript types (no `any`)
- [ ] Zod validation at service entry
- [ ] Throws appropriate typed errors

### Security
- [ ] Role check on protected operations
- [ ] Contact data properly isolated
- [ ] No secrets in code
- [ ] Input validation and sanitization

### Testing
- [ ] Unit tests for business logic
- [ ] Integration tests for database operations
- [ ] Test coverage meets minimum threshold

### Documentation
- [ ] Code comments for non-obvious logic
- [ ] Updated relevant docs if behavior changed
- [ ] Commit message follows conventions

---

## Team Collaboration Rules

### For Team Members

1. **Read the docs first** - Familiarize yourself with PRD, USECASE, architecture, and TECH_STACK docs
2. **One feature per branch** - Don't mix unrelated changes
3. **Commit frequently** - After each discrete feature/fix
4. **Follow commit conventions** - Use proper type, scope, and message format
5. **Write tests** - Especially for business logic
6. **Use Claude Code skills** - Load relevant skills before asking Claude for help
7. **Review before pushing** - Run `npm run lint`, `npm run type-check`, `npm run test`
8. **Ask for help** - If stuck, ask in team chat or open a draft PR for feedback

### For Code Reviewers

1. **Use the checklist** - Don't skip steps
2. **Test locally** - Pull branch and verify it works
3. **Check commit history** - Verify proper commit messages
4. **Be constructive** - Suggest improvements, don't just criticize
5. **Approve fast** - If checklist passes, don't block on minor style issues

---

## Key Business Rules (Reference)

These rules are **critical** and must never be violated:

1. **Journal Entry Balance** - Total Debit must equal Total Credit before posting
2. **Payment Amounts** - Cannot exceed Amount Due on Bill/Invoice
3. **Two Journal Entries per Payment** - Bill/Invoice confirmation creates Entry #1, payment recording creates Entry #2
4. **Gateway Webhook Verification** - Payment only confirmed after verified webhook, never from client redirect alone
5. **Contact Data Isolation** - Portal queries must filter by logged-in Contact's ID
6. **Budget Achievement** - Only computed after Budget is Confirmed, from matching analytic account transactions
7. **Vendor Bills Not Payable by Vendor** - Only Customers can pay through Portal; LedgerOne pays Vendors manually
8. **Account Type Selection** - Only leaf types selectable (Asset, Liability, Bank, Capital, Cash, Income, Expenses, Other Expenses), not group headings
9. **Archived Records Remain Referenced** - Archived Contacts/Products/Accounts still appear in historical transactions
10. **Help Assistant Isolation** - Chatbot never queries Prisma, never accesses financial data

**Violating these rules in production is a P0 issue.**

---

## Reference Documents

All original product documentation is in `/docs`:

- **PRD.md** - Product Requirements Document (functional requirements, success metrics)
- **USECASE.md** - Use Case Specification (38 use cases with flows)
- **TECH_STACK.md** - Technology Stack (dependencies, tools, environments)
- **architecture.md** - Architecture Document (layers, modules, data model)
- **WORKFLOW.md** - Workflow & Navigation Specification (screen-by-screen flows)
- **SCREENS.md** - Screen Specifications (UI wireframes reference)
- **[GITHUB_RULES.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/GITHUB_RULES.md)** - GitHub Rules & 4-Track Branching Guidelines (`backend1`, `backend2`, `frontend1`, `frontend2`)

**Before implementing any feature, read the relevant sections of these documents.**

---

## Support & Resources

- **Project Docs**: `/docs` directory
- **Claude Skills**: `.claude/skills/` directory
- **Custom Agents**: `.claude/agents/` directory
- **Issue Tracker**: [Link to GitHub Issues or project management tool]
- **Team Chat**: [Link to Slack/Discord channel]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-09-05 | Initial workspace setup with complete architecture, Prisma schema, and service layer foundation |

---

**Remember:** This is a deterministic accounting system. Every number on every report must be traceable to an explicit calculation rule. No AI-driven logic in the accounting engine — the Help Assistant is the only exception, and it's fully isolated from financial data.
