# LedgerOne — Accounting System

**Version:** 1.1 · **Related:** `PRD.md`, `WORKFLOW.md`, `architecture.md`, `SCREENS.md`, `TECH_STACK.md`

## Use Case Specification

### Actors

1.  **Administrator**
2.  **Accountant / User**
3.  **Customer / Vendor**
4.  **System**
5.  **Payment Gateway** (external — Razorpay; involved only in UC-36/UC-37)
6.  **Help Assistant** (system component — FAQ chatbot; involved only in UC-38)

------------------------------------------------------------------------

## UC-01: Sign Up

**Actor:** User

**Purpose:** Create a new system account.

**Flow:** 1. User opens Sign Up. 2. Enters Login ID, Email ID, Password
and Confirm Password. 3. System validates the entered information. 4.
System checks Login ID uniqueness. 5. System checks Email uniqueness. 6.
System validates password rules. 7. System creates the user account.

**Validation:** - Login ID must be unique and 6--12 characters. - Email
must be unique. - Password must be more than 8 characters. - Password
must contain lowercase, uppercase and special character. - Password
confirmation must match.

------------------------------------------------------------------------

## UC-02: Login

**Actor:** Administrator / Accountant / User / Customer / Vendor

**Purpose:** Authenticate and access the system.

**Flow:** 1. User enters Login ID. 2. User enters Password. 3. System
validates credentials. 4. System identifies the user's role. 5. System
opens the appropriate dashboard or portal.

**Alternative Flow:** - Invalid credentials → show
`Invalid Login ID or Password`.

------------------------------------------------------------------------

## UC-03: Forgot Password

**Actor:** User

**Purpose:** Recover access to an account.

**Flow:** 1. User selects Forgot Password. 2. User provides the required
account information. 3. System verifies the account. 4. User sets a new
password. 5. System validates and saves the new password. 6. User can
log in with the new password.

------------------------------------------------------------------------

## UC-04: Create User

**Actor:** Administrator

**Purpose:** Create an internal user.

**Flow:** 1. Administrator opens User Management. 2. Selects Create
User. 3. Enters Name, Login ID, Email, Role and Password. 4. System
validates the information. 5. Administrator creates the user. 6. System
assigns the selected role.

**Roles shown in the wireframe:** - User - Administrator

------------------------------------------------------------------------

## UC-05: Manage Contacts

**Actor:** Administrator / Accountant

**Purpose:** Maintain customers and vendors.

**Flow:** 1. Open Contact Master. 2. View contacts in List View. 3.
Search or switch to Kanban View. 4. Select New to create a contact. 5.
Enter Contact Name, Email, Phone and Address. 6. Upload an image if
required. 7. Save/confirm the contact. 8. Contact becomes available in
sales and purchase transactions.

**Contact Type:** - Customer - Vendor - Both

------------------------------------------------------------------------

## UC-06: Manage Products

**Actor:** Administrator / Accountant

**Purpose:** Maintain products used in sales and purchases.

**Flow:** 1. Open Product Master. 2. View products in List View. 3.
Search or switch to Kanban View. 4. Select New. 5. Enter Product Name.
6. Select Product Type. 7. Select Category. 8. Enter Sales Price and
Cost. 9. Upload product image if required. 10. Save/confirm the product.

**Product Types:** - Goods - Service - Combo

**Additional behaviour:** - Category can be created while entering the
product.

------------------------------------------------------------------------

## UC-07: Manage Chart of Accounts

**Actor:** Administrator / Accountant

**Purpose:** Maintain accounting accounts.

**Flow:** 1. Open Chart of Accounts. 2. View configured accounts. 3.
Select New. 4. Enter Account Name. 5. Select Account Type. 6. Confirm
the account. 7. System makes the account available for accounting
transactions.

**Account Types:** - Balance Sheet - Asset - Liability - Bank -
Capital - Cash - Profit and Loss - Income - Expenses - Other Expenses

------------------------------------------------------------------------

