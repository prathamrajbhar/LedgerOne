# Tech Stack — LedgerOne Accounting System

**Version:** 1.1 · **Related:** `PRD.md`, `WORKFLOW.md`, `architecture.md`, `USECASE.md`, `SCREENS.md`

---

## 1. Stack Overview

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Forms & Validation | React Hook Form + Zod |
| Notifications | shadcn/ui Toast (Sonner) — success toasts, inline field errors, modal alerts |
| Database | PostgreSQL |
| ORM | Prisma |
| Connection Pooling | PgBouncer (via managed Postgres provider) |
| Auth | Auth.js (NextAuth), credentials provider, bcrypt/argon2 hashing |
| Payment Gateway | Razorpay (Orders API + Checkout + signed Webhooks) |
| File Storage | AWS S3 (signed URLs) |
| Transactional Email | Resend |
| PDF Generation | @react-pdf/renderer |
| Help Assistant (Chatbot) | Anthropic Claude API (or OpenAI), called directly from Node — FAQ-only, no financial data access |
| Logging | Structured JSON logs → Better Stack / Logtail |
| Hosting | Vercel (app) + Neon/Supabase (Postgres) |

---

## 2. Frontend

- Next.js App Router; Server Components for list/report views, Client Components only for interactive elements (modals, inline edits).
- Tailwind CSS + shadcn/ui for tables, dialogs, tabs, status badges.
- React Hook Form + Zod for all forms; Zod schemas shared with backend validation.
- Recharts for Budget Report pie chart.

## 3. Backend

- Next.js Server Actions / Route Handlers — no separate backend service.
- Business rules (debit=credit validation, Paid/Partial/Not Paid computation, budget achievement, auto-journal-entry generation) live in a shared server-side service layer only — never enforced client-side alone.
- Multi-step writes wrapped in `prisma.$transaction()`.
- Zod validation on every server action/route input.

## 4. Database & Data Layer

- PostgreSQL, all money fields as `Decimal` (never Float).
- Prisma schema mirrors the PRD data model; migrations reviewed in PR before production apply.
- Connection pooling required for serverless deploys (PgBouncer via provider).
- Indexes on all foreign keys and frequently filtered fields (status, date, partner).

## 5. Authentication & Security

| Concern | Implementation |
|---|---|
| Sessions | Auth.js, JWT or database sessions |
| Roles | Administrator, Accountant, Contact — checked server-side on every request, never trusted from client |
| Contact data isolation | Every Contact-scoped query filtered by `contactId` from session at the query level |
| Password policy | Uppercase + lowercase + special char, 8+ chars; hashed with bcrypt/argon2 |
| Rate limiting | Applied at the middleware layer on login, forgot-password, and portal payment endpoints |
| CSRF | Handled via Next.js Server Actions' built-in protections |
| Headers | CSP, HSTS, X-Frame-Options set in `next.config` |
| Secrets | Environment variables per environment, never committed |
| Transport | HTTPS enforced everywhere |

## 6. File, Document & PDF Storage

- AWS S3 for Contact/Product images and generated PDFs (Invoice, Bill, Balance Sheet, P&L).
- PDFs generated on-demand via `@react-pdf/renderer` at request time and either streamed to the browser (Print) or stored in S3.
- Private bucket, signed expiring URLs for all document access.

## 7. Payment Gateway

- **Provider:** Razorpay — Orders API to create a payment intent, hosted Checkout for the actual card/UPI/netbanking entry, Webhooks for confirmation.
- **Scope:** Contact Portal only, and only for Sales Invoices. Vendor Bills are paid manually by Admin/Accountant (Bank/Cash) — no payout API is used.
- **Flow:** create order → open Checkout → wait for the signed webhook → only then mark the Invoice Paid and record the payment. The client-side redirect after Checkout is treated as a hint, never as confirmation.
- **Webhook route:** a single public, unauthenticated-by-session route (`/api/webhooks/payment`) that verifies Razorpay's signature before calling `PaymentService`. Requests with an invalid/missing signature are rejected outright.
- **Idempotency:** each webhook is matched against its Razorpay `payment_id` before processing, so retried deliveries can't double-record a payment.
- **Credentials:** API key/secret and webhook secret are environment variables only — never stored in the database or exposed through any UI, including Company Settings.

