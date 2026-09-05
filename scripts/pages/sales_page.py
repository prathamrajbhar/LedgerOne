"""
Sales Page object for Sales Orders and Customer Invoices.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class SalesPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_sales(self):
        self.navigate_to(ROUTES["sales"])

    def navigate_to_invoices(self):
        self.navigate_to(ROUTES["invoices"])
        self.page.wait_for_selector("h1:has-text('Customer Invoices'), h1:has-text('Invoices'), table, p:has-text('No invoices')", timeout=20000)

    def get_sales_orders_count(self) -> int:
        return self.get_table_row_count()

    def get_invoices_count(self) -> int:
        return self.get_table_row_count()

    def open_new_sales_order_modal(self):
        """Click 'New Sales Order' button."""
        btn = self.page.locator("button:has-text('New Sales Order')").first
        btn.click()
        expect(self.page.locator("[role='dialog']")).to_be_visible()

    def open_new_invoice_modal(self):
        """Click 'New Invoice' or 'Create Invoice' button."""
        btn = self.page.locator("button:has-text('New Invoice'), button:has-text('Create Invoice')").first
        btn.click()
        expect(self.page.locator("[role='dialog']")).to_be_visible()
