"""
Purchases Page object for Purchase Orders and Vendor Bills.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class PurchasesPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_purchases(self):
        self.navigate_to(ROUTES["purchases"])

    def navigate_to_bills(self):
        self.navigate_to(ROUTES["bills"])
        self.page.wait_for_selector("h1:has-text('Vendor Bills'), table, p:has-text('No vendor bills')", timeout=20000)

    def open_new_purchase_order_modal(self):
        """Click 'New Purchase Order' button to open creation dialog."""
        btn = self.page.locator("button:has-text('New Purchase Order'), button:has-text('Create Purchase Order')").first
        btn.click()
        expect(self.page.locator("[role='dialog']")).to_be_visible()

    def get_purchase_orders_count(self) -> int:
        return self.get_table_row_count()

    def get_vendor_bills_count(self) -> int:
        return self.get_table_row_count()
