# Frontend Developer Implementation Guide
## LedgerOne - Sequential Feature Development

**Your Role:** Implement all UI pages, components, forms, and user interactions.

**Branch Strategy:** `frontend/<feature-name>`

**Rules:**
- ✅ Complete ONE task at a time
- ✅ Commit immediately after each task
- ✅ Follow commit conventions from CLAUDE.md
- ✅ Test UI in browser before committing
- ✅ Never move to next task until current is committed
- ✅ Use Server Components by default, Client Components only when needed

---

## 📚 Required Reading (Do This First)

Before starting ANY task, read these documents:

1. `/docs/PRD.md` - Product Requirements
2. `/docs/USECASE.md` - All 38 use cases
3. `/docs/WORKFLOW.md` - Screen flows and navigation
4. `/docs/SCREENS.md` - UI wireframes reference
5. `/CLAUDE.md` - Code standards and commit conventions
6. `.claude/skills/design-standards/SKILL.md` - UI design guidelines

---

## Phase 1: UI Foundation & Components (Tasks 1-8)

### Task 1: Install shadcn/ui Components
**Branch:** `frontend/shadcn-setup`

**What to Build:**
```bash
# Install shadcn/ui CLI and components
npx shadcn-ui@latest init

# Add base components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add checkbox
```

**Commit:**
```bash
git commit -m "chore(ui): install shadcn/ui components

- Initialize shadcn/ui configuration
- Add core UI components (button, card, input, table, dialog, etc.)
- Configure Tailwind with design tokens
- Add toast notifications

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Global Styles & Theme
**Branch:** `frontend/global-styles`

**What to Build:**
```typescript
// app/globals.css
- Custom CSS variables for theme
- Typography styles
- Responsive utilities
- Animation utilities

// components/providers/theme-provider.tsx
- Theme context provider
- Light/dark mode support
```

**Commit:**
```bash
git commit -m "style(ui): add global styles and theme configuration

- Define CSS custom properties for colors and spacing
- Add typography styles
- Configure theme provider with light/dark mode
- Add responsive design utilities

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Layout Components
**Branch:** `frontend/layout-components`

**What to Build:**
```typescript
// components/layout/
- header.tsx - Top navigation bar
- sidebar.tsx - Side navigation menu
- footer.tsx - Footer component
- page-header.tsx - Page title and breadcrumbs

// Features:
- Responsive design
- Mobile hamburger menu
- User profile dropdown
- Logout button
```

**Commit:**
```bash
git commit -m "feat(ui): add layout components

- Header with navigation and user menu
- Sidebar with menu items
- Footer component
- Page header with breadcrumbs
- Mobile responsive design

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Common UI Components
**Branch:** `frontend/common-components`

**What to Build:**
```typescript
// components/ui/
- data-table.tsx - Reusable table with sorting, filtering, pagination
- status-badge.tsx - Status indicators (Draft, Confirmed, Paid, etc.)
- currency-display.tsx - Formatted currency display
- date-display.tsx - Formatted date display
- loading-spinner.tsx - Loading indicator
- empty-state.tsx - Empty list state
- error-message.tsx - Error display component
```

**Commit:**
```bash
git commit -m "feat(ui): add common UI components

- Reusable data table with sorting and pagination
- Status badge component with color variants
- Currency and date display components
- Loading and error state components
- Empty state component for lists

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Form Components Library
**Branch:** `frontend/form-components`

**What to Build:**
```typescript
// components/forms/
- form-input.tsx - Text input with label and error
- form-select.tsx - Select dropdown with validation
- form-textarea.tsx - Textarea with label
- form-checkbox.tsx - Checkbox input
- form-date-picker.tsx - Date picker component
- form-currency-input.tsx - Currency input with formatting
- form-image-upload.tsx - Image upload component

// All components:
- Integrate with React Hook Form
- Display validation errors
- Proper accessibility
```

**Commit:**
```bash
git commit -m "feat(forms): add form component library

- Form input components with validation
- Currency input with decimal formatting
- Date picker component
- Image upload with preview
- All components integrate with React Hook Form
- Proper error display and accessibility

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Validation Schemas (Zod)
**Branch:** `frontend/validation-schemas`

**What to Build:**
```typescript
// lib/validation/
- auth.schema.ts - Login, signup, password reset schemas
- contact.schema.ts - Contact form validation
- product.schema.ts - Product form validation
- purchase.schema.ts - PO and bill schemas
- sales.schema.ts - SO and invoice schemas
- journal.schema.ts - Journal entry validation
- budget.schema.ts - Budget validation