## UC-08: Manage Journals

**Actor:** Administrator / Accountant

**Purpose:** Configure accounting journals.

**Flow:** 1. Open Journals. 2. View existing journals. 3. Select New. 4.
Enter Journal Name. 5. Select Journal Type. 6. Select Default Account
from Chart of Accounts. 7. Confirm the journal.

**Journal Types:** - Sales - Purchase - Bank - Cash

------------------------------------------------------------------------

## UC-09: Manage Analytic Accounts

**Actor:** Administrator / Accountant

**Purpose:** Create analytic accounts used for transaction and budget
tracking.

**Flow:** 1. Open Analytic Accounts. 2. Select New. 3. Enter Analytic
Account Name. 4. Select Type. 5. Save the analytic account. 6. The
analytic account becomes available in transactions and budgets.

**Types:** - Income - Expense

------------------------------------------------------------------------

## UC-10: Create Budget

**Actor:** Administrator / Accountant

**Purpose:** Create a budget for a defined period and analytic account.

**Flow:** 1. Open Budget. 2. Select New. 3. Enter Budget Name. 4. Select
Start Date and End Date. 5. Select Responsible Person. 6. Select
Analytic Account. 7. Select Income or Expense. 8. Enter Committed
Amount. 9. Save the budget. 10. Confirm the budget.

**Budget fields:** - Budget Name - Budget Period - Responsible Person -
Analytic Account - Type - Committed Amount - Achieved Amount - Achieved
% - Amount To Achieve

------------------------------------------------------------------------

## UC-11: Revise Budget

**Actor:** Administrator / Accountant

**Purpose:** Modify a confirmed budget while keeping its original
reference.

**Flow:** 1. Open a confirmed budget. 2. Select Revise. 3. System
creates a revised version/reference. 4. User changes the required budget
values. 5. User confirms the revised budget. 6. System keeps the
original budget reference for traceability.

------------------------------------------------------------------------

## UC-12: Cancel Budget

**Actor:** Administrator / Accountant

**Purpose:** Cancel an existing budget.

**Flow:** 1. Open the budget. 2. Select Cancel. 3. System changes the
budget status to Cancelled.

------------------------------------------------------------------------

## UC-13: Create Purchase Order

**Actor:** Administrator / Accountant

**Purpose:** Create an order for goods or services from a vendor.

**Flow:** 1. Open Purchase Order. 2. Select New. 3. Select Vendor. 4.
Select Product. 5. Select Budget Analytic. 6. Enter Quantity. 7.
Enter/confirm Unit Price. 8. System calculates Total. 9. System checks
the related budget. 10. If the order exceeds the remaining budget,
system displays a warning. 11. User can still confirm the PO.

**Calculation:**

`Total = Quantity × Unit Price`

------------------------------------------------------------------------

## UC-14: Confirm Purchase Order

**Actor:** Administrator / Accountant

**Flow:** 1. Open a Purchase Order. 2. Review vendor and order lines. 3.
Select Confirm. 4. System validates the PO. 5. PO becomes Confirmed. 6.
PO becomes available for Bill creation.

**Budget Rule:** - Exceeding the approved budget produces a warning. -
The warning does not block PO confirmation.

------------------------------------------------------------------------

## UC-15: Create Vendor Bill

**Actor:** Administrator / Accountant

**Purpose:** Create a Vendor Bill from a Purchase Order.

**Flow:** 1. Open a confirmed Purchase Order. 2. Select Create Bill. 3.
System creates the Vendor Bill. 4. Vendor details are copied from the
PO. 5. Product, quantity, price and analytic information are copied. 6.
Purchase account is selected from the configured accounting setup. 7.
Bill Date and Due Date are entered. 8. Bill is created in Draft state.

------------------------------------------------------------------------

## UC-16: Confirm Vendor Bill

**Actor:** Administrator / Accountant / System

