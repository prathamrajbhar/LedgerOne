# LedgerOne E2E Test Suite (Python Playwright)

A comprehensive, feature-by-feature end-to-end (E2E) testing framework for **LedgerOne** built with **Python 3.10+**, **Playwright**, and **pytest**, utilizing the **Page Object Model (POM)** pattern.

---

## 📁 Directory Structure

```
scripts/
├── requirements.txt            # Python dependencies (playwright, pytest, etc.)
├── config.py                   # Centralized configuration & routes
├── conftest.py                 # Pytest fixtures (Admin, Accountant, Portal sessions)
├── run_tests.py                # Standalone CLI test runner
├── README.md                   # This documentation
│
├── pages/                      # Page Object Model (POM)
│   ├── base_page.py            # Base interactions (toasts, waits, tables, modals)
│   ├── auth_page.py            # Login, Sign Up, Logout, Forgot Password
│   ├── dashboard_page.py       # Metrics, KPI cards, charts, alerts
│   ├── contacts_page.py        # Contacts listing, filters, creation
│   ├── products_page.py        # Furniture catalog, stock counts, reorder alerts
│   ├── accounts_page.py        # Chart of Accounts, Journals, Analytic Accounts, Tax
│   ├── purchases_page.py       # Purchase Orders & Vendor Bills
│   ├── sales_page.py           # Sales Orders & Customer Invoices
│   ├── payments_page.py        # Receipts, Disbursements, Manual Payment recording
│   ├── journal_entries_page.py # Double-entry audit trail, Debit=Credit validation
│   ├── budgets_page.py         # Analytical budgets & achievement metrics
│   ├── reports_page.py         # Profit & Loss, Balance Sheet statements
│   ├── portal_page.py          # Customer & Vendor portal, invoice viewing, Pay Now
│   ├── settings_page.py        # Company configuration, fiscal lock, RBAC checks
│   └── chat_widget_page.py     # AI Help Assistant floating drawer & DB queries
│
└── tests/                      # Feature-wise Pytest Test Files
    ├── test_01_auth.py           # Authentication & role-based redirects
    ├── test_02_dashboard.py      # App dashboard metrics & feeds
    ├── test_03_contacts.py       # Customer & Vendor management
    ├── test_04_products.py       # Furniture catalog & inventory tracking
    ├── test_05_accounts.py       # General accounting configuration
    ├── test_06_purchases.py      # Purchase Orders & Vendor Bills
    ├── test_07_sales.py          # Sales Orders & Customer Invoices
    ├── test_08_payments.py       # Payments ledger & manual payment recording
    ├── test_09_journal_entries.py# Double-entry balance enforcement
    ├── test_10_budgets.py        # Analytical budgeting & achievement
    ├── test_11_reports.py        # Balance Sheet & Profit and Loss statements
    ├── test_12_portal.py         # Customer/Vendor portal isolation
    ├── test_13_settings_rbac.py  # Admin vs. Accountant RBAC route guards
    └── test_14_ai_assistant.py   # AI Help Assistant floating chatbot widget
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Python >= 3.10
- Node.js >= 18 (for the running LedgerOne application)

### 2. Install Python Dependencies
```bash
# Optional: create a virtual environment
python -m venv .venv
.venv\Scripts\activate      # On Windows
source .venv/bin/activate    # On Linux/macOS

# Install test dependencies
pip install -r scripts/requirements.txt

# Install Playwright browser binaries
playwright install chromium
```

### 3. Ensure LedgerOne Server is Running
In another terminal, start the local development server:
```bash
npm run dev
```
By default, the test suite targets `http://localhost:3000`. You can override this using the `TEST_BASE_URL` environment variable.

---

## ⚡ Unified Workspace Orchestrator

The LedgerOne workspace includes a master orchestrator (`scripts/orchestrate.py`, `orchestrate.bat`, and `npm run` scripts) that manages running tests, pre-flight system diagnostics, database seeding, dev server lifecycle, and test artifact cleanup.

### 1. Interactive Menu (Dashboard Mode)
Simply run without arguments to launch the interactive TUI menu:
```bash
# Via npm
npm run orchestrate

# Or via Windows batch / PowerShell
.\orchestrate
# Or python directly
python scripts/orchestrate.py
```

```
================================================================================
                ⚡ LEDGERONE UNIFIED WORKSPACE ORCHESTRATOR ⚡                  
       Automated Testing • Health Checks • Data Seeding • Service Ops          
================================================================================
  Select an action:
    [1]  Run All E2E Tests (Headless - 14 Suites)
    [2]  Run All E2E Tests (Headed - Visible Browser)
    [3]  Run Specific Feature Suite...
    [4]  Run System Doctor & Preflight Health Check
    [5]  Seed Database (Prisma Seed)
    [6]  Start Next.js Development Server
    [7]  Clean Test Artifacts & Screenshots
    [8]  List All 14 Test Suites & PRD Matrix
    [0]  Exit
--------------------------------------------------------------------------------
```

### 2. Fast NPM Shortcuts
```bash
npm run test:doctor      # Run complete pre-flight check (Node, Python, DB, App Server, Playwright)
npm run test:e2e         # Run all 14 E2E test suites headless
npm run test:e2e:headed  # Run all 14 E2E test suites with visible Chromium browser
npm run test:clean       # Clean old failure screenshots and pytest caches
```

### 3. Command Line Interface (CLI)

Run specific feature suites:
```bash
python scripts/orchestrate.py test -f auth
python scripts/orchestrate.py test -f sales
python scripts/orchestrate.py test -f purchases
python scripts/orchestrate.py test -f budgets
python scripts/orchestrate.py test -s 01              # Run by suite number (01-14)
```

Run in **Headed Mode** (watch the browser in real time):
```bash
python scripts/orchestrate.py test -f auth --headed
```

Generate a standalone HTML Test Report:
```bash
python scripts/orchestrate.py test --html e2e-report.html
```

System Pre-Flight Health Check:
```bash
python scripts/orchestrate.py doctor
```

List All 14 Test Suites & Covered Use Cases:
```bash
python scripts/orchestrate.py list
```

### Option B: Using Pytest Directly

```bash
# Run all tests
pytest scripts/tests

# Run a single feature file
pytest scripts/tests/test_01_auth.py

# Run a specific test function
pytest scripts/tests/test_01_auth.py -k "test_admin_login"

# Run with visible browser
TEST_HEADLESS=false pytest scripts/tests/test_01_auth.py
```

---

## 🔑 Test Credentials (Default Seed)

| Role | Login ID / Email | Password | Target Landing Page |
|---|---|---|---|
| **Administrator** | `admin001` | `Admin123!` | `/dashboard` |
| **Accountant** | `acct001` | `Accountant123!` | `/dashboard` |
| **Portal Customer** | `sarah.mitchell@email.com` (`cust001`) | `Contact123!` | `/portal/dashboard` |

---

## 📸 Failure Screenshots

Whenever a test fails, a full-page screenshot is automatically captured and saved to:
`scripts/screenshots/FAILURE_<test_name>_<timestamp>.png`