// Each schema:
- Matches backend validation
- Proper error messages
- Reusable across forms
```

**Commit:**
```bash
git commit -m "feat(validation): add Zod validation schemas

- Auth schemas (login, signup, password reset)
- Master data schemas (contacts, products, accounts)
- Transaction schemas (purchase, sales, journal entries)
- Budget schemas
- Consistent error messages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: List/Kanban View Toggle Component
**Branch:** `frontend/view-toggle`

**What to Build:**
```typescript
// components/ui/
- view-toggle.tsx - Switch between List and Kanban views
- list-view.tsx - List layout wrapper
- kanban-view.tsx - Kanban card layout wrapper
- kanban-card.tsx - Reusable card for Kanban view
```

**Reference:** Contacts and Products support both views

**Commit:**
```bash
git commit -m "feat(ui): add list and kanban view toggle components

- View toggle button component
- List view layout wrapper
- Kanban view with card layout
- Reusable Kanban card component
- State persistence for view preference

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Toast Notification Hook
**Branch:** `frontend/toast-hook`

**What to Build:**
```typescript
// lib/hooks/use-toast.ts
- Custom hook for showing toasts
- Success, error, warning variants
- Auto-dismiss after 3 seconds

// Usage patterns:
- Success: "Invoice confirmed"
- Error: "Failed to save contact"
- Warning: "Budget exceeded"
```

**Commit:**
```bash
git commit -m "feat(ui): add toast notification hook

- Custom toast hook with variants
- Success, error, warning, info types
- Auto-dismiss configuration
- Consistent notification patterns

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 2: Authentication Pages (Tasks 9-12)

### Task 9: Login Page
**Branch:** `frontend/login-page`

**What to Build:**
```typescript
// app/(auth)/login/page.tsx
- Login form (Login ID, Password)
- Form validation with Zod
- Call auth server action
- Redirect to dashboard on success
- Show errors below form
- Link to sign up and forgot password

// Design:
- Centered card layout
- Clean, minimal design
- Responsive
```

**Reference:** UC-02 in USECASE.md

**Commit:**
```bash
git commit -m "feat(auth): add login page

- Login form with validation
- Integration with auth server action
- Error handling and display
- Redirect to dashboard on success
- Links to signup and password reset

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Sign Up Page
**Branch:** `frontend/signup-page`

**What to Build:**
```typescript
// app/(auth)/sign-up/page.tsx
- Sign up form (Login ID, Email, Password, Confirm Password)
- Validation rules:
  - Login ID: 6-12 characters, unique
  - Password: 8+ chars, uppercase, lowercase, special char
  - Confirm Password: must match
- Call signup server action
- Show success message
- Auto-login and redirect

// Design:
- Match login page style
- Show password requirements
```

**Reference:** UC-01 in USECASE.md

**Commit:**
```bash
git commit -m "feat(auth): add sign up page for Accountant role

- Self-service signup form
- Password complexity validation
- Login ID uniqueness check
- Confirm password matching
- Auto-login after successful signup

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 11: Forgot Password Page
**Branch:** `frontend/forgot-password-page`

**What to Build:**
```typescript
// app/(auth)/forgot-password/page.tsx
- Email input form
- Send reset link
- Success message display

// app/(auth)/reset-password/[token]/page.tsx
- New password form
- Confirm password
- Submit and redirect to login
```

**Reference:** UC-03 in USECASE.md

**Commit:**
```bash
git commit -m "feat(auth): add forgot and reset password pages

- Forgot password form with email input
- Reset password page with token validation
- Password complexity requirements
- Success messages and redirects

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 12: Auth Layout
**Branch:** `frontend/auth-layout`

**What to Build:**
```typescript
// app/(auth)/layout.tsx
- Centered layout for auth pages
- Company logo
- Background design
- Responsive
- No header/sidebar
```

**Commit:**
```bash
git commit -m "feat(auth): add authentication layout

- Centered card layout for auth pages
- Company branding
- Clean background design
- Mobile responsive

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 3: Workspace Layout & Dashboard (Tasks 13-15)

### Task 13: Workspace Layout
**Branch:** `frontend/workspace-layout`

**What to Build:**
```typescript
// app/(workspace)/layout.tsx
- Header with user profile and logout
- Sidebar with navigation menu:
  - Dashboard
  - Sales (Order, Invoice, Receipt)
  - Purchase (Order, Bill, Payment)
  - Contacts
  - Products
  - Accounting (Journal Entries, Chart of Accounts, Journals)
  - Budgets
  - Reports (Balance Sheet, P&L, Budget Report)
  - Settings
- Main content area
- Protect with session check
```

