"""
Reports Page object for inspecting Profit & Loss and Balance Sheet statements.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class ReportsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_financial_reports(self):
        self.navigate_to(ROUTES["financial_reports"])

    def navigate_to_reports(self):
        self.navigate_to(ROUTES["reports"])

    def is_profit_loss_displayed(self) -> bool:
        """Check if P&L section is visible."""
        return self.page.locator(":has-text('Profit & Loss'), :has-text('Net Profit')").count() > 0

    def is_balance_sheet_displayed(self) -> bool:
        """Check if Balance Sheet section is visible."""
        return self.page.locator(":has-text('Balance Sheet'), :has-text('Total Assets')").count() > 0
