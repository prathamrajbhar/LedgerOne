# LedgerOne - Accounting System

> A modern, production-grade accounting system for small businesses built with Next.js, Prisma, and PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-316192)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)

---

## 🎯 Overview

LedgerOne replaces fragmented spreadsheets and manual ledgers with a structured, auditable workflow for small businesses. It handles:

- 📊 **Master Data Management** - Contacts, Products, Chart of Accounts
- 🛒 **Purchase Cycle** - PO → Vendor Bill → Payment
- 💰 **Sales Cycle** - SO → Customer Invoice → Receipt
- 📖 **Double-Entry Accounting** - Auto-balanced Journal Entries
- 📈 **Budgeting** - Real-time budget tracking with achievement computation
- 📄 **Financial Reporting** - Balance Sheet, P&L, Budget Reports
- 🌐 **Customer/Vendor Portal** - Self-service invoice viewing and payment
- 🔒 **Payment Gateway Integration** - Razorpay for online payments
- 💬 **Help Assistant** - FAQ-based chatbot for product guidance

**Architecture:** Modular Monolith - Single Next.js application with clearly bounded domain modules.

---

## ✨ Features

### For Business Owners & Accountants

- ✅ Real-time financial visibility (Balance Sheet, P&L on demand)
- ✅ Automated journal entry generation from business transactions
- ✅ Budget vs. actual tracking with drill-down capabilities
- ✅ Enforced accounting correctness (balanced entries, computed statuses)
- ✅ Single source of truth for contacts, products, and accounts
- ✅ Role-based access control (Administrator, Accountant, Contact)

### For Customers & Vendors

- ✅ Self-service portal for viewing invoices and bills
- ✅ Online payment for invoices via Razorpay gateway
- ✅ Payment history tracking
- ✅ Mobile-responsive design

### Technical Excellence

- ✅ Type-safe with TypeScript throughout
- ✅ Transactional consistency with Prisma
- ✅ Comprehensive error handling
- ✅ Security-first design (role checks, data isolation, webhook verification)
- ✅ Production-ready logging and monitoring
- ✅ Test coverage for critical business rules

---

## 🛠 Tech Stack