**Commit:**
```bash
git commit -m "feat(workspace): add workspace layout with navigation

- Header with user menu and logout
- Sidebar navigation with all modules
- Main content area
- Session protection
- Responsive design with mobile menu

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 14: Dashboard Page
**Branch:** `frontend/dashboard-page`

**What to Build:**
```typescript
// app/(workspace)/dashboard/page.tsx
- Sales widget (All, Confirmed, Draft counts)
  - Quick "New" button for Sales Order
- Purchase widget (All, Confirmed, Draft counts)
  - Quick "New" button for Purchase Order
- Budget widget (Achieved, Budget, Committed totals)
  - Link to Budget Report
- Quick links section to all modules

// Design:
- Card-based layout
- 3-column grid on desktop, single column on mobile
- Show counts and quick actions
```

**Reference:** UC-32 in USECASE.md

**Commit:**
```bash
git commit -m "feat(workspace): add dashboard with sales, purchase, and budget widgets

- Sales summary widget with counts and quick create
- Purchase summary widget with counts and quick create
- Budget summary widget with totals
- Quick navigation links to all modules
- Responsive grid layout

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 15: User Profile Page
**Branch:** `frontend/user-profile-page`

**What to Build:**
```typescript
// app/(workspace)/profile/page.tsx
- View profile information
- Edit name, email
- Change password form
- Save button

// components/profile/
- profile-form.tsx
- password-change-form.tsx
```

**Reference:** FR-1.6 in PRD.md

**Commit:**
```bash
git commit -m "feat(workspace): add user profile page

- View and edit profile information
- Change password form with validation
- Update profile server action
- Success toast notifications

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 4: Master Data Pages (Tasks 16-23)

### Task 16: Contacts List Page
**Branch:** `frontend/contacts-list`

**What to Build:**
```typescript
// app/(workspace)/contacts/page.tsx
- List view and Kanban view toggle
- Search bar
- Filter by type (Customer, Vendor, Both)
- Filter by archived
- Data table with columns:
  - Image, Name, Type, Email, Phone, Actions
- Actions: View, Edit, Archive/Restore
- "New Contact" button

// Design:
- Use data-table component
- Status badges for type
- Pagination
```

**Reference:** UC-05 in USECASE.md

**Commit:**
```bash
git commit -m "feat(contacts): add contacts list page with search and filters

- List and Kanban view toggle
- Search by name, email, phone
- Filter by contact type
- Filter archived contacts
- Actions: view, edit, archive, restore
- New contact button

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 17: Contact Form Page
**Branch:** `frontend/contact-form`

**What to Build:**
```typescript
// app/(workspace)/contacts/new/page.tsx
// app/(workspace)/contacts/[id]/edit/page.tsx
- Form fields:
  - Name (required)
  - Type (Customer/Vendor/Both) (required)
  - Email (required, unique)
  - Phone
  - Address (textarea)
  - Profile Image upload
- Validation with Zod
- Save button
- Cancel button
- "Invite to Portal" button (if not already invited)

// components/contacts/
- contact-form.tsx
```

**Reference:** UC-05 in USECASE.md

**Commit:**
```bash
git commit -m "feat(contacts): add contact create and edit forms

- Create new contact form
- Edit existing contact form
- Image upload with preview
- Email uniqueness validation
- Invite to portal action
- Form validation and error display

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 18: Contact Detail Page
**Branch:** `frontend/contact-detail`

**What to Build:**
```typescript
// app/(workspace)/contacts/[id]/page.tsx
- Display contact information
- Tabs:
  - Details
  - Purchase Orders (if Vendor)
  - Vendor Bills (if Vendor)
  - Sales Orders (if Customer)
  - Customer Invoices (if Customer)
  - Payment History
- Edit button
- Archive button
- Invite to Portal button (if not invited)
```

**Commit:**
```bash
git commit -m "feat(contacts): add contact detail page with transaction history

- View contact details
- Tabs for related transactions
- List purchase orders and bills for vendors
- List sales orders and invoices for customers
- Payment history
- Edit and archive actions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 19: Products List Page
**Branch:** `frontend/products-list`

**What to Build:**
```typescript
// app/(workspace)/products/page.tsx
- List and Kanban view toggle
- Search by name
- Filter by category
- Filter by archived
- Data table with columns:
  - Image, Name, Type, Category, Sales Price, Cost, Actions
- Actions: View, Edit, Archive/Restore
- "New Product" button
```

**Reference:** UC-06 in USECASE.md

