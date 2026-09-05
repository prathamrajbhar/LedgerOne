"""
Budgets Page object for managing planned expenditures and tracking achievement.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class BudgetsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_budgets(self):
        self.navigate_to(ROUTES["budgets"])

    def get_budgets_count(self) -> int:
        return self.get_table_row_count()

    def click_new_budget(self):
        btn = self.page.locator("a:has-text('New Budget'), button:has-text('New Budget')").first
        btn.click()
