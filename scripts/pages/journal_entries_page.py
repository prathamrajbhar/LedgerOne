"""
Journal Entries Page object for reviewing General Ledger transactions and creating manual journal entries.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class JournalEntriesPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_journal_entries(self):
        self.navigate_to(ROUTES["journal_entries"])

    def navigate_to_transactions(self):
        self.navigate_to(ROUTES["transactions"])

    def get_journal_entries_count(self) -> int:
        return self.get_table_row_count()

    def open_new_journal_entry_modal(self):
        btn = self.page.locator("button:has-text('Create Manual Entry'), button:has-text('Manual Entry'), button:has-text('New Journal Entry')").first
        btn.click()
        expect(self.page.locator("[role='dialog']")).to_be_visible()

    def is_post_button_enabled(self) -> bool:
        """Check if Post / Submit button is enabled (only when debit equals credit)."""
        submit_btn = self.page.locator("[role='dialog'] button:has-text('Post'), [role='dialog'] button:has-text('Create')").first
        return submit_btn.is_enabled()
