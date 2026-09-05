# Screens — UI Specification
## LedgerOne Accounting System

**Version:** 1.1 · **Related:** `PRD.md`, `architecture.md`, `WORKFLOW.md`, `USECASE.md`, `TECH_STACK.md`

No fixed colors (hex/RGB) defined anywhere — semantic tokens only. Default: light theme, clean, minimal, one accent color.

---

## 1. Design Principles

- Light theme, one accent color, used sparingly (primary actions only)
- No fixed colors — tokens resolved centrally, never hardcoded per screen
- Status always paired with a text label, never color alone
- Button labels match the resulting state: Confirm → Confirmed, Post → Posted, Pay → Paid, Archive → Archived
- No ALL-CAPS labels, no arrow-suffixed buttons, no decorative gradients/shadows/icons

## 2. Theme Tokens

| Token | Used For |
|---|---|
| `background` | Page background |
| `surface` | Cards, table rows, modals, kanban cards |
| `border` | Dividers, input borders, row separators |
| `foreground` | Primary text |
| `muted-foreground` | Secondary text, placeholders, helper text |
| `primary` | Primary buttons, active nav item, links |
| `destructive` | Cancel/Delete actions, error text |
| `success` | Paid / Confirmed / Posted badges |
| `warning` | Partial status, non-blocking warnings |
| `info` | Neutral notices |

## 3. Typography

- One sans-serif family (system-ui / Inter)
- Sentence case only
- Scale: Page Title → Section Header → Body/Table → Caption
- Numbers right-aligned, tabular figures

## 4. Layout & Spacing

- Consistent spacing scale (4/8/16/24/32px)
- Forms: max content width, never edge-to-edge
- Workspace shell: top nav (Sales / Purchase / Account / Report) + content area
- Portal shell: simplified top bar, single column, mobile-first

## 5. Core Components

| Component | Behavior |
|---|---|
| Primary Button | Filled, `primary` token, one per screen |
| Secondary Button | Outline/ghost, `border` + `foreground` |
| Destructive Action | Outline/text, `destructive`, always behind confirmation |
| Status Badge | Pill, semantic token + text label |
| Table (List View) | Sticky header, `border` row dividers, subtle `surface` hover |
| Form Field | Label above input, helper in `muted-foreground`, error in `destructive` |
| Modal | Centered on `surface`, one primary + one secondary action, explicit close |
| Kanban Card | `surface` + `border`, image + 2–3 lines, click opens record |
| Empty State | Short line + one primary action |
| Loading State | Skeleton matching real layout, not a spinner |

## 6. Notifications & Messaging

Every user action resolves into exactly one of these three — never a silent success, never a raw technical error:

| Type | Used For | Behavior |
|---|---|---|
| **Toast** | Confirmation of a completed action | Brief, action-matched text ("Invoice confirmed," "Payment recorded," "Budget revised"), `success` token accent, auto-dismisses after a few seconds, non-blocking |
| **Inline message** | Form field validation | Appears directly below the offending field the moment it's detected (e.g., duplicate email, unbalanced entry); `destructive` token; never only in a toast or a separate summary |
| **Modal alert** | Blocking/critical errors | Interrupts and requires acknowledgment — unbalanced Journal Entry, failed Payment Gateway charge, permission error; never dismissible by accident |

**Special case — Payment Processing:** a gateway payment is neither a success nor a failure the instant Checkout closes (§7, template F). This state gets its own persistent inline banner ("Payment Processing — we'll update this once confirmed"), not a toast, since it can outlive the current page view.

## 7. Persistent Widgets

| Widget | Appears On | Behavior |
|---|---|---|
| **Help Assistant** | App Dashboard (Admin/Accountant), Portal Home (Contact) | Floating button, bottom-right, opens a chat panel over the current screen. FAQ-only — answers product-usage questions from a fixed knowledge base and never displays financial data. Styled with the same tokens as the rest of the app (no separate visual identity). |

## 8. Screen Templates

| Template | Structure | Used For |
|---|---|---|
| A — Auth | Centered card, plain background | Login, Sign Up, Forgot/Reset Password, Create User |
| B — Dashboard | Top nav + widget grid | App Dashboard |
| C — List View | Top bar (New/Search/Back/toggle) + table + pagination | All master-data and transaction lists |
| D — Kanban View | Same top bar + card grid | Contact, Product, Budget Report |
| E — Form View | Top bar (contextual actions) + sectioned form + line-item table | All master-data and transaction detail screens |
| F — Modal | Overlay, one primary + one secondary action | Payments, Invite to Portal, confirmations |
| G — Report | Period selector + Print + data table | Balance Sheet, P&L, Budget Report drill-ins |
| H — Portal | Mobile-first single column | All Contact Portal screens |