**Flow:** 1. Open the Vendor Bill. 2. Review the bill. 3. Select
Confirm. 4. System validates the bill. 5. System creates the related
Journal Entry. 6. Vendor Bill becomes Confirmed/Posted. 7. Vendor
outstanding amount is updated. 8. Relevant budget achievement is
updated.

**Journal Entry example:**

`Purchase Expense A/c → Debit`

`Creditors A/c → Credit`

------------------------------------------------------------------------

## UC-17: Pay Vendor Bill

**Actor:** Administrator / Accountant

**Purpose:** Record payment made to a vendor.

**Flow:** 1. Open Vendor Bill. 2. Select Pay. 3. Payment form opens. 4.
Payment Type is Send. 5. Partner is populated from the Vendor Bill. 6.
Amount is populated from the outstanding amount. 7. Select Cash or Bank.
8. Select/enter Date. 9. Add Note if required. 10. Confirm/Post payment.
11. System updates the Bill status and outstanding amount. 12. System
creates the associated Journal Entry (see UC-25).

**Note:** Always manual and internal — there is no Vendor-facing payment
screen. LedgerOne pays the vendor; the vendor never pays LedgerOne.

------------------------------------------------------------------------

## UC-18: Create Sales Order

**Actor:** Administrator / Accountant

**Purpose:** Create an order for a customer.

**Flow:** 1. Open Sales Order. 2. Select New. 3. Select Customer. 4.
Select Product. 5. Select Budget Analytic. 6. Enter Quantity. 7.
Enter/confirm Unit Price. 8. System calculates Total. 9. Save the Sales
Order. 10. Confirm the Sales Order.

**Calculation:**

`Total = Quantity × Unit Price`

------------------------------------------------------------------------

## UC-19: Confirm Sales Order

**Actor:** Administrator / Accountant

**Flow:** 1. Open a Sales Order. 2. Review customer and order lines. 3.
Select Confirm. 4. System validates the order. 5. Sales Order becomes
Confirmed. 6. Sales Order becomes available for invoice creation.

------------------------------------------------------------------------

## UC-20: Create Customer Invoice

**Actor:** Administrator / Accountant

**Purpose:** Create an invoice from a Sales Order.

**Flow:** 1. Open a confirmed Sales Order. 2. Select Create Invoice. 3.
System creates the Customer Invoice. 4. Customer details are copied from
the SO. 5. Product, quantity, price and analytic information are copied.
6. Sales account is selected from the configured accounting setup. 7.
Invoice Reference, Invoice Date and Due Date are recorded. 8. Invoice is
created in Draft state.

------------------------------------------------------------------------

## UC-21: Confirm Customer Invoice

**Actor:** Administrator / Accountant / System

**Flow:** 1. Open Customer Invoice. 2. Review invoice details. 3. Select
Confirm. 4. System validates the invoice. 5. System automatically
creates a Journal Entry. 6. Invoice becomes Confirmed/Posted. 7.
Customer outstanding amount is updated. 8. Relevant budget achievement
is updated.

**Journal Entry example:**

`Debtors A/c → Debit`

`Sales Income A/c → Credit`

------------------------------------------------------------------------

## UC-22: Receive Customer Payment (Manual, Internal)

**Actor:** Administrator / Accountant

**Purpose:** Record money received from a customer through an internal, manual entry (e.g., cash handed over, a bank transfer confirmed outside the system). For a Customer paying themselves through the Portal, see UC-36.

**Flow:** 1. Open Customer Invoice. 2. Select Pay. 3. Payment form
opens. 4. Payment Type is Receive. 5. Partner is populated from the
invoice. 6. Amount is populated from the outstanding amount. 7. Select
Cash or Bank. 8. Select/enter Date. 9. Add Note if required. 10.
Confirm/Post payment. 11. System updates invoice payment status. 12.
System updates customer outstanding amount.

------------------------------------------------------------------------

## UC-23: Create Manual Journal Entry

**Actor:** Administrator / Accountant

**Purpose:** Record an accounting transaction manually.

