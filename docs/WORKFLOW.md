# LedgerOne — Accounting System
## End-to-End Workflow & Navigation Specification

**Version:** 1.1 · **Related:** `PRD.md`, `architecture.md`, `USECASE.md`, `SCREENS.md`, `TECH_STACK.md`

**Scope:** This document defines every screen in the system, who can access it, and the exact click-by-click navigation between screens. Every table below includes an **Actor** column so it is immediately clear *who* performs each action. No code is included. The accounting engine itself is fully deterministic and non-AI; the one exception is a scoped, FAQ-based Help Assistant chatbot (§2, §3.2, §4) that offers product guidance only and never touches financial data.

---

## Table of Contents

1. [Actors & Core Features](#1-actors--core-features)
2. [System-Wide Conventions](#2-system-wide-conventions)
3. [Screen-by-Screen Navigation — Admin & Accountant Workspace](#3-screen-by-screen-navigation--admin--accountant-workspace)
   - 3.1 Authentication & Account Access
   - 3.2 App Dashboard
   - 3.3 User & Access Management (Admin)
   - 3.4 Master Data
   - 3.5 Sales Workflow
   - 3.6 Purchase Workflow
   - 3.7 Accounting (Journal Entries)
   - 3.8 Budgeting
   - 3.9 Financial Reports
   - 3.10 Company Settings (Admin)
4. [Screen-by-Screen Navigation — Contact Portal](#4-screen-by-screen-navigation--contact-portal)
5. [Page Inventory by Role](#5-page-inventory-by-role)
6. [Appendix — Business Rules & Validation Reference](#6-appendix--business-rules--validation-reference)

---

## 1. Actors & Core Features

| Actor | Who they are | Core Features |
|---|---|---|
| **Administrator** (Business Owner) | Owns the company account; the only role that can manage system users and company-wide settings | • Full access to all master data (create/edit/archive/delete)<br>• Create, confirm, and cancel all transactions (PO, SO, Bill, Invoice, Payments)<br>• Create and post manual Journal Entries<br>• Create, confirm, revise, and cancel Budgets<br>• View/print all financial reports<br>• Reconcile Payment Gateway transactions against Receipts<br>• Create and manage system Users (Admin & Accountant logins)<br>• Grant/revoke Contact Portal access<br>• Configure company settings (profile, tax rates, fiscal year)<br>• Use the Help Assistant chatbot for product guidance |
| **Accountant** (Invoicing User) | Day-to-day bookkeeper; can self-register | • Create/edit/archive all master data (Contacts, Products, Chart of Accounts, Journals, Analytic Accounts, Tax Rates)<br>• Create and manage full Purchase cycle (PO → Bill → Payment)<br>• Create and manage full Sales cycle (SO → Invoice → Receipt)<br>• Create and post manual Journal Entries<br>• Create, confirm, and revise Budgets<br>• View/print all financial reports<br>• Grant Contact Portal access<br>• Use the Help Assistant chatbot for product guidance<br>• **Cannot** manage system Users or Company Settings; cannot permanently delete records (archive only) |
| **Contact User** (Customer / Vendor Portal) | External party — a Customer, Vendor, or Both — invited by Admin/Accountant from the Contact record | • View own Sales Invoices (if Customer) in Paid / Partial / Not Paid status, and pay them via the integrated Payment Gateway<br>• View own Vendor Bills (if Vendor) in Paid / Partial / Not Paid status — **view only, no payment action** (LedgerOne pays the vendor, not the reverse)<br>• View own payment history<br>• Update own profile/password<br>• Use the Help Assistant chatbot for product guidance<br>• **No** access to master data, other contacts' records, reports, or accounting screens |

**How to read the tables below:** Every screen table includes an **Actor** column stating exactly who performs that row's action. Where a step is not performed by a person at all but happens automatically (e.g., a journal entry generated on confirming an invoice), the Actor is listed as **System (Automated)**.

---

## 2. System-Wide Conventions

These rules apply across every screen described in this document, so they are defined once here instead of repeated per screen.

| Convention | Behavior |
|---|---|
| **Back button** | Returns to the immediately previous screen in the navigation stack (usually the parent List View). |
| **Home button** | Appears on deeper/nested screens (e.g., Chart of Accounts); jumps directly to the App Dashboard regardless of navigation depth. |
| **List ⇄ Kanban toggle** | Two icons in the top-right of List Views (Contact, Product, Budget Report) let the user switch between List View and Kanban View of the same data. Not available on Chart of Accounts, Journals, Journal Entries, PO/SO/Bill/Invoice lists — these remain List-only. |
| **New button** | Opens a blank Form View for that module. |
| **Clicking an existing row/card** | Opens the Form View pre-filled with that record's saved data. |
| **Search box** | Present on every List View; filters the visible rows by name/number/partner as the user types. |
| **Confirm button** | Moves a document from **Draft** to **Confirmed** status; triggers any downstream automation (e.g., journal entry creation, budget consumption). |
| **Cancel button** | Moves a document to **Cancelled** status; cancelled documents are excluded from reports and budget achievement. |
| **Archive** | Soft-removes a master record from active lists without deleting history; archived records remain visible under an "Archived" filter and can be restored. Performed by Admin or Accountant. |
| **Hard Delete** | Performed by **Admin only** 🔒. Permanently removes a record that has no linked transactions. |
| **Status badges** | Color-coded pill/badge shown on list rows and form headers (e.g., Draft = grey, Confirmed/Posted = green, Cancelled = red, Paid = green, Partial = amber, Not Paid = red). |
| **Destructive-action confirmation** | Any Cancel, Archive, or Delete action opens a small confirmation modal ("Are you sure?") before executing. |
| **Pagination & sorting** | All list views paginate beyond 25 rows and support column-header sorting. |
| **Export** | All financial reports support Print (PDF). List views support Export to Excel/CSV. |
| **Session** | User avatar (top-right of header) opens a dropdown with **My Profile** and **Logout**. Logout always returns to the Login Page. |
| **Unauthorized access** | If a user's role does not permit a screen (e.g., Accountant tries a 🔒 Admin-only URL), the system shows an "Access Restricted" page with a link back to the Dashboard. |
| **Toast (success) message** | Every completed action (Confirm, Post, Pay, Save, Archive, Revise) shows a brief, action-matched toast — e.g., "Invoice confirmed," "Payment recorded," "Budget revised" — then auto-dismisses. Never a generic "Success." |
| **Inline validation message** | Form field errors (e.g., duplicate email, unbalanced entry) appear directly below the field the moment they're detected — never only in a separate summary or a toast. |
| **Modal alert (blocking error)** | Critical or blocking conditions — an unbalanced Journal Entry, a failed Payment Gateway charge, a permission error — interrupt with a modal that must be acknowledged, rather than a passing toast. |
| **Help Assistant widget** | A floating chat button, available on the App Dashboard and Portal Home (see §3.2, §4), opens a panel for FAQ-based product guidance. It is a persistent UI element, not a separate page, and never reads or displays financial data. |

---

## 3. Screen-by-Screen Navigation — Admin & Accountant Workspace

### 3.1 Authentication & Account Access

**Flow chain:**
`[Any User] Login Page → (valid creds) → App Dashboard (Admin/Accountant) or Portal Home (Contact)`
`[Guest] Login Page → [Sign Up] → Sign Up Page → (submit) → Login Page`
`[Any User] Login Page → [Forgot Password] → Forgot Password Page → (email sent) → Reset Password Page (via emailed link) → Login Page`
`[Admin] Dashboard → Users → User Management List → [New User] → Create User Page → Save → User Management List`

| Screen | Actor | Key Fields | Actions → Resulting Navigation |
|---|---|---|---|
| **Login Page** | Any user (Admin, Accountant, or Contact) | Login ID, Password | • **User** enters valid credentials + **Sign In** → routes to **App Dashboard** (Admin/Accountant) or **Portal Home** (Contact), based on account role — routing decision made by **System**<br>• Invalid credentials → **System** shows inline error *"Invalid Login Id or Password"*, user stays on page<br>• **User** clicks **Sign Up** → **Sign Up Page**<br>• **User** clicks **Forgot Password** → **Forgot Password Page** |
| **Sign Up Page** | Guest (unauthenticated visitor) | Login ID, Email, Password, Re-enter Password | • **Guest** submits valid, unique data → **System** creates account with role = **Accountant** → redirected to **Login Page**<br>• Duplicate email/Login ID or password rule failure → **System** shows inline validation errors<br>• **Guest** clicks **Sign In** link → **Login Page** |
| **Forgot Password Page** | Any user | Registered Email | • **User** submits → **System** emails a time-limited reset link → **Reset Password Page** (via emailed link only) |
| **Reset Password Page** | Any user (via emailed link) | New Password, Re-enter Password | • **User** submits valid password → **System** updates password → redirected to **Login Page** |
| **Create User Page** 🔒 | **Admin only** | Name, Login ID, Email, Role (User/Administrator), Password, Re-enter Password | • **Admin** clicks **Create** → **System** validates uniqueness rules → new internal login created → returns to **User Management List**<br>• **Admin** clicks **Cancel** → returns to **User Management List** without saving |
| **User Management List** 🔒 *(production add-on)* | **Admin only** | Name, Login ID, Email, Role, Status (Active/Inactive) | • **Admin** clicks **New User** → **Create User Page**<br>• **Admin** clicks a row → opens that user's detail (edit role, deactivate, force password reset)<br>• Accessed via: Dashboard header → **Users** menu (Admin only) |
| **My Profile / Account Settings** *(production add-on)* | Admin & Accountant | Name, Email, Change Password | • Accessed via: avatar dropdown → **My Profile**<br>• **User** clicks **Save** → **System** updates record, returns to previous screen |

---

### 3.2 App Dashboard

**Used by:** Admin & Accountant only (Contact Users never see this screen — they land on Portal Home instead, see §4).

| Element | Actor | Behavior |
|---|---|---|
| Top menu bar | Admin & Accountant | **Sales**, **Purchase**, **Account**, **Report** — each expands a flyout panel of module links on hover/click |
| Sales flyout | Admin & Accountant | Sales Order, Sale Invoice, Receipt |
| Purchase flyout | Admin & Accountant | Purchase Order, Purchase Bill, Payment |
| Account flyout | Admin & Accountant | Contact, Product, Analyticals, Analytical Budget, Chart of Accounts, Journals, Journal Entries |
| Report flyout | Admin & Accountant | Balance Sheet, Profit and Loss, Budget Report |
| Sales widget | Admin & Accountant | Shows **All / Confirmed / Draft** counts; clicking a count opens **Sales Order List View** pre-filtered to that status; **New** button opens blank **Sales Order Form** |
| Purchase widget | Admin & Accountant | Same pattern as Sales widget, for **Purchase Order List View** |
| Budget Reports widget | Admin & Accountant | Shows **Achieved / Budget / Committed** counts; **Report** button opens **Budget Report List View** |
| Avatar (top-right) | Admin & Accountant | Dropdown → My Profile, Users (**Admin only**), Logout |
| Help Assistant button | Admin & Accountant | Floating chat button → opens the Help Assistant panel for product-usage questions (see §2). Does not read financial data. |

---

### 3.3 Master Data

#### 3.3.1 Contacts

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Contact → Contact List View`
`→ [New] → Contact Form (blank) → [Confirm] → Contact List View`
`→ [click row] → Contact Form (pre-filled)`
`→ [Kanban icon] → Contact Kanban View → [click card] → Contact Form`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Contact List View** | Admin & Accountant | Select, Image, Name, Email, Phone | • **User** clicks **New** → **Contact Form** (blank)<br>• **User** clicks a row → **Contact Form** (filled)<br>• **User** clicks Kanban icon → **Contact Kanban View**<br>• **User** types in **Search** → **System** filters list<br>• **User** clicks **Back** → App Dashboard |
| **Contact Kanban View** | Admin & Accountant | Card: Image, Name, Email, Phone | • **User** clicks a card → **Contact Form**<br>• **User** clicks List icon → **Contact List View**<br>• **User** clicks **New** → **Contact Form** (blank) |
| **Contact Form View** | Admin & Accountant | Contact Name, Type (Customer/Vendor/Both), Email (unique), Phone, Address (Street/City/State/Country/Pincode), Profile Image, **Invite to Portal** action *(production add-on)* | • **User** clicks **New** → clears form for another entry<br>• **User** clicks **Confirm** → **System** validates & saves → returns to **Contact List View**<br>• **User (Admin or Accountant)** clicks **Invite to Portal** → **System** provisions a Contact-role login and emails credentials/reset link to the contact — enables the contact's **Portal Home** access<br>• **User** clicks **Back** → **Contact List View** |

#### 3.3.2 Products

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Product → Product List View → [New] → Product Form → [Confirm] → Product List View`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Product List View** | Admin & Accountant | Select, Product, Category, Type, Sales Price, Cost | • **User** clicks **New** → **Product Form** (blank)<br>• **User** clicks a row → **Product Form** (filled)<br>• **User** clicks Kanban icon → **Product Kanban View**<br>• **User** clicks **Back** → App Dashboard |
| **Product Kanban View** | Admin & Accountant | Card: Image, Product Name, Sales Price, Cost | • **User** clicks a card → **Product Form**<br>• **User** clicks List icon → **Product List View** |
| **Product Form View** | Admin & Accountant | Product Name, Product Type (dropdown: Goods/Service/Combo), Category (many2one, creatable on the fly), Sales Price, Cost, Upload Image | • **User** clicks **New** → clears form<br>• **User** clicks **Confirm** → **System** saves → **Product List View**<br>• **User** clicks **Back** → **Product List View** |

#### 3.3.3 Chart of Accounts

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Chart of Accounts → CoA List View (pre-configured accounts) → [New] → CoA Form → [Confirm] → CoA List View`
`CoA List View → [Archived] → CoA Archived View`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Chart of Accounts List View** | Admin & Accountant | Account Name, Type — comes pre-loaded with default accounts (Bank, Cash, Debtors, Creditors, Sales Income, Purchase Expense, Other Expense, Capital) | • **User** clicks **New** → **Chart of Accounts Form**<br>• **User** clicks **Archived** → **CoA Archived View**<br>• **User** clicks a row → **CoA Form** (filled)<br>• **User** clicks **Home** → App Dashboard<br>• **User** clicks **Back** → previous screen |
| **Chart of Accounts Form View** | Admin & Accountant | Account Name, Type — dropdown grouped under two non-selectable headings: **Balance Sheet** (Asset, Liability, Bank, Capital, Cash) and **Profit and Loss** (Income, Expenses, Other Expenses) | • **User** clicks **Confirm** → **System** saves → **CoA List View**<br>• **User** clicks **Archive** → moves record to Archived list<br>• **User** clicks **Back** → **CoA List View** |
| **Chart of Accounts Archived View** | Admin & Accountant | Same columns, read + restore only | • **User** clicks **Restore** on a row → **System** returns account to active **CoA List View**<br>• **User** clicks **Back** → **CoA List View** |

#### 3.3.4 Journals

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Journals → Journal List View (Sales/Purchase/Bank/Cash pre-configured) → [New] → Journal Form → [Confirm] → Journal List View`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Journal List View** | Admin & Accountant | Journal Name, Type, Default Account | • **User** clicks **New** → **Journal Form**<br>• **User** clicks a row → **Journal Form** (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Journal Form View** | Admin & Accountant | Journal Name, Journal Type (dropdown: Sales/Purchase/Bank/Cash), Default Account (many2one → Chart of Accounts) | • **User** clicks **Confirm** → **System** saves → **Journal List View**<br>• **User** clicks **Back** → **Journal List View** |

#### 3.3.5 Analytic Accounts

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Analyticals → Analytic Account List View → [New] → Analytic Account Form → [Confirm] → List View`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Analytic Account List View** | Admin & Accountant | Name, Type | • **User** clicks **New** → **Analytic Account Form**<br>• **User** clicks a row → Form (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Analytic Account Form View** | Admin & Accountant | Analytic Account Name, Type (Income / Expenses) | • **User** clicks **Confirm** → **System** saves → **Analytic Account List View**<br>• **User** clicks **Back** → List View |

#### 3.3.6 Tax Rates *(production add-on — supports the Tax field on Sales lines)*

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Tax Rate List View** | Admin & Accountant | Tax Name, Rate (%), Applicable On (Sales/Purchase) | • **User** clicks **New** → **Tax Rate Form**<br>• **User** clicks a row → Form (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Tax Rate Form View** | Admin & Accountant | Tax Name, Rate (%), Applicable On | • **User** clicks **Confirm** → **System** saves → **Tax Rate List View** |

---

### 3.4 Sales Workflow

**Flow chain (full cycle):**
`[Admin/Accountant] Dashboard → Sales → Sales Order → Sales Order List View → [New] → Sales Order Form → [Confirm] → [Create Invoice] → Customer Invoice Form (fetched from SO) → [Confirm] → (System) Journal Entry #1 created → [Pay] → Invoice Payment Modal (manual) or Portal Payment Gateway (§4) → [Confirm/Webhook] → (System) Journal Entry #2 created, Invoice status updates to Paid/Partial`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Sales Order List View** | Admin & Accountant | SO No., Customer, Date, Status (All/Confirmed/Draft), Total | • **User** clicks **New** → **Sales Order Form** (blank)<br>• **User** clicks a row → **Sales Order Form** (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Sales Order Form View** | Admin & Accountant | SO No. (auto-sequence), Customer Name (many2one → Contact), SO Date, Lines: Product (many2one → Product), Budget Analytics (many2one → Analytic Account), Qty, Unit Price, Tax, Line Total (auto), Grand Total | • **User** clicks **Confirm** → status → Confirmed, order locked for editing<br>• **User** clicks **Create Invoice** → opens **Customer Invoice Form** pre-filled from this SO<br>• **User** clicks **Cancel** → status → Cancelled (confirmation modal first)<br>• **User** clicks **Back** → **Sales Order List View** |
| **Customer Invoice List View** | Admin & Accountant | Invoice No., Customer, Date, Status, Total | • **User** clicks **New** → **Customer Invoice Form** (blank, no SO link)<br>• **User** clicks a row → **Customer Invoice Form** (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Customer Invoice Form View** | Admin & Accountant | Invoice No. (auto), Invoice Reference, Customer Name, Invoice Date, Due Date, Status (Paid/Partial/Not Paid — computed), Lines: Product, Chart of Account (defaults to Sales Income), Budget Analytics, Qty, Unit Price, Total; Footer: Paid via Cash, Paid via Bank/Gateway, Amount Due | • **User** clicks **Confirm** → **System** validates debit=credit and auto-creates **Journal Entry #1** (Debit: Debtor, Credit: Sales Income — visible in Journal Entries List) → status locks; toast: "Invoice confirmed"<br>• **User** clicks **Pay** → opens **Invoice Payment Modal** (manual recording — a Customer paying via the Portal instead uses the Payment Gateway flow in §4)<br>• **User** clicks **SO** button (visible only if created from an SO) → opens the source **Sales Order Form**<br>• **User** clicks **Budget** button → opens **Budget Report** filtered to this invoice's analytic line<br>• **User** clicks **Cancel** → status → Cancelled<br>• **User** clicks **Back** → **Customer Invoice List View** |
| **Invoice Payment Modal** *(manual — Admin/Accountant only)* | Admin & Accountant | Payment Type = Receive (fixed), Partner (auto-filled), Amount (auto-filled from Amount Due, editable for partial payment), Payment Via (Bank default / Cash), Date (defaults today), Note | • **User** clicks **Confirm** → **System** records the payment, auto-creates **Journal Entry #2** (Debit: Cash/Bank, Credit: Debtor), updates Invoice's Paid/Partial/Not Paid status and Amount Due; a receipt record appears in **Receipt List View**; modal closes, toast: "Payment recorded"<br>• **User** clicks gear icon → **Print** or **Send by Email** options<br>• **User** clicks **Cancel** → closes modal, no changes |
| **Receipt List View** *(Sales-side payment ledger)* | Admin & Accountant | Date, Customer, Invoice Ref., Amount, Payment Via (Cash/Bank/Gateway), Gateway Reference *(if applicable)* | • **User** clicks a row → opens read view of that payment (linked Invoice Payment record, including the Payment Gateway transaction reference for reconciliation if it was a Portal payment)<br>• **User** clicks **Back** → App Dashboard |

---

### 3.5 Purchase Workflow

**Flow chain (full cycle):**
`[Admin/Accountant] Dashboard → Purchase → Purchase Order → PO List View → [New] → PO Form → [Confirm] → [Create Bill] → Vendor Bill Form (fetched from PO) → [Confirm] → (System) Journal Entry #1 created → [Pay] → Bill Payment Modal → [Confirm] → (System) Journal Entry #2 created, Bill status updates`

This entire cycle is Admin/Accountant only — vendor payments are always manual and internal; there is no Portal or gateway path here (LedgerOne pays the vendor, the vendor never pays LedgerOne).

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Purchase Order List View** | Admin & Accountant | PO No., Vendor, Date, Status (All/Confirmed/Draft), Total | • **User** clicks **New** → **Purchase Order Form** (blank)<br>• **User** clicks a row → **Purchase Order Form** (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Purchase Order Form View** | Admin & Accountant | PO No. (auto-sequence), Vendor Name (many2one → Contact), PO Date, Lines: Product, Budget Analytics, Qty, Unit Price, Line Total (Qty × Price), Grand Total | • **User** clicks **Confirm** → status → Confirmed; if line amount exceeds remaining budget for that analytic, **System** shows a **non-blocking warning** ("Exceeds Approved Budget") — **User** may proceed or revise the budget first<br>• **User** clicks **Create Bill** → opens **Vendor Bill Form** pre-filled from this PO<br>• **User** clicks **Cancel** → status → Cancelled<br>• **User** clicks **Back** → **Purchase Order List View** |
| **Vendor Bill List View** | Admin & Accountant | Bill No., Vendor, Date, Status, Total | • **User** clicks **New** → **Vendor Bill Form** (blank, no PO link)<br>• **User** clicks a row → **Vendor Bill Form** (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Vendor Bill Form View** | Admin & Accountant | Bill No. (auto), Bill Reference (free text), Vendor Name, Bill Date, Due Date, Status (Paid/Partial/Not Paid — computed), Lines: Product, Chart of Account (defaults to Purchase Expense), Budget Analytics, Qty, Unit Price, Total; Footer: Paid via Cash, Paid via Bank, Amount Due | • **User** clicks **Confirm** → **System** validates debit=credit and auto-creates **Journal Entry #1** (Debit: Purchase Expense, Credit: Creditor) → status locks; toast: "Bill confirmed"<br>• **User** clicks **Pay** → opens **Bill Payment Modal**<br>• **User** clicks **PO** button (visible only if created from a PO) → opens source **Purchase Order Form**<br>• **User** clicks **Budget** button → opens **Budget Report** filtered to this bill's analytic line<br>• **User** clicks **Cancel** → status → Cancelled<br>• **User** clicks **Back** → **Vendor Bill List View** |
| **Bill Payment Modal** | Admin & Accountant | Payment Type = Send (fixed), Partner (auto-filled), Amount (auto-filled from Amount Due, editable), Payment Via (Bank default / Cash), Date (defaults today), Note | • **User** clicks **Confirm** → **System** records the payment, auto-creates **Journal Entry #2** (Debit: Creditor, Credit: Cash/Bank), updates Bill's Paid/Partial/Not Paid status and Amount Due; a payment record appears in **Payment List View**; returns to **Vendor Bill Form**; toast: "Payment recorded"<br>• **User** clicks gear icon → **Print** or **Send by Email**<br>• **User** clicks **Cancel** → closes modal, no changes |
| **Payment List View** *(Purchase-side payment ledger)* | Admin & Accountant | Date, Vendor, Bill Ref., Amount, Payment Via | • **User** clicks a row → opens read view of that payment<br>• **User** clicks **Back** → App Dashboard |

---

### 3.6 Accounting — Journal Entries

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Journal Entries → Journal Entries List View → [New] → Journal Entry Form → [Post] → List View`
`(System) Two automatic entries land here per fully paid document: one at Bill/Invoice confirmation, and a second when its payment is recorded (manual or Payment Gateway)`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Journal Entries List View** | Admin & Accountant (view/manage); **System** (auto-populates entries from confirmed Bills/Invoices) | Date, Number, Partner, Journal, Total, Status (Draft/Posted) | • **User** clicks **New** → **Journal Entry Form** (blank, for manual entries — e.g., adjustments, opening balances)<br>• **User** clicks a row → **Journal Entry Form** (filled, read-mostly if system-generated)<br>• **User** clicks **Back** → App Dashboard |
| **Journal Entry Form View** | Admin & Accountant | Accounting Date, Journal (many2one → Journal master), Lines: Account (many2one → Chart of Accounts), Partner (many2one → Contact), Debit, Credit | • **User** clicks **Post** → **System** validates **Debit total = Credit total** (blocking error if mismatched) → status → Posted → returns to **Journal Entries List View**<br>• **User** clicks **Reset to Draft** (on system-generated entries linked to a Bill, e.g.) → reopens for edit<br>• **User** clicks **Cancel** → discards / voids the entry<br>• **User** clicks **Back** → **Journal Entries List View** |

---

### 3.7 Budgeting

**Flow chain:**
`[Admin/Accountant] Dashboard → Account → Analytical Budget → Budget List View → [New] → Budget Form (Draft) → [Confirm] → Budget Form (Confirmed, achievement fields populate) → [Revise] → new Budget Form (Revised), old one relabeled "Revised", linked back via "Revision Of"`
`[Admin/Accountant] Dashboard → Report → Budget Report → Budget Report List/Kanban View → [click row/card] → Budget Form`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Analytical Budget List View** *(production add-on)* | Admin & Accountant | Budget Name, Period, Status (Draft/Confirm/Revised/Cancelled) | • **User** clicks **New** → **Budget Form** (blank)<br>• **User** clicks a row → **Budget Form** (filled)<br>• **User** clicks **Back** → App Dashboard |
| **Budget Form View — Original** | Admin & Accountant (manual actions); **System** (computes Achieved Amount/%, Amount to Achieve) | Budget Name (alphanumeric), Budget Period (Start–End Date), Responsible (many2one → Contact), Lines: Analytic, Type (Income/Expenses), Committed Amount, Achieved Amount *(read-only, visible only once Confirmed)*, Achieved %, Amount to Achieve; Stage indicator: Draft → Confirm → Revised → Cancelled | • **User** clicks **New** → clears form for a fresh budget (Draft stage)<br>• **User** clicks **Confirm** → moves to Confirm stage; **System** auto-computes Achieved Amount/% and Amount to Achieve by matching Sales Invoice (Income) / Vendor Bill (Expense) lines sharing the same Analytic within the budget period<br>• **User** clicks the **Achieved Amount** value → opens a filtered list of all Invoices/Bills contributing to that figure<br>• **User** clicks **Revise** *(only enabled once Confirmed)* → **System** creates a new **Budget Form (Revised)** pre-filled with adjustable committed amounts; original budget is retained and re-labeled, linked via "Revised With"<br>• **User** clicks **Cancel** → archives the budget (Cancelled stage)<br>• **User** clicks **Back** → **Analytical Budget List View** |
| **Budget Form View — Revised** | Admin & Accountant | Same fields as Original, plus **Revision Of** (clickable link back to the original Budget Form) in place of "Revised With" | • Same action set as Original Form (New/Confirm/Revise/Cancel), performed by **Admin & Accountant**<br>• **User** clicks **Revision Of** link → opens the original **Budget Form** |
| **Budget Report List View** | Admin & Accountant | Budget, Start Date, End Date, Status, Pie Chart icon (Achieved vs. Balance) | • **User** clicks a row → opens that budget's **Budget Form View**<br>• **User** clicks Kanban icon → **Budget Report Kanban View**<br>• **User** clicks **New** → **Budget Form** (blank)<br>• **User** clicks **Back** → App Dashboard |
| **Budget Report Kanban View** | Admin & Accountant | Card: Budget Name, Start Date, End Date | • **User** clicks a card → **Budget Form View**<br>• **User** clicks List icon → **Budget Report List View** |

---

### 3.8 Financial Reports

**Flow chain:**
`[Admin/Accountant] Dashboard → Report → Balance Sheet / Profit and Loss / Budget Report`

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Profit & Loss Report** | Admin & Accountant (view); **System** (computes figures) | Year selector; Income (Income from Sales), Expenses (Purchase Expense, Other Expense), Net Income (Income − Expenses) | • **User** changes **Year** dropdown → **System** recalculates figures in place<br>• **User** clicks **Print** → **System** generates a PDF download<br>• **User** clicks **Back** → App Dashboard |
| **Balance Sheet** | Admin & Accountant (view); **System** (computes figures) | Year selector; Assets (Bank, Cash, Debtors) vs. Liabilities (Capital, Creditors); Total Asset / Total Liability | • **User** changes **Year** dropdown → **System** recalculates in place<br>• **User** clicks **Print** → PDF download<br>• **User** clicks **Back** → App Dashboard |
| **Budget Report** | Admin & Accountant | (See §3.7 — same List/Kanban/Form screens, reached here from the Report menu) | • **User** clicks a row/card → **Budget Form View** |

---

### 3.9 Company Settings 🔒 *(production add-on)*

| Screen | Actor | Key Fields | Actions → Navigation |
|---|---|---|---|
| **Company Settings Page** | **Admin only** | Company Name, Logo, Address, Base Currency, Fiscal Year Start Month, Document Numbering Prefixes (PO/SO/Bill/Invoice) | • **Admin** clicks **Save** → applies settings globally (e.g., new auto-numbers, report headers)<br>• Accessed via: avatar dropdown → **Settings** (Admin only)<br>• **Admin** clicks **Back** → App Dashboard |

---

## 4. Screen-by-Screen Navigation — Contact Portal

**Used by:** Contact User only. Contact Users authenticate through the same **Login Page** (§3.1) using credentials provisioned via the **Invite to Portal** action performed earlier by an **Admin or Accountant** on their Contact record. Upon successful login, **System** detects the Contact role and routes them to **Portal Home** instead of the App Dashboard. The tabs a Contact sees depend on their Contact **Type** (set by Admin/Accountant on the Contact record): Customer → My Invoices tab; Vendor → My Bills tab; Both → both tabs appear.

**Payment scoping (important):** Only **Sales Invoices** can be paid from the Portal, and only by a **Customer**, via the integrated Payment Gateway. **Vendor Bills are always view-only** in the Portal — LedgerOne pays its vendors, so a Vendor's "My Bills" screen has no Pay action at all, just status tracking.

**Flow chain:**
`[Contact User] Login Page → Portal Home → My Invoices → Invoice Detail → [Pay Now] → Payment Gateway Checkout → "Payment Processing" → (Payment Gateway webhook, System) → Invoice Detail shows Paid + toast → Payment History`
`[Contact User] Login Page → Portal Home → My Bills → Bill Detail (read-only, no Pay action)`

| Screen | Actor | Key Fields / Content | Actions → Navigation |
|---|---|---|---|
| **Portal Home** | Contact User | Summary tiles: Total Outstanding, Recently Paid, Overdue count | • **Contact User** clicks **My Invoices** tile/tab → **My Invoices List** (Customers only)<br>• **Contact User** clicks **My Bills** tile/tab → **My Bills List** (Vendors only)<br>• **Contact User** opens avatar dropdown → **My Profile**, **Payment History**, **Logout**<br>• **Contact User** clicks the **Help Assistant** button → opens the chat panel (product guidance only) |
| **My Invoices List** | Contact User (Customer) | Invoice No., Date, Due Date, Amount, Status (Paid/Partial/Not Paid) with filter chips | • **Contact User** clicks a row → **Invoice Detail**<br>• **Contact User** clicks **Back** → **Portal Home** |
| **My Bills List** | Contact User (Vendor) | Bill No., Date, Due Date, Amount, Status (Paid/Partial/Not Paid) with filter chips | • **Contact User** clicks a row → **Bill Detail** (read-only)<br>• **Contact User** clicks **Back** → **Portal Home** |
| **Invoice Detail** (read + pay) | Contact User (Customer) | Invoice No., Date, Due Date, Line items (Product, Qty, Price, Total), Amount Due, Status | • **Contact User** clicks **Pay Now** (enabled only if Amount Due > 0) → **System** creates a Payment Gateway order → opens **Payment Gateway Checkout**<br>• **Contact User** clicks **Download PDF** → downloads the invoice<br>• **Contact User** clicks **Back** → **My Invoices List** |
| **Bill Detail** (read-only) | Contact User (Vendor) | Bill No., Date, Due Date, Line items, Amount Due, Status | • **No Pay action is shown** — this screen only reports whether LedgerOne has paid the vendor<br>• **Contact User** clicks **Download PDF** → downloads the bill<br>• **Contact User** clicks **Back** → **My Bills List** |
| **Payment Gateway Checkout** *(hosted by the gateway, e.g. Razorpay)* | Contact User (Customer) | Card / UPI / Netbanking entry, exact Amount Due (or a valid partial amount) | • **Contact User** completes payment on the gateway's hosted screen → redirected back to **Invoice Detail**, which shows **"Payment Processing"** — not yet "Paid" — until confirmation arrives<br>• **Contact User** abandons/fails checkout → redirected back to **Invoice Detail** unchanged, toast: "Payment not completed" |
| **(System) Payment Gateway Webhook** | System | Signed server-to-server notification from the gateway | • **System** verifies the signature, checks for a duplicate transaction ID, then confirms the payment: records the payment, creates Journal Entry #2, updates Invoice status/Amount Due → **Invoice Detail** now shows **Paid/Partial** with a toast (visible next time the Contact views or refreshes the page); a confirmation email is sent<br>• On failure, the transaction is marked Failed and the Invoice is left exactly as it was |
| **Payment History List** *(production add-on)* | Contact User | Date, Document Ref., Amount Paid, Method, Gateway Reference *(for gateway payments)*, Status | • **Contact User** clicks a row → re-opens the related **Invoice Detail**<br>• **Contact User** clicks **Back** → **Portal Home** |
| **My Profile** *(production add-on)* | Contact User | Name, Email, Phone, Change Password | • **Contact User** clicks **Save** → **System** updates record, returns to **Portal Home** |

---

## 5. Page Inventory by Role

### Administrator — full page list
| # | Page | Actor |
|---|---|---|
| 1 | Login Page | Admin |
| 2 | Forgot Password Page | Admin |
| 3 | Reset Password Page | Admin |
| 4 | Create User Page 🔒 | Admin only |
| 5 | User Management List 🔒 | Admin only |
| 6 | My Profile | Admin |
| 7 | App Dashboard | Admin |
| 8 | Contact List View | Admin |
| 9 | Contact Kanban View | Admin |
| 10 | Contact Form View | Admin |
| 11 | Product List View | Admin |
| 12 | Product Kanban View | Admin |
| 13 | Product Form View | Admin |
| 14 | Chart of Accounts List View | Admin |
| 15 | Chart of Accounts Archived View | Admin |
| 16 | Chart of Accounts Form View | Admin |
| 17 | Journal List View | Admin |
| 18 | Journal Form View | Admin |
| 19 | Analytic Account List View | Admin |
| 20 | Analytic Account Form View | Admin |
| 21 | Tax Rate List View | Admin |
| 22 | Tax Rate Form View | Admin |
| 23 | Sales Order List View | Admin |
| 24 | Sales Order Form View | Admin |
| 25 | Customer Invoice List View | Admin |
| 26 | Customer Invoice Form View | Admin |
| 27 | Invoice Payment Modal | Admin |
| 28 | Receipt List View | Admin |
| 29 | Purchase Order List View | Admin |
| 30 | Purchase Order Form View | Admin |
| 31 | Vendor Bill List View | Admin |
| 32 | Vendor Bill Form View | Admin |
| 33 | Bill Payment Modal | Admin |
| 34 | Payment List View | Admin |
| 35 | Journal Entries List View | Admin |
| 36 | Journal Entry Form View | Admin |
| 37 | Analytical Budget List View | Admin |
| 38 | Budget Form View (Original) | Admin |
| 39 | Budget Form View (Revised) | Admin |
| 40 | Budget Report List View | Admin |
| 41 | Budget Report Kanban View | Admin |
| 42 | Profit & Loss Report | Admin |
| 43 | Balance Sheet Report | Admin |
| 44 | Company Settings Page 🔒 | Admin only |

*The Help Assistant is a persistent floating widget on the App Dashboard, not a separate numbered page (see §2, §3.2).*

### Accountant (Invoicing User) — full page list
Same as Administrator **except**: no access to *Create User Page*, *User Management List*, or *Company Settings Page* (rows 4, 5, 44 above do not apply). All other 41 pages are identical, plus the **Sign Up Page** (used to self-register as an Accountant — Admin never needs this page since Admin accounts are only created via Create User).

| # | Page | Actor |
|---|---|---|
| 1 | Login Page | Accountant |
| 2 | Sign Up Page | Accountant (as Guest, before account exists) |
| 3 | Forgot Password Page | Accountant |
| 4 | Reset Password Page | Accountant |
| 5 | My Profile | Accountant |
| 6 | App Dashboard | Accountant |
| 7–41 | *(All Master Data, Sales, Purchase, Accounting, Budgeting, and Report screens listed in §3.3–3.8)* | Accountant |

### Contact User — full page list
| # | Page | Actor |
|---|---|---|
| 1 | Login Page | Contact User |
| 2 | Forgot Password Page | Contact User |
| 3 | Reset Password Page | Contact User |
| 4 | Portal Home | Contact User |
| 5 | My Invoices List *(if Customer)* | Contact User |
| 6 | My Bills List *(if Vendor)* | Contact User |
| 7 | Invoice Detail — read + Pay Now *(Customer only)* | Contact User |
| 8 | Bill Detail — read-only, no payment action *(Vendor only)* | Contact User |
| 9 | Payment Gateway Checkout *(hosted by the gateway)* | Contact User |
| 10 | Payment History List | Contact User |
| 11 | My Profile | Contact User |

*The Help Assistant is a persistent floating widget on Portal Home, not a separate numbered page (see §2, §4).*

---

## 6. Appendix — Business Rules & Validation Reference

**Account creation** *(enforced by System, triggered by Guest on Sign Up or Admin on Create User)*:
- Login ID: unique, 6–12 characters
- Email: must not already exist in the system
- Password: unique, must contain uppercase + lowercase + special character, minimum 8 characters
- Failed login → *"Invalid Login Id or Password"*

**Chart of Accounts** *(set up by Admin/Accountant)*: Account Types are grouped under two report headings — headings themselves are not selectable, only the leaf types:
- Balance Sheet → Asset, Liability, Bank, Capital, Cash
- Profit and Loss → Income, Expenses, Other Expenses

**Journal Entries** *(validated by System on Post, action taken by Admin/Accountant)*: Total Debit must equal Total Credit before a Post is allowed (blocking validation).

**Purchase Order** *(action by Admin/Accountant, warning shown by System)*: Confirming a PO whose line amount exceeds the remaining approved budget for its Analytic Account shows a non-blocking warning; the user can still proceed or revise the budget.

**Vendor Bill / Customer Invoice** *(action by Admin/Accountant; computation by System)*:
- Status (Paid / Partial / Not Paid) is a computed field: `Amount Due = Total − (Paid via Cash + Paid via Bank/Gateway)`.
- Confirming either document auto-creates **Journal Entry #1**, a balanced entry using the default account (Purchase Expense for Bills, Sales Income for Invoices).
- Recording a payment against either — manually or via the Payment Gateway — auto-creates a **second, separate** balanced Journal Entry (Debit: Cash/Bank, Credit: Debtor for an Invoice; Debit: Creditor, Credit: Cash/Bank for a Bill). This is the entry that actually moves the Cash/Bank balance shown on the Balance Sheet — without it, that balance would never change.

**Payment Gateway** *(Contact-initiated; verified by System)*:
- Only Sales Invoices can be paid this way — Vendor Bills never have a Pay action in the Portal.
- A payment is marked Paid only after the gateway's webhook signature is verified server-side. A client-side redirect back to the app is shown as "Payment Processing," never as confirmation on its own.
- Duplicate webhook deliveries for the same gateway transaction are ignored (idempotency check) so a payment is never recorded twice.

**Budget lifecycle** *(actions by Admin/Accountant; computation by System)*: Draft → Confirm → (optionally) Revised → Cancelled.
- **Confirm:** locks the committed amounts and reveals Achieved Amount/%.
- **Revise** (only available once Confirmed): opens a new Budget record; the original is retained and cross-linked ("Revised With" / "Revision Of"); naming convention appends "Revised" to the original Budget Name.
- **Achieved Amount** = sum of all Sales Invoice lines (Type = Income) or Vendor Bill lines (Type = Expenses) sharing the same Analytic Account within the budget period.
- **Achieved %** = (Achieved Amount ÷ Committed Amount) × 100.
- **Amount to Achieve** = Committed Amount − Achieved Amount.

**Reports (computed, read-only)** *(viewed by Admin/Accountant; computed by System)*:
- Profit & Loss: Income = total of accounts typed Income; Expenses = total of accounts typed Expense + Other Expense; Net Income = Income − Expenses.
- Balance Sheet: Assets = accounts typed Asset (Bank, Cash, Debtors); Liabilities = accounts typed Liability + Capital (Creditors, Capital).

**Payments** *(action by Admin/Accountant for Bills/Invoices, or by Contact User via the Payment Gateway for Invoices only)*: A payment always references its source document, updates that document's Amount Due and status, is recorded in the corresponding Payment/Receipt ledger, and generates Journal Entry #2 (see above).

**Feedback & Messaging** *(System-enforced UI convention, see §2)*: every action ends in exactly one of — a toast (success), an inline message (field-level validation), or a modal (blocking/critical error). No action is ever silent.

**Help Assistant** *(System, read-only)*: answers product-usage questions from a fixed FAQ knowledge base only. It cannot read, compute, or display any financial data, and redirects account-specific questions ("how much do I owe") to the relevant screen instead of guessing.