**Commit:**
```bash
git commit -m "feat(products): add products list page

- List and Kanban view toggle
- Search by product name
- Filter by category
- Filter archived products
- Display sales price and cost
- New product button

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 20: Product Form Page
**Branch:** `frontend/product-form`

**What to Build:**
```typescript
// app/(workspace)/products/new/page.tsx
// app/(workspace)/products/[id]/edit/page.tsx
- Form fields:
  - Name (required)
  - Type (Goods/Service/Combo) (required)
  - Category (select or create new)
  - Sales Price (required)
  - Cost (required)
  - Product Image upload
- Create category inline if doesn't exist
- Validation

// components/products/
- product-form.tsx
- category-select.tsx (with create option)
```

**Reference:** UC-06 in USECASE.md

**Commit:**
```bash
git commit -m "feat(products): add product create and edit forms

- Create new product form
- Edit existing product form
- Category selection with inline create
- Image upload
- Price and cost validation
- Product type selection

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 21: Chart of Accounts Page
**Branch:** `frontend/chart-of-accounts`

**What to Build:**
```typescript
// app/(workspace)/accounting/accounts/page.tsx
- List all accounts
- Group by type (Balance Sheet, Profit & Loss)
- Show account name and type
- Actions: Edit, Archive/Restore
- "New Account" button
- Cannot delete accounts with transaction history

// app/(workspace)/accounting/accounts/new/page.tsx
- Create account form
- Account name, type selection (leaf types only)
```

**Reference:** UC-07 in USECASE.md

**Commit:**
```bash
git commit -m "feat(accounting): add chart of accounts page

- List accounts grouped by category
- Only leaf types selectable
- Create and edit account forms
- Archive accounts
- Prevent deletion with transaction history

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 22: Journals Page
**Branch:** `frontend/journals-page`

**What to Build:**
```typescript
// app/(workspace)/accounting/journals/page.tsx
- List journals
- Show name, type, default account
- Edit action
- "New Journal" button

// app/(workspace)/accounting/journals/new/page.tsx
- Create journal form
- Name, type, default account selection
```

**Reference:** UC-08 in USECASE.md

**Commit:**
```bash
git commit -m "feat(accounting): add journals management page

- List all journals
- Display type and default account
- Create and edit journal forms
- Journal type selection

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 23: Analytic Accounts & Tax Rates Pages
**Branch:** `frontend/analytics-tax-pages`

**What to Build:**
```typescript
// app/(workspace)/accounting/analytics/page.tsx
- List analytic accounts
- Show name and type (Income/Expenses)
- Create and edit forms

// app/(workspace)/accounting/tax-rates/page.tsx
- List tax rates
- Show name, percentage, applicability
- Create and edit forms
```

**Reference:** UC-09, FR-8.1 in PRD.md

**Commit:**
```bash
git commit -m "feat(accounting): add analytic accounts and tax rates pages

- Analytic accounts list and forms
- Tax rates list and forms
- Type and applicability filtering

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 5: Purchase Module (Tasks 24-27)

### Task 24: Purchase Orders List
**Branch:** `frontend/purchase-orders-list`

**What to Build:**
```typescript
// app/(workspace)/purchase/orders/page.tsx
- List purchase orders
- Filter by status (All/Draft/Confirmed)
- Search by PO number or vendor
- Columns: PO Number, Vendor, Date, Total, Status, Actions
- Actions: View, Edit (if Draft), Confirm, Cancel
- "New Purchase Order" button
```

**Reference:** UC-13 in USECASE.md

**Commit:**
```bash
git commit -m "feat(purchase): add purchase orders list page

- List all purchase orders
- Filter by status
- Search by PO number or vendor
- Status badges
- Quick actions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 25: Purchase Order Form
**Branch:** `frontend/purchase-order-form`

**What to Build:**
```typescript
// app/(workspace)/purchase/orders/new/page.tsx
// app/(workspace)/purchase/orders/[id]/edit/page.tsx
- Select vendor
- Line items table:
  - Product, Analytic Account, Quantity, Unit Price, Line Total
  - Add/remove lines
  - Auto-calculate totals
- Grand Total display
- Save as Draft button
- Confirm button
- Budget warning if exceeds budget

// components/purchase/
- purchase-order-form.tsx
- line-items-table.tsx
```

**Reference:** UC-13, UC-14 in USECASE.md

**Commit:**
```bash
git commit -m "feat(purchase): add purchase order create and edit forms

- Vendor selection
- Dynamic line items table
- Auto-calculation of line totals
- Grand total calculation
- Budget warning on confirmation
- Save draft and confirm actions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 26: Vendor Bills List & Form
**Branch:** `frontend/vendor-bills`

**What to Build:**
```typescript
// app/(workspace)/purchase/bills/page.tsx
- List vendor bills
- Filter by status, payment status
- Columns: Bill Number, Vendor, Date, Total, Amount Due, Status, Actions
- "Create Bill" button (from PO or manual)