**Flow:** 1. Open Journal Entries. 2. Select New. 3. Enter Accounting
Date. 4. Select Journal. 5. Add journal lines. 6. Select Account for
each line. 7. Select Partner where required. 8. Enter Debit and Credit
values. 9. Select Post.

------------------------------------------------------------------------

## UC-24: Validate Journal Entry

**Actor:** System

**Purpose:** Ensure every journal entry is balanced.

**Flow:** 1. User attempts to post the entry. 2. System calculates total
Debit. 3. System calculates total Credit. 4. System compares both
totals. 5. If Debit equals Credit, posting is allowed. 6. If Debit does
not equal Credit, posting is blocked.

**Rule:**

`Total Debit = Total Credit`

------------------------------------------------------------------------

## UC-25: Automatically Create Journal Entry

**Actor:** System

**Purpose:** Automatically create accounting entries from business
transactions.

**Triggers:** - Customer Invoice confirmation. - Vendor Bill
confirmation. - Customer payment. - Vendor payment.

**Examples:**

Customer Invoice:

`Debtors Dr → Sales Income Cr`

Vendor Bill:

`Purchase Expense Dr → Creditors Cr`

Customer Payment:

`Cash/Bank Dr → Debtors Cr`

Vendor Payment:

`Creditors Dr → Cash/Bank Cr`

------------------------------------------------------------------------

## UC-26: Update Accounting Records

**Actor:** System

**Flow:** 1. Transaction is posted. 2. System records the Journal Entry.
3. System updates affected account balances. 4. System updates
customer/vendor outstanding amounts. 5. System updates Cash/Bank
balances where applicable. 6. System updates relevant budget
achievement. 7. Updated information becomes available to reports.

------------------------------------------------------------------------

## UC-27: View Balance Sheet

**Actor:** Administrator / Accountant

**Purpose:** View financial position.

**Flow:** 1. Open Balance Sheet. 2. Select the required year/period. 3.
System retrieves accounting balances. 4. System displays Assets and
Liabilities/Capital. 5. System calculates totals. 6. User can print the
report.

**Assets shown in the wireframe:** - Bank - Cash - Debtors

**Liabilities/Capital shown in the wireframe:** - Capital - Creditors

------------------------------------------------------------------------

## UC-28: View Profit and Loss Report

**Actor:** Administrator / Accountant

**Purpose:** View income, expenses and net income.

**Flow:** 1. Open Profit and Loss. 2. Select year/period. 3. System
retrieves accounting data. 4. System calculates income. 5. System
calculates expenses. 6. System calculates Net Income. 7. Report is
displayed. 8. User can print the report.

**Calculation:**

`Net Income = Income − Expenses`

------------------------------------------------------------------------

## UC-29: View Budget Report

**Actor:** Administrator / Accountant

**Purpose:** Monitor budget performance.

**Flow:** 1. Open Budget Report. 2. System displays budgets. 3. User can
use List View or Kanban View. 4. User can search budgets. 5. User opens
a budget. 6. System displays budget details and achievement information.
7. System displays Achieved vs Balance/remaining amount.

------------------------------------------------------------------------

## UC-30: View Budget Achievement

**Actor:** Administrator / Accountant

**Purpose:** View actual amount achieved against a budget.

**Flow:** 1. Open a confirmed budget. 2. View Achieved Amount. 3. System
finds relevant confirmed transactions using the budget's Analytic
Account. 4. Income budgets use relevant Sales Invoices. 5. Expense
budgets use relevant Vendor Bills. 6. System calculates the achieved
amount. 7. User can view the related invoices/bills.

**Calculations:**

`Achieved % = (Achieved Amount / Committed Amount) × 100`

`Amount To Achieve = Committed Amount − Achieved Amount`

------------------------------------------------------------------------

## UC-31: Print Report

**Actor:** Administrator / Accountant

**Purpose:** Print/download a financial report.

