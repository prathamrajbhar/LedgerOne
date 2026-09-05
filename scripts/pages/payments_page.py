"""
Payments Page object for managing Receipts, Vendor Payments, and Expenses.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class PaymentsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_payments(self):
        self.navigate_to(ROUTES["payments"])

    def navigate_to_expenses(self):
        self.navigate_to(ROUTES["expenses"])

    def get_payments_count(self) -> int:
        return self.get_table_row_count()

    def open_record_payment_modal(self):
        btn = self.page.locator("button:has-text('Record Payment')").first
        btn.click()
        expect(self.page.locator("[role='dialog']")).to_be_visible()
