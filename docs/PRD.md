# Product Requirements Document (PRD)
## LedgerOne — Accounting System

| Field | Detail |
|---|---|
| **Product Name** | LedgerOne |
| **Document Type** | Product Requirements Document (PRD) |
| **Version** | 1.1 |
| **Status** | Draft — for review |
| **Related Documents** | `WORKFLOW.md` (screen-by-screen navigation spec), `USECASE.md` (use case specification), `architecture.md`, `TECH_STACK.md`, `SCREENS.md` |
| **Feature Constraints** | The core accounting/financial engine (calculations, journal entries, reports) contains no AI-driven logic — it is fully deterministic. The one explicit exception is a scoped, FAQ-based Help Assistant chatbot (see §7.17) that answers product usage questions only and never touches financial data. No code/implementation details — this document defines *what* the product must do, not *how* it is built. |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users / Personas](#4-target-users--personas)
5. [Scope](#5-scope)
6. [Roles & Permissions Matrix](#6-roles--permissions-matrix)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Data Model Overview](#9-data-model-overview)
10. [Key Business Rules](#10-key-business-rules)
11. [Assumptions & Constraints](#11-assumptions--constraints)
12. [Dependencies](#12-dependencies)
13. [Risks & Mitigations](#13-risks--mitigations)
14. [Release Plan / Milestones](#14-release-plan--milestones)
15. [Out of Scope / Future Enhancements](#15-out-of-scope--future-enhancements)
16. [Appendix](#16-appendix)

---

## 1. Executive Summary

LedgerOne is a purpose-built accounting system for small businesses (e.g., a furniture retailer) that replaces fragmented spreadsheets and manual ledgers with a structured, auditable workflow covering master data, purchases, sales, payments, budgeting, and financial reporting. It is used internally by a business owner and accountant to run day-to-day bookkeeping, and externally by that business's own customers and vendors through a lightweight self-service portal for viewing and settling invoices/bills — including paying online via an integrated payment gateway.

The core product is a traditional, deterministic business application — every number on every report is produced by explicit, auditable calculation rules (double-entry bookkeeping, account-type aggregation), not by any predictive or generative logic. The one bounded exception is an optional Help Assistant chatbot for product guidance (§7.17), which is fully isolated from the accounting engine.

---

## 2. Problem Statement

Small businesses adopting LedgerOne typically come from disconnected, manual bookkeeping processes. This creates the following pain points:

| Pain Point | Impact |
|---|---|
| Customer/vendor details, product catalog, and account classifications live in separate spreadsheets | Data duplication, inconsistent records, no single source of truth |
| Purchases and sales are tracked without a linked audit trail from order → bill/invoice → payment | Difficult to reconcile what's owed vs. what's been paid |
| No enforced double-entry bookkeeping | Errors go undetected; books can become unbalanced without warning |
| No structured budgeting against real transactions | Business owner cannot tell if spend on a project/department is on-track until it's too late |
| Financial statements (Balance Sheet, P&L) are compiled manually at period-end | Slow, error-prone, and not available on demand |
| Customers/vendors must call or email to ask "have I paid this?" or "is this due?" | Wastes staff time on status inquiries that could be self-served |

## 3. Goals & Success Metrics

### 3.1 Business Goals
- Give the business owner real-time, trustworthy visibility into cash position, profitability, and budget adherence.
- Reduce time spent on manual bookkeeping and month-end closing.
- Reduce payment collection delays by giving customers/vendors direct visibility and self-service payment.
- Establish a single, consistent source of truth for contacts, products, and account structure.

### 3.2 Product Goals
- Provide a guided, form-driven workflow from master data → transaction → payment → report with no dead ends.
- Enforce accounting correctness (balanced entries, computed statuses) automatically so users cannot produce inconsistent books.
- Keep the day-to-day workspace identical for Admin and Accountant so staff can be onboarded interchangeably, while reserving system-level control for the Admin.
- Ship a portal experience simple enough that a non-technical customer or vendor can check and pay a bill in under a minute.

### 3.3 Success Metrics (indicative)
| Metric | Target |
|---|---|
| Time to generate Balance Sheet / P&L for a period | Instant (on-demand, no manual compilation) |
| % of journal entries that are auto-generated (vs. manual) | ≥ 80% (from confirmed Bills/Invoices) |
| Average time for a customer to view & pay an invoice via portal | < 2 minutes |
| Budget overrun visibility | 100% of Purchase Orders exceeding budget flagged at confirmation |
| Unbalanced journal entries reaching "Posted" status | 0 (hard-blocked by validation) |
| Reduction in "what's my balance" support inquiries after portal launch | Target 50%+ reduction |

## 4. Target Users / Personas

| Persona | Description | Primary Needs |
|---|---|---|
| **Administrator** (Business Owner) | Owns the company; ultimately accountable for the books and system access | Full control, oversight of all data, ability to manage who has system access |
| **Accountant** (Invoicing User) | Handles daily bookkeeping — data entry, invoicing, billing, reconciliation | Fast, low-friction entry screens; confidence that the system prevents mistakes |
| **Contact User** (Customer or Vendor) | External party who owes or is owed money | A simple way to see what they owe/are owed and settle it without contacting staff |

## 5. Scope

### 5.1 In Scope (MVP + near-term)
- User authentication, self-registration (Accountant), and Admin-managed internal user provisioning
- Master data: Contacts, Products, Chart of Accounts, Journals, Analytic Accounts, Tax Rates
- Purchase cycle: Purchase Order → Vendor Bill → Bill Payment (manual, internally recorded)
- Sales cycle: Sales Order → Customer Invoice → Invoice Payment/Receipt (manual or via Payment Gateway)
- Manual and auto-generated Journal Entries with balance enforcement, including the second entry generated when a payment is recorded (§10, rule 10)
- Budgeting with Draft/Confirm/Revise/Cancel lifecycle and actuals tracking via Analytic Accounts
- Financial reports: Balance Sheet, Profit & Loss, Budget Report
- Payment Gateway integration for customer self-service invoice payments (Portal only — see §7.16)
- Customer/Vendor self-service portal: view own invoices/bills, pay Invoices online (Customers), view payment history
- Scoped Help Assistant chatbot for product-usage guidance, available in the Workspace and Portal (see §7.17)
- Company-level configuration (Admin only)

### 5.2 Explicitly Out of Scope (this release)
- Any AI/ML-driven feature within the core accounting engine (auto-categorization, predictive insights, OCR-based data entry, automated financial analysis) — the only exception is the scoped Help Assistant chatbot in §7.17, which never accesses financial data
- Multi-company / multi-entity consolidation
- Multi-currency accounting
- Inventory/warehouse stock management (Products are catalog/pricing records only — no stock quantities or stock movement)
- Payroll and HR
- Bank feed integration / automated bank reconciliation
- Outbound vendor payouts via a gateway/disbursement API (vendor payments remain a manual, internally recorded Bank/Cash entry)
- Recurring/subscription invoicing
- Approval-chain workflows (e.g., multi-level PO approval)
- Third-party integrations beyond the Payment Gateway and email/PDF delivery (e.g., accounting-standard exports like Tally/QuickBooks)

## 6. Roles & Permissions Matrix

| Module / Capability | Administrator | Accountant | Contact User |
|---|---|---|---|
| System Users (create/manage logins) | Full | No access | No access |
| Company Settings | Full | No access | No access |
| Self-registration (Sign Up) | N/A (provisioned via Create User) | Full (self-service) | No access |
| Contacts | Full (incl. hard delete) | Full (archive only, no hard delete) | No access |
| Products | Full (incl. hard delete) | Full (archive only) | No access |
| Chart of Accounts | Full (incl. hard delete) | Full (archive only) | No access |
| Journals | Full | Full | No access |
| Analytic Accounts | Full | Full | No access |
| Tax Rates | Full | Full | No access |
| Purchase Orders / Vendor Bills / Payments | Full | Full | No access |
| Sales Orders / Customer Invoices / Receipts | Full | Full | No access |
| Journal Entries (manual) | Full | Full | No access |
| Budgets (create/confirm/revise/cancel) | Full | Full | No access |
| Financial Reports (Balance Sheet, P&L, Budget Report) | Full (view + print) | Full (view + print) | No access |
| Invite Contact to Portal | Yes | Yes | N/A |
| Own Sales Invoices (portal) | N/A | N/A | View + Pay via Payment Gateway (Customer only, own records only) |
| Own Vendor Bills (portal) | N/A | N/A | View only — no payment action (Vendor only; LedgerOne pays the vendor, not the reverse) |
| Own Payment History (portal) | N/A | N/A | View own only |
| Help Assistant Chatbot | Full (product guidance) | Full (product guidance) | Full (product guidance) |

*"Full" = Create, Read, Update, Archive unless otherwise noted. Hard delete (permanent removal) is reserved for Administrator only, and only on records with no linked transactions.*

## 7. Functional Requirements

Each requirement includes a priority: **P0** = required for MVP launch, **P1** = required for a production-ready release shortly after MVP, **P2** = future enhancement (tracked in §15). Full screen-level navigation for each requirement is detailed in the companion Workflow & Navigation Specification.

### 7.1 Authentication & User Management

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-1.1 | Users can log in with a Login ID and Password | All | P0 | Valid credentials route to the correct home screen (Dashboard for Admin/Accountant, Portal Home for Contact); invalid credentials show a generic *"Invalid Login Id or Password"* error without revealing which field was wrong |
| FR-1.2 | Prospective Accountants can self-register | Guest | P0 | New account is created with role = Accountant only; Login ID (6–12 chars, unique), Email (unique), and Password (uppercase + lowercase + special character, 8+ chars) are validated before account creation |
| FR-1.3 | Users can recover a forgotten password | All | P0 | A time-limited reset link is sent to the registered email; the link allows setting a new password meeting the same complexity rules |
| FR-1.4 | Admin can create internal user accounts (Admin or Accountant role) | Admin | P0 | Same uniqueness/complexity validations as self sign-up apply; created user can log in immediately |
| FR-1.5 | Admin can view, deactivate, and reset the password of any internal user | Admin | P1 | Deactivated users cannot log in until reactivated |
| FR-1.6 | Any logged-in user can view and edit their own profile and change their password | Admin, Accountant, Contact | P1 | Changes take effect immediately; password change requires the complexity rule |
| FR-1.7 | Admin/Accountant can invite a Contact to the self-service portal directly from that Contact's record | Admin, Accountant | P0 | Triggers creation of a Contact-role login and emails credentials/reset link to the contact's registered email |

### 7.2 Dashboard

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-2.1 | Admin/Accountant land on a Dashboard summarizing Sales, Purchase, and Budget activity | Admin, Accountant | P0 | Displays counts for Sales Orders and Purchase Orders by status (All/Confirmed/Draft) and Budget metrics (Achieved/Budget/Committed) |
| FR-2.2 | Dashboard provides quick-create shortcuts for Sales Orders and Purchase Orders | Admin, Accountant | P0 | "New" action opens a blank order form directly from the widget |
| FR-2.3 | Dashboard provides menu access to every module (Sales, Purchase, Account, Report) | Admin, Accountant | P0 | Each top-level menu reveals its full sub-item list on interaction |

### 7.3 Master Data — Contacts

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-3.1 | Create/edit a Contact with Name, Type (Customer/Vendor/Both), Email, Phone, Address, and Profile Image | Admin, Accountant | P0 | Email must be unique across all contacts; record saves and appears in the Contact list |
| FR-3.2 | View Contacts in both List and Kanban layouts | Admin, Accountant | P0 | Toggling the view preserves the same underlying data and search filter |
| FR-3.3 | Search/filter the Contact list | Admin, Accountant | P0 | Typing filters visible rows by name/email/phone in real time |
| FR-3.4 | Archive a Contact | Admin, Accountant | P1 | Archived contacts are hidden from active pickers (e.g., new Sales Order) but retained for historical transaction reference |

### 7.4 Master Data — Products

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-4.1 | Create/edit a Product with Name, Type (Goods/Service/Combo), Category, Sales Price, Cost, and Image | Admin, Accountant | P0 | Category is a lookup field that can also be created on the fly from within the Product form |
| FR-4.2 | View Products in both List and Kanban layouts | Admin, Accountant | P0 | Same data reflected in both views |
| FR-4.3 | Search/filter the Product list | Admin, Accountant | P0 | Filters by product name/category |

### 7.5 Master Data — Chart of Accounts

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-5.1 | System ships with a pre-configured default Chart of Accounts | System | P0 | Bank, Cash, Debtors, Creditors, Sales Income, Purchase Expense, Other Expense, and Capital accounts exist on first use |
| FR-5.2 | Create/edit an Account with Name and Type | Admin, Accountant | P0 | Type must be selected from the defined leaf types only (Asset, Liability, Bank, Capital, Cash, Income, Expenses, Other Expenses) — the Balance Sheet/P&L group headings themselves are not selectable |
| FR-5.3 | Archive and restore an Account | Admin, Accountant | P0 | Archived accounts move to a separate Archived view and can be restored to active status; accounts with transaction history cannot be hard-deleted |

### 7.6 Master Data — Journals

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-6.1 | System ships with pre-configured Sales, Purchase, Bank, and Cash journals | System | P0 | Each has a sensible Default Account pre-linked |
| FR-6.2 | Create/edit a Journal with Name, Type, and Default Account | Admin, Accountant | P0 | Default Account is selected from the Chart of Accounts |

### 7.7 Master Data — Analytic Accounts

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-7.1 | Create/edit an Analytic Account with Name and Type (Income/Expenses) | Admin, Accountant | P0 | Used to tag Sales Invoice lines (Income) and Purchase Order/Vendor Bill lines (Expenses) for budget tracking |

### 7.8 Master Data — Tax Rates

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-8.1 | Create/edit a Tax Rate with Name, Percentage, and Applicability (Sales/Purchase) | Admin, Accountant | P1 | Selectable on Sales Order lines; computed tax amount reflects in the order total |

### 7.9 Purchase Workflow

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-9.1 | Create a Purchase Order selecting Vendor, and line items of Product, Analytic Account, Quantity, and Unit Price | Admin, Accountant | P0 | Line Total = Qty × Unit Price; Grand Total sums all lines; PO Number auto-generates sequentially |
| FR-9.2 | Confirm a Purchase Order | Admin, Accountant | P0 | Status changes to Confirmed; if any line's amount exceeds the remaining committed budget for its Analytic Account, a non-blocking warning is shown but confirmation is still allowed |
| FR-9.3 | Convert a confirmed Purchase Order into a Vendor Bill | Admin, Accountant | P0 | New Bill pre-fills Vendor, Product, Quantity, and Price from the PO; the Bill retains a link back to its source PO |
| FR-9.4 | Create a Vendor Bill independent of a PO | Admin, Accountant | P0 | Same fields as a PO-sourced bill, entered manually |
| FR-9.5 | Confirm a Vendor Bill | Admin, Accountant | P0 | Auto-generates a balanced Journal Entry (Debit: Purchase Expense — or the selected account, Credit: Creditor) and posts it to the Journal Entries list |
| FR-9.6 | Record a payment against a Vendor Bill | Admin, Accountant | P0 | Payment Amount defaults to Amount Due (editable for partial payment); Payment Via defaults to Bank (switchable to Cash); Bill's status (Paid/Partial/Not Paid) and Amount Due recompute immediately; System auto-generates a second balanced Journal Entry (Debit: Creditor, Credit: Cash/Bank) so the Balance Sheet's Cash/Bank balance reflects the outgoing payment |
| FR-9.7 | View all Purchase Orders, Vendor Bills, and Payments in dedicated, filterable list views | Admin, Accountant | P0 | Lists support status filtering (All/Confirmed/Draft) and search |
| FR-9.8 | Cancel a Purchase Order or Vendor Bill | Admin, Accountant | P0 | Cancelled documents are excluded from budget-achievement and financial-report calculations |

### 7.10 Sales Workflow

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-10.1 | Create a Sales Order selecting Customer, and line items of Product, Analytic Account, Quantity, Unit Price, and Tax | Admin, Accountant | P0 | Line Total = Qty × Unit Price (+ Tax where applicable); SO Number auto-generates sequentially |
| FR-10.2 | Confirm a Sales Order | Admin, Accountant | P0 | Status changes to Confirmed and the order locks for line-item editing |
| FR-10.3 | Convert a confirmed Sales Order into a Customer Invoice | Admin, Accountant | P0 | New Invoice pre-fills Customer, Product, Quantity, and Price from the SO; the Invoice retains a link back to its source SO |
| FR-10.4 | Create a Customer Invoice independent of an SO | Admin, Accountant | P0 | Same fields as an SO-sourced invoice, entered manually |
| FR-10.5 | Confirm a Customer Invoice | Admin, Accountant | P0 | Auto-generates a balanced Journal Entry (Debit: Debtor, Credit: Sales Income — or the selected account) and posts it to the Journal Entries list |
| FR-10.6 | Record a payment/receipt against a Customer Invoice — manually (Admin/Accountant) or via Payment Gateway (Contact, §7.16) | Admin, Accountant, Contact | P0 | Payment Amount defaults to Amount Due (editable for partial payment, manual entry only); Payment Via defaults to Bank (switchable to Cash) for manual entries, or is set to the gateway method automatically; Invoice's status (Paid/Partial/Not Paid) and Amount Due recompute immediately; System auto-generates a second balanced Journal Entry (Debit: Cash/Bank, Credit: Debtor) so the Balance Sheet's Cash/Bank balance reflects the incoming payment |
| FR-10.7 | View all Sales Orders, Customer Invoices, and Receipts in dedicated, filterable list views | Admin, Accountant | P0 | Lists support status filtering and search |
| FR-10.8 | Cancel a Sales Order or Customer Invoice | Admin, Accountant | P0 | Cancelled documents are excluded from budget-achievement and financial-report calculations |

### 7.11 Accounting — Journal Entries

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-11.1 | View all Journal Entries (manual and system-generated) in one list | Admin, Accountant | P0 | Shows Date, Number, Partner, Journal, Total, and Status |
| FR-11.2 | Create a manual Journal Entry with Accounting Date, Journal, and line items (Account, Partner, Debit, Credit) | Admin, Accountant | P0 | Used for adjustments and opening balances |
| FR-11.3 | Post a Journal Entry only if Debit total equals Credit total | System (validation), Admin/Accountant (action) | P0 | Attempting to Post an unbalanced entry is blocked with a clear error; the entry remains editable until balanced |
| FR-11.4 | Reset a Journal Entry to Draft for correction | Admin, Accountant | P1 | Only entries not already reconciled in a report period can be reset |

### 7.12 Budgeting

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-12.1 | Create a Budget with Name, Period (start/end date), Responsible person, and lines linking an Analytic Account, Type, and Committed Amount | Admin, Accountant | P0 | Budget starts in Draft status |
| FR-12.2 | Confirm a Budget | Admin, Accountant | P0 | Status changes to Confirm; Achieved Amount, Achieved %, and Amount to Achieve become visible and are computed automatically |
| FR-12.3 | Automatically compute budget achievement from real transactions | System | P0 | Achieved Amount = sum of Sales Invoice lines (Income-type Analytic) or Vendor Bill lines (Expense-type Analytic) sharing the same Analytic Account within the budget period; Achieved % = Achieved ÷ Committed × 100; Amount to Achieve = Committed − Achieved |
| FR-12.4 | Drill into the transactions behind an Achieved Amount | Admin, Accountant | P1 | Clicking the value opens the filtered list of contributing Invoices/Bills |
| FR-12.5 | Revise a Confirmed Budget | Admin, Accountant | P0 | Creates a new Budget record with adjustable committed amounts, cross-linked to the original ("Revision Of" / "Revised With"); original budget name is retained with "Revised" appended |
| FR-12.6 | Cancel a Budget | Admin, Accountant | P0 | Status changes to Cancelled; excluded from active budget tracking |
| FR-12.7 | View all Budgets in a Budget Report (List and Kanban), including a visual Achieved-vs-Balance indicator | Admin, Accountant | P0 | Clicking any row/card opens the full Budget form |

### 7.13 Financial Reports

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-13.1 | Generate a Profit & Loss report for a selected year | System (compute), Admin/Accountant (view) | P0 | Shows Income (from Income-type accounts), Expenses (Expense + Other Expense-type accounts), and Net Income = Income − Expenses |
| FR-13.2 | Generate a Balance Sheet for a selected year | System (compute), Admin/Accountant (view) | P0 | Shows Assets (Bank, Cash, Debtors) vs. Liabilities (Capital, Creditors) with Total Asset / Total Liability |
| FR-13.3 | Print/export any report to PDF | Admin, Accountant | P0 | Generates a downloadable PDF matching the on-screen figures |
| FR-13.4 | Export list views (Contacts, Products, transactions) to Excel/CSV | Admin, Accountant | P1 | Exported file matches the current filtered/sorted view |

### 7.14 Company Settings

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-14.1 | Configure Company Name, Logo, Address, Base Currency, Fiscal Year start month, and document numbering prefixes | Admin | P1 | Changes apply to all newly generated documents and report headers going forward; historical documents are unaffected |

### 7.15 Contact Portal

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-15.1 | Contact logs in and lands on a Portal Home showing outstanding balance summary | Contact User | P0 | Tabs shown depend on Contact Type: Customer → My Invoices; Vendor → My Bills; Both → both |
| FR-15.2 | View own Invoices/Bills with Paid/Partial/Not Paid status filters | Contact User | P0 | Only records belonging to the logged-in contact are visible — no access to any other contact's data |
| FR-15.3 | View a read-only detail of an Invoice/Bill, including line items and Amount Due | Contact User | P0 | Includes a Download PDF option |
| FR-15.4 | Pay an open Sales Invoice (full or partial) via the integrated Payment Gateway | Contact User (Customer only) | P0 | Only available on Invoices, never on Vendor Bills; Amount Due and status update only after gateway confirmation (§7.16); entry recorded in Payment History |
| FR-15.5 | View own payment history | Contact User | P1 | Chronological list of all payments made, each showing amount, method, gateway reference (if applicable), and linking back to its source document |
| FR-15.6 | Manage own profile and password | Contact User | P1 | Standard profile edit/password-change flow |

### 7.16 Payment Gateway (Customer Self-Service Payments)

Applies only to inbound Customer Invoice payments initiated from the Portal. Vendor Bills are never paid through the gateway — LedgerOne pays vendors manually (§7.9, FR-9.6).

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-16.1 | Contact initiates a gateway payment from an open Sales Invoice | Contact User | P0 | System creates a gateway order for the exact Amount Due (or a valid partial amount) and opens the gateway's checkout |
| FR-16.2 | System confirms payment success only via a verified webhook from the gateway, never from the client-side redirect alone | System | P0 | A payment is marked Successful only after the gateway's webhook signature is validated server-side; a client redirect without a matching webhook shows "Payment Processing," not "Paid" |
| FR-16.3 | Every gateway payment attempt is stored with its gateway reference, method, amount, and status, linked to its source Invoice | System | P0 | Retrievable from: the Invoice's payment section, the Contact's Payment History (FR-15.5), and the Admin/Accountant Receipt list (FR-10.7), for reconciliation |
| FR-16.4 | A confirmed gateway payment triggers the same downstream accounting as a manually recorded payment | System | P0 | Invoice status/Amount Due recompute and the second Journal Entry (FR-10.6) is created identically regardless of payment channel |
| FR-16.5 | Failed or abandoned gateway payments are recorded but do not affect the Invoice | System | P0 | Invoice remains Not Paid/Partial at its prior state; the failed attempt is visible in Payment History with a Failed status |
| FR-16.6 | Duplicate webhook deliveries for the same gateway transaction are not double-processed | System | P0 | Idempotency check on the gateway transaction reference before creating a new Payment record |

### 7.17 Help Assistant Chatbot

A scoped, FAQ-based assistant for product usage guidance. It never reads, computes, or modifies financial data — it is fully isolated from the accounting engine described elsewhere in this document.

| ID | Requirement | Actor | Priority | Acceptance Criteria |
|---|---|---|---|---|
| FR-17.1 | A persistent chat entry point is available on the App Dashboard (Admin/Accountant) and Portal Home (Contact) | All | P1 | Opens a chat panel without leaving the current screen |
| FR-17.2 | The chatbot answers "how do I…" and "what does…mean" product questions from a maintained knowledge base | All | P1 | Answers are limited to product usage/navigation topics (e.g., "how do I revise a budget," "what does Partial status mean") |
| FR-17.3 | The chatbot never accesses a user's financial records, and states this limitation if asked an account-specific question | All | P1 | E.g., asked "how much do I owe," it directs the user to My Invoices rather than attempting to answer |
| FR-17.4 | The chatbot offers a human-support escalation path when it cannot help | All | P1 | Provides a support email/contact link |
| FR-17.5 | Chat conversations are session-only and not persisted after the session ends | System | P1 | No chat-history entity in the MVP data model (§9) |

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Security — Access Control** | Role-based access strictly enforced server-side (not just hidden in the UI); Contact Users can never query or view another contact's financial records |
| **Security — Credentials** | Passwords stored using industry-standard one-way hashing; password complexity enforced at creation and reset (uppercase, lowercase, special character, 8+ characters) |
| **Data Integrity** | Every Journal Entry must balance (Debit = Credit) before it can be posted; this rule cannot be bypassed by any workflow, including auto-generated entries |
| **Auditability** | Every transaction (PO, Bill, SO, Invoice, Payment, Journal Entry, Budget revision) retains a permanent, immutable history — records are archived/cancelled, never silently deleted, once linked to a transaction |
| **Usability** | Master-data and transaction forms follow one consistent pattern (List → New/Edit Form → Confirm) throughout the product so users only need to learn the pattern once |
| **Performance** | List views and reports return results within 2 seconds for typical data volumes (thousands of records); search/filter responds without a full page reload |
| **Availability** | Core bookkeeping functions (creating/confirming transactions) must remain available during business hours with minimal planned downtime |
| **Responsiveness** | Contact Portal must be fully usable on mobile-width screens, since customers/vendors are expected to check and pay from a phone |
| **Backup & Recovery** | Financial data is backed up on a regular schedule with a defined recovery point objective, given its business-critical nature |
| **Compliance** | Chart of Accounts structure and reporting align with standard double-entry bookkeeping and Balance Sheet/P&L presentation conventions |
| **Localization (baseline)** | Currency symbol and date format are configurable at the company level (see FR-14.1), even though multi-currency accounting itself is out of scope |
| **Feedback & Messaging** | Every user action produces a clear, consistent response: inline messages for form validation errors, toast confirmations for successful actions (e.g., "Invoice confirmed," "Payment recorded"), and modal alerts for blocking/critical errors (e.g., unbalanced journal entry, payment failure). No action is ever silent, and no raw technical error is shown to the user |
| **Third-Party Integration Resilience** | Payment Gateway or Help Assistant outages degrade gracefully without blocking core bookkeeping: a gateway outage shows a clear "try again" message and leaves the Invoice unaffected; a chatbot outage shows a "temporarily unavailable" state instead of failing silently |

## 9. Data Model Overview

High-level entities and their key relationships (conceptual — not a technical schema):

| Entity | Key Relationships |
|---|---|
| **User (internal)** | Has one Role (Administrator / Accountant) |
| **Contact** | Has Type (Customer/Vendor/Both); optionally linked to one Contact-role portal login |
| **Product** | Belongs to one Category |
| **Chart of Account** | Has one Type (Asset, Liability, Bank, Capital, Cash, Income, Expenses, Other Expenses) |
| **Journal** | Has one Type (Sales/Purchase/Bank/Cash); linked to one Default Account (Chart of Account) |
| **Analytic Account** | Has one Type (Income/Expenses); referenced by Sales Order/Invoice lines and Purchase Order/Bill lines; referenced by Budget lines |
| **Tax Rate** | Referenced by Sales Order lines |
| **Purchase Order** | Belongs to one Vendor (Contact); has many lines (Product, Analytic Account, Qty, Price); may generate one Vendor Bill |
| **Vendor Bill** | Belongs to one Vendor (Contact); optionally sourced from one Purchase Order; has many lines; generates one Journal Entry on confirmation; has many Payments |
| **Bill Payment** | Belongs to one Vendor Bill |
| **Sales Order** | Belongs to one Customer (Contact); has many lines; may generate one Customer Invoice |
| **Customer Invoice** | Belongs to one Customer (Contact); optionally sourced from one Sales Order; has many lines; generates one Journal Entry on confirmation; has many Payments/Receipts |
| **Invoice Payment (Receipt)** | Belongs to one Customer Invoice; sourced either from a manual entry (Admin/Accountant) or a confirmed Payment Gateway Transaction (Portal) |
| **Payment Gateway Transaction** | Belongs to one Customer Invoice; stores gateway provider, order/transaction reference, method, amount, status (Initiated/Success/Failed), and webhook confirmation timestamp; on Success, produces one Invoice Payment |
| **Journal Entry** | Belongs to one Journal; has many lines (Account, Partner, Debit, Credit); generated automatically at two points — Bill/Invoice confirmation, and payment recording (manual or gateway) — or created manually |
| **Budget** | Has many lines (Analytic Account, Type, Committed Amount); may be linked to a prior/next revision of itself |
| **Company Settings** | Single record per company; referenced by document numbering and report headers. Payment Gateway and chatbot API credentials are **environment-level secrets, not stored on this record or exposed in any UI field** |

*No persistent entity is required for the MVP Help Assistant chatbot — conversations are session-only (FR-17.5).*

## 10. Key Business Rules

*(Full detail in the companion Workflow & Navigation Specification, §6 Appendix — summarized here for PRD completeness.)*

1. Login ID, Email, and Password each have uniqueness/complexity rules enforced at both self sign-up and Admin-created accounts.
2. Chart of Accounts types are grouped under two non-selectable report headings (Balance Sheet, Profit and Loss); only leaf types are assignable.
3. A Journal Entry can only be Posted if total Debit equals total Credit.
4. Confirming a Purchase Order whose line exceeds the remaining approved budget shows a non-blocking warning, not a hard stop.
5. Vendor Bill / Customer Invoice status (Paid/Partial/Not Paid) is always a computed field: `Amount Due = Total − Amount Paid`.
6. Confirming a Bill or Invoice always auto-generates a balanced Journal Entry using the module's default account (Purchase Expense for Bills, Sales Income for Invoices).
7. Budget Achieved Amount is computed only after a Budget is Confirmed, by summing transactions sharing the same Analytic Account within the budget period.
8. Revising a Budget never overwrites history — it creates a new, linked record.
9. Balance Sheet and Profit & Loss figures are always derived live from posted Journal Entries and Chart of Account types — never manually entered.
10. Recording a payment — whether entered manually by Admin/Accountant or confirmed via the Payment Gateway — always auto-generates a **second** balanced Journal Entry that moves the amount between the Debtor/Creditor account and Cash/Bank. This is separate from, and in addition to, the entry created at Bill/Invoice confirmation; without it, Cash/Bank balances on the Balance Sheet would never reflect actual money movement.
11. A Payment Gateway transaction only updates an Invoice's status after its webhook signature is verified server-side. A client-side redirect claiming success is never, by itself, sufficient to mark an Invoice Paid.
12. Vendor Bills are never payable by the Vendor through the Portal. Only Sales Invoices can be paid by a Customer — LedgerOne pays vendors, not the reverse.

## 11. Assumptions & Constraints

- Single company/business entity — no multi-entity consolidation in this release.
- Single base currency per company (no multi-currency conversion).
- Products are pricing/catalog records only; no stock-quantity or warehouse tracking is required.
- Email delivery (for password resets and portal invitations) is available as a system capability but is not itself a product feature to be designed here.
- Users have basic familiarity with standard business software (forms, lists, buttons) — no specialized accounting training is assumed, but basic accounting vocabulary (debit/credit, invoice/bill) is used as-is.
- One fiscal year is defined by the Company Settings' Fiscal Year Start Month; all reports operate within that structure.
- The Payment Gateway is scoped to inbound Customer Invoice payments only; outbound Vendor Bill payments remain a manual, internally recorded process.
- The Help Assistant chatbot answers product-usage questions from a maintained FAQ/knowledge base only — it is not a source of financial or accounting advice, and does not read any user's transactional data.

## 12. Dependencies

- A reliable email delivery mechanism for account invitations, password resets, and (optionally) payment receipts.
- A PDF generation capability for printable reports, invoices, and bills.
- Secure credential storage and session management for three distinct login roles across an internal workspace and an external portal.
- A Payment Gateway account (e.g., Razorpay) with API keys and a configured webhook endpoint.
- An LLM API provider (e.g., Anthropic or OpenAI) for the Help Assistant chatbot.

## 13. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Users bypass structured transactions by editing Journal Entries directly, causing books to lose their audit trail | Loss of trust in reports | Restrict manual Journal Entries to adjustment/opening-balance use cases; keep system-generated entries linked to and largely read-only outside their source document |
| Contact Portal exposes one customer's data to another due to access-control error | Serious privacy/trust breach | Enforce contact-scoped data access at every query, not just in the UI; treat this as a P0 security requirement (see §8) |
| Budget achievement figures feel "wrong" if Analytic Accounts aren't consistently tagged on transaction lines | Business owner loses confidence in budgeting | Make Analytic Account a required field on Sales Order/Invoice/Purchase Order/Bill lines whenever budget tracking is in use; provide the drill-down (FR-12.4) to build trust in the number |
| Users confirm documents prematurely and need to correct them | Data-entry friction | Provide Cancel/Reset-to-Draft paths (§7.9, §7.10, §7.11) so mistakes are recoverable without corrupting history |
| Payment Gateway webhook is delayed or lost, leaving a successful payment looking unpaid | Customer confusion, possible duplicate payment attempts | Show a "Payment Processing" interim state instead of "Failed"; provide a "Check Payment Status" action that re-queries the gateway directly |
| Duplicate webhook delivery records the same payment twice | Overstated cash, incorrect Amount Due | Idempotency check on the gateway transaction reference before creating a Payment record (FR-16.6) |
| Chatbot gives an incorrect or out-of-scope answer (e.g., financial advice) | User confusion, potential liability | Restrict its knowledge base strictly to product usage FAQ; explicit disclaimer; always offer human-support escalation (FR-17.4) |

## 14. Release Plan / Milestones

| Phase | Contents |
|---|---|
| **MVP (Phase 1)** | All P0 requirements: authentication core flows, all master data, full Purchase and Sales cycles, manual + auto Journal Entries with balance enforcement (including the payment-triggered second entry), Budget lifecycle, Balance Sheet, P&L, Budget Report, core Contact Portal (view + pay via Payment Gateway) |
| **Phase 2 (Production Hardening)** | All P1 requirements: User Management list, Admin/Accountant profile management, Tax Rates, list/report export, budget drill-down, Company Settings, Contact Portal payment history & profile, Help Assistant chatbot |
| **Phase 3 (Future)** | Items listed in §15, prioritized based on user feedback after Phase 1–2 adoption |

## 15. Out of Scope / Future Enhancements

- Multi-currency and multi-company support
- Inventory/stock quantity management and warehouse operations
- Payroll and HR modules
- Bank feed integration and automated reconciliation
- Outbound vendor payouts via a gateway/disbursement API
- Recurring/subscription billing
- Multi-level approval workflows for high-value transactions
- Role customization beyond the three defined roles (e.g., custom permission sets)
- Integrations with third-party accounting/ERP tools
- Any AI-assisted or predictive feature within the accounting engine itself; a Phase 2+ evolution of the chatbot to answer *scoped, read-only* account-specific questions (e.g., "what's my balance") using the same secure, contact-isolated services as the Portal is a possible future enhancement, not part of this release

## 16. Appendix

- **Glossary:**
  - **PO** — Purchase Order
  - **SO** — Sales Order
  - **CoA** — Chart of Accounts
  - **P&L** — Profit & Loss
  - **Analytic Account** — a tag used to group income/expense across transactions for budget and project tracking
  - **Payment Gateway** — a third-party service (e.g., Razorpay) that processes an online payment (card/UPI/netbanking) on LedgerOne's behalf
  - **Webhook** — a server-to-server notification the Payment Gateway sends to confirm a payment's final status; the source of truth for marking an Invoice Paid
  - **Help Assistant** — the scoped, FAQ-based chatbot that answers product usage questions (§7.17)
- **Reference Materials:** Original wireframe set (Excalidraw) and the companion `WORKFLOW.md` navigation specification, which contains the full screen-by-screen flow underlying every requirement in this document.