**Note on Payment Gateway Checkout:** the hosted checkout screen (Razorpay) is rendered by the provider, not built from these templates or tokens — we pass our accent color to it where the provider's theming API allows, but otherwise it is outside our design system by necessity.

## 9. Screen Inventory

| Screen | Template | Notes |
|---|---|---|
| Login Page | A | Inline error on invalid credentials |
| Sign Up Page | A | Creates Accountant role only |
| Forgot Password Page | A | Single email field |
| Reset Password Page | A | New password + confirm |
| Create User Page | A | Admin only |
| User Management List | C | Admin only |
| My Profile (Admin/Accountant) | E | Single-section form |
| App Dashboard | B | Sales/Purchase/Budget widgets + Help Assistant button |
| Contact List View | C | List/Kanban toggle |
| Contact Kanban View | D | Image + name/email/phone |
| Contact Form View | E | Includes "Invite to Portal" |
| Product List View | C | List/Kanban toggle |
| Product Kanban View | D | Image + price/cost |
| Product Form View | E | Category creatable on the fly |
| Chart of Accounts List View | C | Pre-seeded rows |
| Chart of Accounts Archived View | C | Restore per row |
| Chart of Accounts Form View | E | Type grouped under two headings |
| Journal List View | C | Pre-seeded rows |
| Journal Form View | E | Default Account is a lookup |
| Analytic Account List View | C | — |
| Analytic Account Form View | E | — |
| Tax Rate List View | C | — |
| Tax Rate Form View | E | — |
| Sales Order List View | C | Status filter chips |
| Sales Order Form View | E | Line items with computed totals |
| Customer Invoice List View | C | Status filter chips |
| Customer Invoice Form View | E | Links to source SO and Budget; two Journal Entries over its lifecycle (confirm + payment) |
| Invoice Payment Modal | F | Manual entry only (Admin/Accountant); amount editable for partial payment |
| Receipt List View | C | Read-only ledger; shows gateway reference when applicable |
| Purchase Order List View | C | Status filter chips |
| Purchase Order Form View | E | Budget-exceeded warning uses `warning` token |
| Vendor Bill List View | C | Status filter chips |
| Vendor Bill Form View | E | Links to source PO and Budget; two Journal Entries over its lifecycle (confirm + payment) |
| Bill Payment Modal | F | Always manual — no Vendor-facing equivalent exists |
| Payment List View | C | Read-only ledger |
| Journal Entries List View | C | Manual + system-generated rows (two per fully paid document) |
| Journal Entry Form View | E | Debit/Credit must balance before Post |
| Analytical Budget List View | C | — |
| Budget Form View (Original) | E | Stage: Draft → Confirm → Revised → Cancelled |
| Budget Form View (Revised) | E | Shows "Revision Of" link |
| Budget Report List View | C | Pie-chart indicator per row |
| Budget Report Kanban View | D | — |
| Profit & Loss Report | G | Year selector + Print |
| Balance Sheet Report | G | Year selector + Print |
| Company Settings Page | E | Admin only; never includes Payment Gateway or Help Assistant API keys (env secrets only) |
| Portal Home | H | Tabs conditional on Contact Type + Help Assistant button |
| My Invoices List | H | Filter chips by status; Customer only |
| My Bills List | H | Filter chips by status; Vendor only, no payment affordance anywhere on this path |
| Invoice Detail (Portal) | H | Read-only line items + **Pay Now** (Customer only) |
| Bill Detail (Portal) | H | Read-only line items — **no Pay action** (Vendor only) |
| Payment Gateway Checkout (Portal) | — *(provider-hosted, see note above)* | Opens on Pay Now; returns to Invoice Detail in a "Payment Processing" state |
| Payment History List (Portal) | H | Shows gateway reference for online payments |
| My Profile (Portal) | H | — |

## 10. Responsive

- Workspace: desktop/tablet-first (≥768px); wide tables scroll horizontally
- Portal: mobile-first, single column, large tap targets

## 11. Accessibility

- WCAG AA contrast regardless of chosen accent
- Status never color-only
- Icon-only controls have accessible names
- Visible keyboard focus on all interactive elements
- Reduced-motion respected; motion functional only
- Toasts are announced to screen readers (ARIA live region), not just visually shown

## 12. Avoid

- Hardcoded hex/RGB colors
- Decorative gradients, heavy shadows, non-functional icons
- ALL-CAPS labels, arrow-suffixed buttons
- Dark mode assumption — light is baseline
- Marking a payment "Paid" anywhere in the UI before the gateway webhook actually confirms it