// app/(workspace)/purchase/bills/new/page.tsx
- Option to create from PO or manual
- If from PO: pre-fill vendor and lines
- Bill date, due date
- Line items
- Confirm button (creates journal entry)

// app/(workspace)/purchase/bills/[id]/page.tsx
- View bill details
- Pay button
```

**Reference:** UC-15, UC-16 in USECASE.md

**Commit:**
```bash
git commit -m "feat(purchase): add vendor bills pages

- Vendor bills list with filters
- Create bill from purchase order
- Create manual bill
- Bill details page with payment action
- Confirmation creates journal entry

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 27: Bill Payment Dialog
**Branch:** `frontend/bill-payment-dialog`

**What to Build:**
```typescript
// components/purchase/
- bill-payment-dialog.tsx
  - Amount (default to amount due)
  - Payment Via (Bank/Cash)
  - Date
  - Note (optional)
  - Confirm button
  - Creates payment + journal entry #2
```

**Reference:** UC-17 in USECASE.md

**Commit:**
```bash
git commit -m "feat(purchase): add bill payment dialog

- Payment form modal
- Amount validation
- Payment method selection
- Creates payment record and journal entry
- Updates bill payment status

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 6: Sales Module (Tasks 28-31)

### Task 28: Sales Orders List & Form
**Branch:** `frontend/sales-orders`

**What to Build:**
```typescript
// app/(workspace)/sales/orders/page.tsx
- List sales orders
- Filter by status
- Columns: SO Number, Customer, Date, Total, Status, Actions

// app/(workspace)/sales/orders/new/page.tsx
- Customer selection
- Line items with Product, Analytic, Qty, Price, Tax
- Auto-calculate with tax
- Confirm button
```

**Reference:** UC-18, UC-19 in USECASE.md

**Commit:**
```bash
git commit -m "feat(sales): add sales orders pages

- Sales orders list with filters
- Create sales order form
- Line items with tax calculation
- Auto-calculate totals including tax
- Confirm sales order

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 29: Customer Invoices List & Form
**Branch:** `frontend/customer-invoices`

**What to Build:**
```typescript
// app/(workspace)/sales/invoices/page.tsx
- List customer invoices
- Filter by status, payment status
- Columns: Invoice Number, Customer, Date, Total, Amount Due, Status

// app/(workspace)/sales/invoices/new/page.tsx
- Create from SO or manual
- Invoice reference, date, due date
- Line items with tax
- Confirm (creates journal entry)

// app/(workspace)/sales/invoices/[id]/page.tsx
- View invoice details
- Receive Payment button
- Download PDF button
```

**Reference:** UC-20, UC-21 in USECASE.md

**Commit:**
```bash
git commit -m "feat(sales): add customer invoices pages

- Customer invoices list
- Create invoice from sales order
- Create manual invoice
- Invoice details with payment action
- PDF download
- Confirmation creates journal entry

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 30: Invoice Payment Dialog
**Branch:** `frontend/invoice-payment-dialog`

**What to Build:**
```typescript
// components/sales/
- invoice-payment-dialog.tsx
  - Amount (default to amount due)
  - Payment Via (Bank/Cash)
  - Date
  - Note
  - Confirm (manual payment)
  - Creates payment + journal entry #2
```

**Reference:** UC-22 in USECASE.md

**Commit:**
```bash
git commit -m "feat(sales): add invoice payment dialog for manual payments

- Payment form for admin/accountant
- Amount validation
- Payment method selection
- Creates payment and journal entry
- Updates invoice payment status

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 31: Receipts List Page
**Branch:** `frontend/receipts-list`

**What to Build:**
```typescript
// app/(workspace)/sales/receipts/page.tsx
- List all invoice payments
- Filter by date, customer
- Columns: Date, Invoice, Customer, Amount, Method, Status
- View action links to invoice
```

**Commit:**
```bash
git commit -m "feat(sales): add receipts list page

- List all invoice payments
- Filter by date and customer
- Display payment method and amount
- Link to source invoice

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 7: Accounting & Journal Entries (Tasks 32-33)

### Task 32: Journal Entries List
**Branch:** `frontend/journal-entries-list`

**What to Build:**
```typescript
// app/(workspace)/accounting/entries/page.tsx
- List all journal entries
- Filter by status (Draft/Posted)
- Filter by source (Manual/Auto)
- Columns: Entry Number, Date, Journal, Total Debit, Total Credit, Status, Actions
- "New Manual Entry" button
- Actions: View, Post (if Draft), Reset to Draft
```

**Reference:** UC-23 in USECASE.md

**Commit:**
```bash
git commit -m "feat(accounting): add journal entries list page

