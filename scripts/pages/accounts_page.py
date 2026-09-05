"""
Accounts Page object for managing Chart of Accounts, Journals, Analytic Accounts, and Tax Rates.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class AccountsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_chart_of_accounts(self):
        self.navigate_to(ROUTES["accounts"])

    def navigate_to_journals(self):
        self.navigate_to(ROUTES["journals"])

    def navigate_to_analytic_accounts(self):
        self.navigate_to(ROUTES["analytic_accounts"])

    def navigate_to_tax_rates(self):
        self.navigate_to(ROUTES["tax_rates"])

    def get_accounts_count(self) -> int:
        return self.get_table_row_count()

    def get_journals_count(self) -> int:
        return self.get_table_row_count()

    def get_analytic_accounts_count(self) -> int:
        return self.get_table_row_count()

    def get_tax_rates_count(self) -> int:
        return self.get_table_row_count()
