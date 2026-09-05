"""
Global configuration for LedgerOne Playwright E2E test suite.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load local environment if .env exists
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
load_dotenv(PROJECT_ROOT / ".env")

# Target Application URL (purely from .env)
BASE_URL = (os.getenv("TEST_BASE_URL") or os.getenv("NEXTAUTH_URL") or "").rstrip("/")

# Timeouts in milliseconds
DEFAULT_TIMEOUT_MS = int(os.getenv("TEST_TIMEOUT_MS", "25000"))
NAVIGATION_TIMEOUT_MS = int(os.getenv("TEST_NAV_TIMEOUT_MS", "40000"))
SHORT_TIMEOUT_MS = 5000

# Headed vs Headless default
HEADLESS = os.getenv("TEST_HEADLESS", "true").lower() in ("1", "true", "yes")

# Screenshots directory
SCREENSHOTS_DIR = BASE_DIR / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

# Default Test User Credentials (from prisma/seed.ts)
CREDENTIALS = {
    "admin": {
        "login_id": "admin001",
        "email": "admin@ledgerone.in",
        "password": os.getenv("TEST_ADMIN_PASSWORD", "Admin123!"),
        "name": "Administrator",
        "role": "ADMINISTRATOR",
    },
    "accountant": {
        "login_id": "acct001",
        "email": "accountant@ledgerone.in",
        "password": os.getenv("TEST_ACCOUNTANT_PASSWORD", "Accountant123!"),
        "name": "Accountant",
        "role": "ACCOUNTANT",
    },
    "portal_customer": {
        "login_id": "cust001",
        "email": "sarah.mitchell@email.com",
        "password": os.getenv("TEST_PORTAL_PASSWORD", "Contact123!"),
        "name": "Sarah Mitchell",
        "role": "CONTACT",
    },
}

# Routes definition
ROUTES = {
    # Public & Auth
    "login": f"{BASE_URL}/login",
    "portal_login": f"{BASE_URL}/portal/login",
    "sign_up": f"{BASE_URL}/sign-up",
    "forgot_password": f"{BASE_URL}/forgot-password",
    
    # Workspace
    "dashboard": f"{BASE_URL}/dashboard",
    "contacts": f"{BASE_URL}/contacts",
    "contacts_new": f"{BASE_URL}/contacts/new",
    "products": f"{BASE_URL}/products",
    "products_new": f"{BASE_URL}/products/new",
    "inventory": f"{BASE_URL}/inventory",
    "purchases": f"{BASE_URL}/purchases",
    "bills": f"{BASE_URL}/bills",
    "sales": f"{BASE_URL}/sales",
    "invoices": f"{BASE_URL}/invoices",
    "payments": f"{BASE_URL}/payments",
    "expenses": f"{BASE_URL}/expenses",
    "accounts": f"{BASE_URL}/accounts",
    "journals": f"{BASE_URL}/journals",
    "journal_entries": f"{BASE_URL}/journal-entries",
    "transactions": f"{BASE_URL}/transactions",
    "budgets": f"{BASE_URL}/budgets",
    "financial_reports": f"{BASE_URL}/financial-reports",
    "reports": f"{BASE_URL}/reports",
    "tax_rates": f"{BASE_URL}/tax-rates",
    "analytic_accounts": f"{BASE_URL}/analytic-accounts",
    "settings": f"{BASE_URL}/settings",
    "profile": f"{BASE_URL}/profile",
    
    # Portal
    "portal_dashboard": f"{BASE_URL}/portal/dashboard",
    "portal_invoices": f"{BASE_URL}/portal/invoices",
    "portal_bills": f"{BASE_URL}/portal/bills",
    "portal_payments": f"{BASE_URL}/portal/payments",
    "portal_profile": f"{BASE_URL}/portal/profile",
}