- List all journal entries
- Filter by status and source
- Display debit/credit totals
- Post and reset actions
- New manual entry button

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 33: Manual Journal Entry Form
**Branch:** `frontend/manual-journal-entry`

**What to Build:**
```typescript
// app/(workspace)/accounting/entries/new/page.tsx
- Accounting date
- Journal selection
- Line items table:
  - Account, Partner, Debit, Credit
  - Add/remove lines
- Show running total Debit and Credit
- Balance indicator (Debit = Credit)
- Save Draft button
- Post button (only if balanced)

// Validation:
- Must be balanced before posting
- Show error if unbalanced
```

**Reference:** UC-23, UC-24 in USECASE.md

**Commit:**
```bash
git commit -m "feat(accounting): add manual journal entry form

- Create manual journal entries
- Dynamic line items with debit/credit
- Real-time balance validation
- Prevent posting unbalanced entries
- Visual balance indicator

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 8: Budgets (Tasks 34-36)

### Task 34: Budgets List
**Branch:** `frontend/budgets-list`

**What to Build:**
```typescript
// app/(workspace)/budgets/page.tsx
- List and Kanban view toggle
- Filter by status (Draft/Confirmed/Cancelled)
- Search by name
- Columns: Name, Period, Responsible, Status, Actions
- "New Budget" button
- Actions: View, Confirm, Revise, Cancel
```

**Reference:** UC-10 in USECASE.md

**Commit:**
```bash
git commit -m "feat(budgets): add budgets list page

- List and Kanban views
- Filter by status
- Search by budget name
- Status badges
- Budget actions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 35: Budget Form
**Branch:** `frontend/budget-form`

**What to Build:**
```typescript
// app/(workspace)/budgets/new/page.tsx
- Budget name
- Start date, end date
- Responsible person selection
- Budget lines table:
  - Analytic Account, Type (Income/Expenses), Committed Amount
  - Add/remove lines
- Save Draft button
- Confirm button

// When confirmed:
- Show Achieved Amount, Achieved %, Amount to Achieve
- These are read-only, computed by backend
```

**Reference:** UC-10, UC-11 in USECASE.md

**Commit:**
```bash
git commit -m "feat(budgets): add budget create and edit forms

- Create budget with multiple lines
- Select analytic accounts
- Set committed amounts
- Confirm budget to compute achievement
- Display achievement metrics when confirmed

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 36: Budget Detail Page
**Branch:** `frontend/budget-detail`

**What to Build:**
```typescript
// app/(workspace)/budgets/[id]/page.tsx
- Display budget information
- Budget lines table with:
  - Analytic Account
  - Committed Amount
  - Achieved Amount (clickable to see transactions)
  - Achieved %
  - Amount to Achieve
- Visual progress bars for each line
- Revise button
- Cancel button
- Link to revised version (if exists)
- Link to original version (if this is a revision)
```

**Reference:** UC-30 in USECASE.md

**Commit:**
```bash
git commit -m "feat(budgets): add budget detail page with achievement tracking

- Display budget information
- Show achievement metrics per line
- Visual progress indicators
- Drill-down to transactions
- Revise and cancel actions
- Revision history links

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 9: Reports (Tasks 37-39)

### Task 37: Balance Sheet Report
**Branch:** `frontend/balance-sheet`

**What to Build:**
```typescript
// app/(workspace)/reports/balance-sheet/page.tsx
- Year selector
- Generate button
- Display report:
  - Assets section (Bank, Cash, Debtors, Other Assets)
  - Liabilities & Capital section (Capital, Creditors, Other Liabilities)
  - Total Assets
  - Total Liabilities
- Print/PDF button
- Proper accounting format
```

**Reference:** UC-27, FR-13.2 in PRD.md

**Commit:**
```bash
git commit -m "feat(reports): add balance sheet report

- Year selection
- Generate balance sheet
- Display assets and liabilities
- Calculate totals
- Print and PDF export
- Proper accounting format

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 38: Profit & Loss Report
**Branch:** `frontend/profit-loss`

**What to Build:**
```typescript
// app/(workspace)/reports/profit-loss/page.tsx
- Year selector
- Generate button
- Display report:
  - Income section
  - Expenses section
  - Other Expenses section
  - Net Income = Income - Expenses
- Print/PDF button
```

**Reference:** UC-28, FR-13.1 in PRD.md

**Commit:**
```bash
git commit -m "feat(reports): add profit and loss report

