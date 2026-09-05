"""
Test Suite 11: Real-Time Financial Reporting.
Covers UC-27 (Balance Sheet) and UC-28 (Profit & Loss).
"""

from playwright.sync_api import Page, expect
from scripts.pages.reports_page import ReportsPage


def test_profit_and_loss_report_renders(admin_page: Page):
    """Verify Profit & Loss financial statement renders."""
    reports_page = ReportsPage(admin_page)
    reports_page.navigate_to_financial_reports()
    
    expect(admin_page.locator("h1, h2:has-text('Report')").first).to_be_visible()
    assert reports_page.is_profit_loss_displayed(), "Expected P&L statement to be visible"


def test_balance_sheet_report_renders(admin_page: Page):
    """Verify Balance Sheet financial statement renders."""
    reports_page = ReportsPage(admin_page)
    reports_page.navigate_to_financial_reports()
    
    assert reports_page.is_balance_sheet_displayed(), "Expected Balance Sheet statement to be visible"
