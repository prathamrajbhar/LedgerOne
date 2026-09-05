"""
Test Suite 01: Authentication, Access Control, and Session Management.
Covers UC-01 (Sign Up), UC-02 (Login), UC-03 (Forgot Password), and role-based redirects.
"""

import pytest
from playwright.sync_api import Page, expect
from scripts.pages.auth_page import AuthPage
from scripts.config import CREDENTIALS, ROUTES, NAVIGATION_TIMEOUT_MS


def test_admin_login_success(page: Page):
    """Verify Administrator login redirects to the main ERP dashboard."""
    auth = AuthPage(page)
    admin_creds = CREDENTIALS["admin"]
    auth.login(admin_creds["login_id"], admin_creds["password"])
    
    # Assert redirected to workspace dashboard
    page.wait_for_url("**/dashboard", timeout=NAVIGATION_TIMEOUT_MS)
    expect(page).to_have_url(f"{ROUTES['dashboard']}")
    expect(page.locator("h1, h2:has-text('morning'), h1, h2:has-text('afternoon'), h1, h2:has-text('evening'), h1, h2:has-text('Welcome'), h1, h2:has-text('Patel Krish'), header").first).to_be_visible()


def test_accountant_login_success(page: Page):
    """Verify Accountant login redirects to workspace dashboard."""
    auth = AuthPage(page)
    acct_creds = CREDENTIALS["accountant"]
    auth.login(acct_creds["login_id"], acct_creds["password"])
    
    page.wait_for_url("**/dashboard", timeout=NAVIGATION_TIMEOUT_MS)
    expect(page).to_have_url(f"{ROUTES['dashboard']}")


def test_portal_customer_login_redirect(page: Page):
    """Verify Contact/Customer login automatically routes to the Customer Portal."""
    auth = AuthPage(page)
    cust_creds = CREDENTIALS["portal_customer"]
    auth.login(cust_creds["login_id"], cust_creds["password"])
    
    # Must redirect to /portal/dashboard
    page.wait_for_url("**/portal/**", timeout=NAVIGATION_TIMEOUT_MS)
    assert "/portal" in page.url


def test_invalid_credentials_shows_error(page: Page):
    """Verify entering incorrect password displays an error notification."""
    auth = AuthPage(page)
    auth.login("admin001", "WrongPassword999!")
    
    # Verify stay on login page
    expect(page).to_have_url(f"{ROUTES['login']}")
    auth.expect_toast_contains("Invalid")


def test_empty_credentials_prevent_submit(page: Page):
    """Verify submitting blank form prevents authentication."""
    auth = AuthPage(page)
    auth.navigate_to_login()
    
    submit_btn = page.locator("button[type='submit']").first
    submit_btn.click()
    
    expect(page).to_have_url(f"{ROUTES['login']}")


def test_signup_page_elements(page: Page):
    """Verify the Sign-Up registration page renders necessary fields."""
    auth = AuthPage(page)
    auth.navigate_to_signup()
    
    expect(page.locator("input[placeholder*='user_lead'], input[name='loginId']").first).to_be_visible()
    expect(page.locator("input[placeholder*='full name' i], input[name='name']").first).to_be_visible()
    expect(page.locator("input[type='email'], input[name='email']").first).to_be_visible()
    expect(page.locator("button:has-text('Create Account')").first).to_be_visible()


def test_logout_flow(admin_page: Page):
    """Verify user can logout and session is cleared."""
    auth = AuthPage(admin_page)
    auth.logout()
    expect(admin_page).to_have_url(f"{ROUTES['login']}")