### Core

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language:** [TypeScript 5.3](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL 15+](https://www.postgresql.org/)
- **ORM:** [Prisma 5.22](https://www.prisma.io/)
- **Authentication:** [Auth.js (NextAuth v5)](https://authjs.dev/)

### UI/UX

- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

### Integrations

- **Payment Gateway:** [Razorpay](https://razorpay.com/)
- **Email:** [Resend](https://resend.com/)
- **File Storage:** [AWS S3](https://aws.amazon.com/s3/)
- **PDF Generation:** [@react-pdf/renderer](https://react-pdf.org/)
- **Help Assistant:** [Anthropic Claude API](https://www.anthropic.com/)

### Development & Testing

- **Testing:** [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)
- **Linting:** [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Type Checking:** TypeScript Compiler

### Deployment

- **Hosting:** [Vercel](https://vercel.com/)
- **Database:** [Neon](https://neon.tech/) or [Supabase](https://supabase.com/)
- **Logging:** [Better Stack / Logtail](https://betterstack.com/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** >= 18.0.0
- **npm:** >= 9.0.0
- **PostgreSQL:** >= 15.0
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd LedgerOne
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - AWS S3 credentials
   - Resend API key
   - Razorpay keys (use test mode for development)
   - Anthropic API key

4. **Set up the database**

   ```bash
   # Push Prisma schema to database
   npm run db:push

   # (Optional) Seed with initial data
   npm run db:seed

   # Open Prisma Studio to view data
   npm run db:studio
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Time Setup

1. Navigate to `/sign-up` to create your first Accountant account
2. Use that account to log in
3. The system will have pre-configured:
   - Default Chart of Accounts
   - Default Journals (Sales, Purchase, Bank, Cash)
4. Start by creating:
   - Contacts (Customers/Vendors)
   - Products
   - Analytic Accounts for budget tracking

---

## 📁 Project Structure

```
LedgerOne/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Authentication routes
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── forgot-password/
│   ├── (workspace)/                  # Admin & Accountant workspace
│   │   ├── dashboard/
│   │   ├── contacts/
│   │   ├── products/
│   │   ├── purchase/
│   │   ├── sales/
│   │   ├── accounting/
│   │   ├── budgets/
│   │   └── reports/
│   ├── (portal)/                     # Customer/Vendor portal
│   │   ├── invoices/
│   │   ├── bills/
│   │   └── payments/
│   └── api/
│       └── webhooks/payment/         # Razorpay webhook handler
│
├── lib/
│   ├── services/                     # Business logic layer
│   │   ├── auth.service.ts
│   │   ├── contact.service.ts
│   │   ├── payment.service.ts
│   │   ├── journal-entry.service.ts
│   │   └── budget.service.ts
│   ├── validation/                   # Zod schemas
│   ├── auth/                         # Auth.js configuration
│   ├── email/                        # Email templates
│   ├── pdf/                          # PDF generation
│   ├── payments/                     # Payment gateway client
│   ├── chatbot/                      # Help Assistant
│   └── utils/                        # Helpers & utilities
│
├── components/
│   ├── ui/                           # shadcn/ui components
│   └── forms/                        # Form components
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration history
│   └── seed.ts                       # Seed data
│
├── docs/                             # Product documentation
│   ├── PRD.md                        # Product Requirements
│   ├── USECASE.md                    # Use Cases
│   ├── TECH_STACK.md                 # Technical Stack
│   ├── architecture.md               # Architecture Design
│   └── WORKFLOW.md                   # User Workflows
│
├── .claude/                          # Claude Code configuration
│   ├── agents/                       # Custom agents
│   └── skills/                       # Custom skills
│
├── CLAUDE.md                         # Project guidelines for Claude Code
└── README.md                         # This file
```

---

## 💻 Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema changes (dev)
npm run db:migrate       # Create and apply migration
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Seed database with initial data

# Testing
npm run test             # Run unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
npm run e2e              # Run E2E tests
npm run e2e:ui           # Run E2E tests with UI
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/sales-invoice-creation
   ```

2. **Make changes following the guidelines**
   - Read relevant docs in `/docs`
   - Follow service layer pattern
   - Write tests for business logic
   - Use TypeScript strictly (no `any`)

3. **Test your changes**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Commit following conventions**
   ```bash
   git add .
   git commit -m "feat(sales): add customer invoice creation from sales order

   - Create invoice from confirmed SO
   - Auto-fill customer and line items
   - Generate balanced journal entry on confirmation

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/sales-invoice-creation
   ```

### Code Standards

- **TypeScript:** Strict mode, no `any` types
- **Services:** All business logic in service layer, never in routes/components
- **Validation:** Zod schemas at every service entry point
- **Transactions:** Use Prisma transactions for multi-step operations
- **Errors:** Throw typed errors (ValidationError, UnauthorizedError, etc.)
- **Security:** Role check on every protected operation

See **CLAUDE.md** for comprehensive guidelines.

---

## 🧪 Testing

### Unit Tests

```bash
npm run test              # Run all unit tests
npm run test:ui           # Run with Vitest UI
npm run test:coverage     # Generate coverage report
```

**Minimum 80% coverage required for service layer.**

### Integration Tests

Integration tests use a test database:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/ledgerone_test" npm run test
```

### E2E Tests

```bash
npm run e2e               # Run Playwright tests
npm run e2e:ui            # Run with Playwright UI
```

Critical flows to test:
- Purchase flow: PO → Bill → Payment
- Sales flow: SO → Invoice → Receipt
- Portal payment via gateway
- Budget achievement computation

---

## 🚢 Deployment

### Environment Setup

1. **Production Database**
   - Set up PostgreSQL on Neon or Supabase
   - Run migrations: `npm run db:migrate`

2. **Environment Variables**
   - Configure all secrets in Vercel dashboard
   - Use production Razorpay keys
   - Set `NODE_ENV=production`

3. **Vercel Deployment**
   ```bash
   # Connect to Vercel
   vercel link

   # Deploy
   vercel --prod
   ```

### Migration Strategy

- **Development:** Use `npm run db:push` for quick iteration
- **Production:** Always use `npm run db:migrate` to create migration files
- Review migration files before applying to production
- Test migrations on staging first

---

## 📚 Documentation

Comprehensive product and technical documentation is in `/docs`:

- **[PRD.md](./docs/PRD.md)** - Product Requirements Document
- **[USECASE.md](./docs/USECASE.md)** - Use Case Specifications (38 use cases)
- **[TECH_STACK.md](./docs/TECH_STACK.md)** - Technology Stack Details
- **[architecture.md](./docs/architecture.md)** - Architecture & Design
- **[WORKFLOW.md](./docs/WORKFLOW.md)** - Screen-by-Screen Workflows
- **[CLAUDE.md](./CLAUDE.md)** - Development Guidelines & Team Collaboration

**Before implementing any feature, read the relevant documentation.**

---

## 🤝 Contributing

### For Team Members

1. Read **CLAUDE.md** for complete guidelines
2. Follow commit conventions strictly
3. Write tests for business logic
4. Create one branch per feature
5. Commit frequently (after each discrete feature)
6. Open PR to `main` branch

### Code Review Checklist

Before approving any PR:

- [ ] Feature works as specified in docs
- [ ] Business rules enforced correctly
- [ ] Proper error handling
- [ ] TypeScript types (no `any`)
- [ ] Tests written and passing
- [ ] Commit messages follow conventions
- [ ] No hardcoded secrets or mock data

---

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- Role-based access control enforced server-side
- Contact data isolated by session contactId
- Payment webhook signature verification
- Input validation with Zod
- SQL injection prevention via Prisma
- HTTPS enforced everywhere
- Security headers configured in next.config.js

Report security issues to: [security contact email]

---

## 📝 License

[Specify License]

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Prisma](https://www.prisma.io/) ORM
- [shadcn/ui](https://ui.shadcn.com/) components
- [Anthropic Claude](https://www.anthropic.com/) for AI assistance

---

## 📞 Support

- **Documentation:** `/docs` directory
- **Issues:** [GitHub Issues Link]
- **Team Chat:** [Slack/Discord Link]

---

**Built with ❤️ for small businesses**