**Flow:** 1. User opens Balance Sheet, Profit & Loss or Budget Report.
2. Selects Print. 3. System generates the report. 4. User can print/save
the generated report.

------------------------------------------------------------------------

## UC-32: View Dashboard

**Actor:** Administrator / Accountant

**Purpose:** Provide a quick overview of sales, purchases and budgets.

**Dashboard Sections:**

### Sales

-   All
-   Confirmed
-   Draft
-   New

### Purchase

-   All
-   Confirmed
-   Draft
-   New

### Budget Reports

-   Achieved
-   Budget
-   Committed
-   Report

**Quick Navigation:** - Sales Order - Sale Invoice - Receipt - Purchase
Order - Purchase Bill - Payment - Contact - Product - Analytic Account -
Analytic Budget - Chart of Account - Journals - Journal Entries -
Balance Sheet - Profit and Loss - Budget Report

------------------------------------------------------------------------

## UC-33: Customer/Vendor Portal

**Actor:** Customer / Vendor

**Purpose:** Allow an external contact to access only their own
permitted records.

**Customer Flow:** 1. Customer logs into the portal. 2. System
identifies the customer. 3. Customer views own invoices. 4. Customer
views payment status. 5. Customer can pay an open invoice via the
Payment Gateway (see UC-36).

**Vendor Flow:** 1. Vendor logs into the portal where enabled. 2. Vendor
views own permitted bills/payment information. 3. No payment action is
available to the Vendor — LedgerOne pays the vendor, not the reverse.

**Restriction:** - Customer/Vendor cannot access another contact's
records. - Customer/Vendor cannot access internal accounting screens. -
Customer/Vendor cannot access Chart of Accounts, Journal Entries,
budgets or financial reports.

------------------------------------------------------------------------

## UC-34: Search and Switch Views

**Actor:** Administrator / Accountant

**Purpose:** Find and display master records efficiently.

**Flow:** 1. Open a master list. 2. Enter search text. 3. System filters
matching records. 4. User can open an existing record. 5. User can
switch between List and Kanban View where available.

**Applicable Masters:** - Contacts - Products - Budgets - Budget
Reports - Other list-based records as configured

------------------------------------------------------------------------

## UC-35: View Payment Status

**Actor:** Administrator / Accountant / Customer where permitted

**Purpose:** Track invoice/bill payment progress.

**Flow:** 1. Open an invoice or bill. 2. System displays total amount.
3. System displays amount paid. 4. System displays outstanding amount.
5. System displays payment status.

**Statuses:** - Not Paid - Partial - Paid

**Calculation:**

`Outstanding Amount = Total Amount − Amount Paid`

------------------------------------------------------------------------

## UC-36: Pay Invoice via Payment Gateway (Customer Self-Service)

**Actor:** Customer / Payment Gateway / System

**Purpose:** Let a Customer settle their own outstanding Sales Invoice
online, without any Administrator/Accountant involvement.

**Flow:** 1. Customer opens an Invoice in the Portal. 2. Customer
selects Pay Now (only available on Invoices, never on Vendor Bills).
3. System creates a Payment Gateway order for the outstanding amount
(or a valid partial amount). 4. System opens the gateway's hosted
Checkout. 5. Customer completes payment (card/UPI/netbanking) on the
gateway's screen. 6. Customer is redirected back to the Invoice, which
shows a "Payment Processing" state — not yet Paid. 7. See UC-37 for how
the payment is actually confirmed.

**Alternative Flow:** - Customer abandons or fails Checkout → redirected
back to the Invoice unchanged; no payment is recorded.

**Restriction:** - Never available to a Vendor. - The amount sent to the
gateway can never exceed the Invoice's outstanding amount.

------------------------------------------------------------------------

## UC-37: Confirm Payment via Gateway Webhook

**Actor:** System / Payment Gateway

**Purpose:** Establish, from a trustworthy server-to-server source, that
a gateway payment actually succeeded — never from the customer's browser
alone.

