"""
Test Suite 13: Company Settings & Role-Based Access Control (RBAC) Verification.
Verifies Administrator system access vs. Accountant restrictions and fiscal period locking.
"""

from playwright.sync_api import Page, expect
from scripts.pages.settings_page import SettingsPage
from scripts.config import ROUTES


def test_admin_settings_access(admin_page: Page):
    """Verify Administrator has full access to company settings."""
    settings = SettingsPage(admin_page)
    settings.navigate_to_settings()
    
    # Must stay on settings (or settings/company-profile)
    admin_page.wait_for_url("**/settings/**", timeout=10000)
    assert settings.is_settings_accessible(), "Admin should access settings"


def test_accountant_settings_restricted(accountant_page: Page):
    """Verify Accountant is blocked from /settings and redirected to dashboard."""
    accountant_page.goto(ROUTES["settings"], wait_until="networkidle")
    
    # Middleware must redirect Accountant to /dashboard
    accountant_page.wait_for_url("**/dashboard", timeout=10000)
    assert "/dashboard" in accountant_page.url, "Accountant must be redirected to /dashboard"
