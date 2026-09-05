# Screens — UI Specification
## Urban Furniture Accounting System

**Version:** 1.0 · **Related:** `prd.md`, `architecture.md`, `Urban_Furniture_Accounting_System_Workflow.md`

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
| Confirmation Toast | Action-matched text ("Invoice confirmed") |

## 6. Screen Templates

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

## 7. Screen Inventory

| Screen | Template | Notes |
|---|---|---|
| Login Page | A | Inline error on invalid credentials |
| Sign Up Page | A | Creates Accountant role only |
| Forgot Password Page | A | Single email field |
| Reset Password Page | A | New password + confirm |
| Create User Page | A | Admin only |
| User Management List | C | Admin only |
| My Profile (Admin/Accountant) | E | Single-section form |
| App Dashboard | B | Sales/Purchase/Budget widgets |
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
| Customer Invoice Form View | E | Links to source SO and Budget |
| Invoice Payment Modal | F | Amount editable for partial payment |
| Receipt List View | C | Read-only ledger |
| Purchase Order List View | C | Status filter chips |
| Purchase Order Form View | E | Budget-exceeded warning uses `warning` token |
| Vendor Bill List View | C | Status filter chips |
| Vendor Bill Form View | E | Links to source PO and Budget |
| Bill Payment Modal | F | Amount editable for partial payment |
| Payment List View | C | Read-only ledger |
| Journal Entries List View | C | Manual + system-generated rows |
| Journal Entry Form View | E | Debit/Credit must balance before Post |
| Analytical Budget List View | C | — |
| Budget Form View (Original) | E | Stage: Draft → Confirm → Revised → Cancelled |
| Budget Form View (Revised) | E | Shows "Revision Of" link |
| Budget Report List View | C | Pie-chart indicator per row |
| Budget Report Kanban View | D | — |
| Profit & Loss Report | G | Year selector + Print |
| Balance Sheet Report | G | Year selector + Print |
| Company Settings Page | E | Admin only |
| Portal Home | H | Tabs conditional on Contact Type |
| My Invoices List | H | Filter chips by status |
| My Bills List | H | Filter chips by status |
| Document Detail (Portal) | H | Read-only line items + Pay Now |
| Make Payment Modal (Portal) | F/H | Full-width on mobile |
| Payment History List (Portal) | H | — |
| My Profile (Portal) | H | — |

## 8. Responsive

- Workspace: desktop/tablet-first (≥768px); wide tables scroll horizontally
- Portal: mobile-first, single column, large tap targets

## 9. Accessibility

- WCAG AA contrast regardless of chosen accent
- Status never color-only
- Icon-only controls have accessible names
- Visible keyboard focus on all interactive elements
- Reduced-motion respected; motion functional only

## 10. Avoid

- Hardcoded hex/RGB colors
- Decorative gradients, heavy shadows, non-functional icons
- ALL-CAPS labels, arrow-suffixed buttons
- Dark mode assumption — light is baseline
