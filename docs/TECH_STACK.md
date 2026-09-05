# Tech Stack — Urban Furniture Accounting System

**Version:** 1.0 · **Related:** `prd.md`, `Urban_Furniture_Accounting_System_Workflow.md`

---

## 1. Stack Overview

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript) |
| UI | Tailwind CSS + shadcn/ui |
| Forms & Validation | React Hook Form + Zod |
| Database | PostgreSQL |
| ORM | Prisma |
| Connection Pooling | PgBouncer (via managed Postgres provider) |
| Auth | Auth.js (NextAuth), credentials provider, bcrypt/argon2 hashing |
| File Storage | AWS S3 (signed URLs) |
| Transactional Email | Resend |
| PDF Generation | @react-pdf/renderer |
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

## 7. Email

- Resend as the sole transactional email provider.
- Used for: portal invites, password-reset links, payment receipts.
- Sent synchronously from the triggering server action (e.g., invite sent as part of the "Invite to Portal" request).

## 8. Observability

- Structured JSON logs shipped to Better Stack / Logtail.
- Uptime monitoring on the production URL and database.
- Alerting on: failed payments, unbalanced journal entry attempts.

## 9. Testing Strategy

| Type | Tool | Coverage Focus |
|---|---|---|
| Unit | Vitest | Debit=credit validation, status computation, budget math |
| Integration | Vitest + test DB | Prisma queries, transaction rollback correctness |
| E2E | Playwright | PO→Bill→Payment, SO→Invoice→Payment, Portal payment flow |

- Minimum coverage gate enforced on the service/business-logic layer before merge.

## 10. Environments

| Environment | Purpose |
|---|---|
| Development | Local development, preview deploys per branch |
| Staging | Pre-production, mirrors prod config, seeded test data |
| Production | Live data, restricted access, automated backups |

- Deployments via Vercel's Git integration: automatic preview per branch, production deploy on merge to main.
- Database migrations applied manually against staging first, then production.

## 11. Infrastructure & Hosting

| Component | Provider |
|---|---|
| App | Vercel |
| Database | Neon or Supabase (managed Postgres, automated daily backups, point-in-time recovery) |
| File storage | AWS S3 |
| DNS/CDN | Vercel Edge Network |

## 12. Architecture Diagram

```
Browser (Admin/Accountant Workspace · Contact Portal)
        │
        ▼
Next.js (Server Components, Server Actions, Route Handlers)
        │
        ├── Auth.js ── session + role check
        ├── Zod ── input validation
        ├── Service Layer ── accounting rules, budget math
        ├── Prisma ── PostgreSQL (pooled)
        ├── Resend ── transactional email (invites, resets, receipts)
        └── S3 Client ── document/image storage (incl. generated PDFs)
        │
        ▼
Logtail ── structured logs
```

## 13. Explicitly Not Used

- Python — no training or self-hosted models required; any future AI feature calls provider APIs directly from Node.
