"""
Dashboard Page object for verifying ERP metrics, KPI cards, and activity.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class DashboardPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_dashboard(self):
        self.navigate_to(ROUTES["dashboard"])

    def get_greeting_text(self) -> str:
        """Return the welcome greeting message header."""
        greeting = self.page.locator("h1, h2:has-text('Welcome'), h2:has-text('Good')").first
        return greeting.inner_text()

    def get_kpi_cards(self):
        """Return locators for metric cards (Revenue, Expenses, Profit, etc.)."""
        return self.page.locator("[class*='rounded']:has-text('Revenue'), [class*='rounded']:has-text('Expenses'), [class*='rounded']:has-text('Profit'), [class*='rounded']:has-text('Receivable')")

    def has_inventory_alerts(self) -> bool:
        """Check if any low-stock warning banners or alerts are visible."""
        alerts = self.page.locator(":has-text('Low Stock'), :has-text('Out of Stock')")
        return alerts.count() > 0

    def get_recent_transactions_count(self) -> int:
        """Return count of rows in the recent transactions widget."""
        return self.page.locator("table tbody tr").count()