- Year selection
- Generate P&L report
- Display income and expenses
- Calculate net income
- Print and PDF export

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 39: Budget Report
**Branch:** `frontend/budget-report`

**What to Build:**
```typescript
// app/(workspace)/reports/budget/page.tsx
- List all confirmed budgets
- Show for each:
  - Budget name
  - Period
  - Committed vs Achieved visual
  - Percentage achieved
- Filters by status, date range
- Click to view full budget detail
```

**Reference:** UC-29 in USECASE.md

**Commit:**
```bash
git commit -m "feat(reports): add budget report page

- List all budgets with achievement
- Visual progress indicators
- Committed vs achieved comparison
- Filter by status and period
- Link to budget details

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 10: Customer/Vendor Portal (Tasks 40-43)

### Task 40: Portal Layout
**Branch:** `frontend/portal-layout`

**What to Build:**
```typescript
// app/(portal)/layout.tsx
- Portal header (different from workspace)
- Navigation: My Invoices, My Bills, Payment History, Profile
- Display company name
- User menu with logout
- Protect with Contact role check
```

**Commit:**
```bash
git commit -m "feat(portal): add portal layout for customers and vendors

- Portal-specific header and navigation
- Contact role protection
- Simple navigation menu
- Responsive design

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 41: Portal - My Invoices (Customer)
**Branch:** `frontend/portal-invoices`

**What to Build:**
```typescript
// app/(portal)/invoices/page.tsx
- List own invoices only (filtered by contactId)
- Filter by payment status (All/Paid/Partial/Not Paid)
- Columns: Invoice Number, Date, Due Date, Total, Amount Due, Status
- View action
- Pay button (if not paid)

// app/(portal)/invoices/[id]/page.tsx
- Invoice details (read-only)
- Line items
- Amount due
- "Pay Now" button → Opens Razorpay gateway
- Download PDF
```

**Reference:** UC-33, UC-36 in USECASE.md

**Commit:**
```bash
git commit -m "feat(portal): add my invoices page for customers

- List own invoices only
- Filter by payment status
- View invoice details
- Pay now button (Razorpay integration)
- Download PDF

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 42: Portal - Payment Gateway Integration
**Branch:** `frontend/razorpay-integration`

**What to Build:**
```typescript
// components/portal/
- razorpay-checkout.tsx
  - Load Razorpay script
  - Create order via server action
  - Open Razorpay checkout modal
  - Handle success/failure callbacks
  - Show "Payment Processing" state
  - Wait for webhook confirmation before showing "Paid"

// lib/hooks/use-razorpay.ts
- Custom hook for Razorpay integration
```

**Reference:** UC-36, UC-37 in USECASE.md

**Commit:**
```bash
git commit -m "feat(portal): add Razorpay payment gateway integration

- Razorpay checkout component
- Payment order creation
- Success/failure handling
- Payment processing state
- Webhook confirmation wait

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 43: Portal - My Bills & Payment History
**Branch:** `frontend/portal-bills-history`

**What to Build:**
```typescript
// app/(portal)/bills/page.tsx
- List own bills (Vendor role only)
- Read-only view
- No payment action (LedgerOne pays vendors, not reverse)

// app/(portal)/payments/page.tsx
- List own payment history
- Show date, invoice, amount, method, status
- Gateway reference if applicable
```

**Reference:** UC-33 in USECASE.md

**Commit:**
```bash
git commit -m "feat(portal): add my bills and payment history pages

- Vendors can view their own bills
- Payment history for all payments made
- Gateway transaction references
- Read-only views

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 11: Settings & Admin (Tasks 44-45)

### Task 44: Company Settings Page
**Branch:** `frontend/company-settings`

**What to Build:**
```typescript
// app/(workspace)/settings/company/page.tsx
- Company name
- Logo upload
- Address
- Base currency
- Fiscal year start month
- Document number prefixes
- Save button
- Admin only
```

**Reference:** FR-14.1 in PRD.md

**Commit:**
```bash
git commit -m "feat(settings): add company settings page

- Edit company profile
- Logo upload
- Currency and fiscal year configuration
- Document numbering prefixes
- Admin role protection

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 45: User Management Page (Admin)
**Branch:** `frontend/user-management`

**What to Build:**
```typescript
// app/(workspace)/settings/users/page.tsx
- List internal users (Admin/Accountant)
- Columns: Name, Login ID, Email, Role, Status, Actions
- "Create User" button
- Actions: View, Deactivate/Activate, Reset Password
- Admin only

// app/(workspace)/settings/users/new/page.tsx
- Create user form
- Name, Login ID, Email, Role, Password
- Validation
```

