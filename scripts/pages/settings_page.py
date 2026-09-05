"""
Settings Page object for Company Settings, Fiscal Year Locking, and User Management (Admin Only).
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class SettingsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_settings(self):
        self.navigate_to(ROUTES["settings"])

    def is_settings_accessible(self) -> bool:
        """Verify whether settings page loaded without redirection to dashboard."""
        return "/settings" in self.page.url

    def get_company_name_input_value(self) -> str:
        """Return the current company name input value."""
        input_elem = self.page.locator("input[name='companyName'], input[placeholder*='Company Name']").first
        return input_elem.input_value()