**Flow:** 1. Payment Gateway sends a webhook notification once the
payment settles. 2. System verifies the webhook's cryptographic
signature; invalid signatures are rejected immediately. 3. System checks
whether this gateway transaction ID has already been processed
(idempotency); duplicates are ignored. 4. On a first-time success,
System records the Invoice Payment, creates the associated Journal Entry
(see UC-25), and recomputes the Invoice's status and outstanding amount.
5. System sends a payment confirmation email. 6. On failure, System
marks the transaction Failed and leaves the Invoice unchanged.

**Rule:**

`An Invoice is marked Paid only after a verified webhook confirms success — a browser redirect is never sufficient on its own.`

------------------------------------------------------------------------

## UC-38: Ask the Help Assistant

**Actor:** Administrator / Accountant / Customer / Vendor

**Purpose:** Get quick guidance on how to use the product, without
leaving the current screen or contacting human support.

**Flow:** 1. User opens the Help Assistant chat widget (available on the
Dashboard and Portal Home). 2. User types a product-usage question
(e.g., "how do I revise a budget," "what does Partial mean"). 3. System
answers using a fixed, maintained FAQ knowledge base. 4. If the question
is account-specific (e.g., "how much do I owe"), System responds with a
redirect to the relevant screen instead of attempting to answer. 5. If
System cannot help, it offers a human-support contact link.

**Restriction:** - The Help Assistant never reads, computes, or displays
any financial or transactional data. - Conversations are session-only
and are not saved once the session ends.

------------------------------------------------------------------------

# Use Case Relationships

## Sales

``` text
UC-18 Create Sales Order
        ↓
UC-19 Confirm Sales Order
        ↓
UC-20 Create Customer Invoice
        ↓
UC-21 Confirm Customer Invoice
        ↓
UC-25 Automatic Journal Entry #1 (Debtors Dr / Sales Income Cr)
        ↓
UC-22 Receive Customer Payment (manual)  ── or ──  UC-36 Pay via Gateway → UC-37 Webhook Confirms
        ↓
UC-25 Automatic Journal Entry #2 (Cash/Bank Dr / Debtors Cr)
        ↓
UC-26 Update Accounting Records
```

## Purchase

``` text
UC-13 Create Purchase Order
        ↓
UC-14 Confirm Purchase Order
        ↓
UC-15 Create Vendor Bill
        ↓
UC-16 Confirm Vendor Bill
        ↓
UC-25 Automatic Journal Entry #1 (Purchase Expense Dr / Creditors Cr)
        ↓
UC-17 Pay Vendor Bill (always manual/internal)
        ↓
UC-25 Automatic Journal Entry #2 (Creditors Dr / Cash/Bank Cr)
        ↓
UC-26 Update Accounting Records
```

## Budget

``` text
UC-09 Manage Analytic Account
        ↓
UC-10 Create Budget
        ↓
UC-11 Revise Budget / UC-12 Cancel Budget
        ↓
Sales Invoice / Vendor Bill
        ↓
UC-30 View Budget Achievement
        ↓
UC-29 View Budget Report
```

## Accounting

``` text
Business Transaction
        ↓
UC-25 Automatic Journal Entry
        ↓
UC-24 Validate Journal Entry
        ↓
UC-26 Update Accounting Records
        ↓
UC-27 Balance Sheet
        ↓
UC-28 Profit & Loss
        ↓
UC-29 Budget Report
```

## Payment Gateway

``` text
UC-36 Pay Invoice via Payment Gateway (Customer)
        ↓
UC-37 Confirm Payment via Gateway Webhook (System)
        ↓
UC-25 Automatic Journal Entry #2
        ↓
UC-26 Update Accounting Records
```

## Help Assistant

``` text
UC-38 Ask the Help Assistant (any Actor)
        ↓
   Product-FAQ answer  ──or──  redirect to relevant screen  ──or──  human-support link
        (no path ever reaches Accounting, Sales, or Purchase use cases)
```