**Reference:** UC-04 in USECASE.md

**Commit:**
```bash
git commit -m "feat(settings): add user management page for admin

- List internal users
- Create new users
- Deactivate/activate users
- Reset password action
- Admin role protection

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 12: Help Assistant (Tasks 46)

### Task 46: Help Assistant Chat Widget
**Branch:** `frontend/help-assistant`

**What to Build:**
```typescript
// components/chat/
- help-assistant-widget.tsx
  - Floating chat button (bottom-right)
  - Chat panel slides in
  - Message input
  - Chat history display
  - Call chatbot server action
  - Session-only (not persisted)
  - Available on Dashboard and Portal Home

// Design:
- Clean chat interface
- Message bubbles (user vs assistant)
- Typing indicator
- Auto-scroll to latest message
```

**Reference:** UC-38, FR-17 in PRD.md

**Commit:**
```bash
git commit -m "feat(chat): add Help Assistant chat widget

- Floating chat widget
- Chat interface with message history
- Integration with chatbot server action
- Available on dashboard and portal
- Session-only conversations

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Phase 13: Testing (Tasks 47-50)

### Task 47: Component Unit Tests
**Branch:** `frontend/component-tests`

**What to Test:**
```typescript
// components/__tests__/
- data-table.test.tsx
- status-badge.test.tsx
- currency-display.test.tsx
- form components tests
```

**Commit:**
```bash
git commit -m "test(components): add unit tests for UI components

- Data table component tests
- Status badge tests
- Form component tests
- Currency display tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 48: Page Integration Tests
**Branch:** `frontend/page-tests`

**What to Test:**
```typescript
// app/__tests__/
- login flow tests
- contact CRUD tests
- product CRUD tests
- Navigation tests
```

**Commit:**
```bash
git commit -m "test(pages): add integration tests for pages

- Login flow tests
- Master data CRUD tests
- Navigation and routing tests
- Form submission tests

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 49: E2E Tests - Critical Flows
**Branch:** `frontend/e2e-critical-flows`

**What to Test:**
```typescript
// e2e/
- auth-flow.spec.ts - Login, signup
- purchase-flow.spec.ts - PO → Bill → Payment
- sales-flow.spec.ts - SO → Invoice → Receipt
- budget-flow.spec.ts - Create → Confirm → View Achievement
```

**Commit:**
```bash
git commit -m "test(e2e): add end-to-end tests for critical flows

- Complete authentication flow
- Full purchase cycle
- Full sales cycle
- Budget creation and tracking

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 50: E2E Tests - Portal
**Branch:** `frontend/e2e-portal`

**What to Test:**
```typescript
// e2e/portal/
- portal-login.spec.ts
- view-invoices.spec.ts
- pay-invoice.spec.ts (with mocked Razorpay)
- payment-history.spec.ts
```

**Commit:**
```bash
git commit -m "test(e2e): add portal end-to-end tests

- Portal authentication
- View invoices as customer
- Payment gateway flow (mocked)
- Payment history viewing

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📝 Task Completion Checklist (For Each Task)

Before committing:

- [ ] Component renders without errors
- [ ] Responsive design works (mobile + desktop)
- [ ] Forms validate correctly
- [ ] Server actions integrated properly
- [ ] Proper error handling and display
- [ ] Loading states implemented
- [ ] Tested in browser
- [ ] Follows design standards
- [ ] Commit message follows convention

---

## 🚀 Getting Started

1. **Set up your environment:**
   ```bash
   npm install
   npm run dev
   ```

2. **Start with Task 1:**
   ```bash
   git checkout -b frontend/shadcn-setup
   # Complete Task 1
   # Test in browser
   # Commit
   git push origin frontend/shadcn-setup
   # Open PR, get reviewed, merge
   ```

3. **Move to Task 2:**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b frontend/global-styles
   # Continue...
   ```

---

## 🎨 Design Principles

- **Mobile-first:** Design for mobile, enhance for desktop
- **Accessibility:** Proper ARIA labels, keyboard navigation
- **Performance:** Use Server Components by default
- **Consistency:** Follow shadcn/ui patterns
- **User Feedback:** Toast notifications for all actions
- **Error Handling:** Clear, user-friendly error messages

---

## 📞 Need Help?

- Read `/docs/` for product specs
- Check `.claude/skills/design-standards/` for UI patterns
- Review CLAUDE.md for code standards
- Ask team for code review

---

**Total Tasks:** 50  
**Estimated Time:** 4-5 weeks (2-3 tasks per day)
