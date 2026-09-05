"""
Portal Page object for Customer and Vendor self-service portal.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class PortalPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_portal_dashboard(self):
        self.navigate_to(ROUTES["portal_dashboard"])

    def navigate_to_portal_invoices(self):
        self.navigate_to(ROUTES["portal_invoices"])

    def navigate_to_portal_bills(self):
        self.navigate_to(ROUTES["portal_bills"])

    def navigate_to_portal_payments(self):
        self.navigate_to(ROUTES["portal_payments"])

    def get_portal_invoices_count(self) -> int:
        return self.get_table_row_count()

    def has_pay_now_button(self) -> bool:
        """Check if any 'Pay Now' button is visible for customer invoices."""
        btn = self.page.locator("button:has-text('Pay Now'), a:has-text('Pay Now')")
        return btn.count() > 0