## 8. Help Assistant (Chatbot)

- **Provider:** Anthropic Claude API (or OpenAI), called directly from a Node server action — no Python needed.
- **Scope:** answers product-usage/how-to questions from a small, maintained FAQ/knowledge base bundled with the app. It never queries Prisma and never sees a user's financial data.
- **Placement:** a floating widget on the App Dashboard (Admin/Accountant) and Portal Home (Contact).
- **State:** stateless per session — no chat-history table in this release; conversation lives only in client component state.
- **Fallback:** if the LLM API is unavailable, the widget shows a "temporarily unavailable" message and a link to human support, rather than failing silently.

## 9. Email

- Resend as the sole transactional email provider.
- Used for: portal invites, password-reset links, payment receipts (manual and gateway).
- Sent synchronously from the triggering server action (e.g., invite sent as part of the "Invite to Portal" request; receipt sent right after a webhook confirms a gateway payment).

## 10. Observability

- Structured JSON logs shipped to Better Stack / Logtail.
- Uptime monitoring on the production URL, database, and the payment webhook route.
- Alerting on: failed payments, unbalanced journal entry attempts, payment webhook signature failures, Help Assistant API errors.

## 11. Testing Strategy

| Type | Tool | Coverage Focus |
|---|---|---|
| Unit | Vitest | Debit=credit validation, status computation, budget math, webhook signature verification, payment idempotency |
| Integration | Vitest + test DB | Prisma queries, transaction rollback correctness |
| E2E | Playwright | PO→Bill→Payment, SO→Invoice→Payment, Portal gateway payment (mocked Razorpay), Help Assistant fallback state |

- Minimum coverage gate enforced on the service/business-logic layer before merge.

## 12. Environments

| Environment | Purpose |
|---|---|
| Development | Local development, preview deploys per branch; Payment Gateway in test mode |
| Staging | Pre-production, mirrors prod config, seeded test data; Payment Gateway in test mode |
| Production | Live data, restricted access, automated backups; Payment Gateway in live mode |

- Deployments via Vercel's Git integration: automatic preview per branch, production deploy on merge to main.
- Database migrations applied manually against staging first, then production.

## 13. Infrastructure & Hosting

| Component | Provider |
|---|---|
| App | Vercel |
| Database | Neon or Supabase (managed Postgres, automated daily backups, point-in-time recovery) |
| File storage | AWS S3 |
| Payment Gateway | Razorpay |
| DNS/CDN | Vercel Edge Network |

## 14. Architecture Diagram

```
Browser (Admin/Accountant Workspace · Contact Portal)
        │
        ▼
Next.js (Server Components, Server Actions, Route Handlers)
        │
        ├── Auth.js ── session + role check
        ├── Zod ── input validation
        ├── Service Layer ── accounting rules, budget math, payment recording
        ├── Prisma ── PostgreSQL (pooled)
        ├── Resend ── transactional email (invites, resets, receipts)
        ├── S3 Client ── document/image storage (incl. generated PDFs)
        └── Toast (Sonner) ── success/error feedback in the UI
        │
        ▼
Logtail ── structured logs

Isolated integrations (called only from their own service, never from Presentation):
        Razorpay ── Checkout + signed webhook → /api/webhooks/payment → PaymentService
        Claude/OpenAI API ── Help Assistant widget → SupportAssistantService (no DB access)
```

## 15. Explicitly Not Used

- Python — no training or self-hosted models required; the Help Assistant chatbot and any future AI feature call provider APIs directly from Node.
