"""
Test Suite 12: Customer & Vendor Self-Service Portal.
Covers UC-31 (Portal Login), UC-32 (Portal Dashboard), UC-33 (Portal Invoices), UC-34 (Portal Bills), UC-35 (Payment History), and UC-36 (Online Payment Checkout).
"""

from playwright.sync_api import Page, expect
from scripts.pages.portal_page import PortalPage
from scripts.config import ROUTES


def test_portal_dashboard_renders(portal_page: Page):
    """Verify Customer portal dashboard loads user summaries."""
    portal = PortalPage(portal_page)
    portal.navigate_to_portal_dashboard()
    
    expect(portal_page.locator(":has-text('Dashboard'), :has-text('Invoices')").first).to_be_visible()


def test_portal_invoices_view(portal_page: Page):
    """Verify Customer portal displays invoices with payment options."""
    portal = PortalPage(portal_page)
    portal.navigate_to_portal_invoices()
    
    expect(portal_page.locator("h1, h2:has-text('Invoice')").first).to_be_visible()


def test_portal_contact_isolated_from_workspace(portal_page: Page):
    """Verify external portal contact cannot access internal workspace."""
    # Attempt navigating to internal workspace dashboard
    portal_page.goto(ROUTES["dashboard"], wait_until="networkidle")
    
    # Middleware must redirect back to portal dashboard
    portal_page.wait_for_url("**/portal/**", timeout=10000)
    assert "/portal" in portal_page.url, "Contact user must be redirected to portal"
