"""
Base Page object providing foundational interactions and assertions across LedgerOne.
"""

from typing import List, Optional
from playwright.sync_api import Page, Locator, expect
from scripts.config import DEFAULT_TIMEOUT_MS, SHORT_TIMEOUT_MS


class BasePage:
    def __init__(self, page: Page):
        self.page = page

    def navigate_to(self, url: str):
        """Navigate to a URL and wait for DOM and network stabilization."""
        self.page.goto(url, wait_until="networkidle")

    def wait_for_loading_complete(self):
        """Wait for any spinners or loading skeletons to disappear."""
        # Check for Lucide spin or skeleton elements
        spinner = self.page.locator(".animate-spin")
        if spinner.count() > 0:
            try:
                spinner.first.wait_for(state="detached", timeout=SHORT_TIMEOUT_MS)
            except Exception:
                pass

    def get_toast_message(self, timeout_ms: int = SHORT_TIMEOUT_MS) -> Optional[str]:
        """Capture the text of an active Sonner toast notification."""
        toast_locator = self.page.locator("[data-sonner-toast], [role='status']").first
        try:
            toast_locator.wait_for(state="visible", timeout=timeout_ms)
            return toast_locator.inner_text()
        except Exception:
            return None

    def expect_toast_contains(self, text: str, timeout_ms: int = DEFAULT_TIMEOUT_MS):
        """Assert that a toast notification appears containing the given text."""
        toast = self.page.locator(f"[data-sonner-toast]:has-text('{text}'), [role='status']:has-text('{text}')").first
        expect(toast).to_be_visible(timeout=timeout_ms)

    def get_table_rows(self, table_selector: str = "table tbody tr") -> Locator:
        """Return the locator for table body rows."""
        return self.page.locator(table_selector)

    def get_table_row_count(self, table_selector: str = "table tbody tr") -> int:
        """Count rows in a table body."""
        return self.page.locator(table_selector).count()

    def click_button_by_text(self, text: str, exact: bool = False):
        """Click a button identified by its visible text label."""
        btn = self.page.get_by_role("button", name=text, exact=exact)
        btn.click()

    def get_page_header_title(self) -> str:
        """Return current page header h1/h2 title text."""
        header = self.page.locator("h1, h2").first
        return header.inner_text()

    def is_modal_open(self) -> bool:
        """Check if a Radix dialog or modal overlay is visible."""
        dialog = self.page.locator("[role='dialog']")
        return dialog.count() > 0 and dialog.first.is_visible()

    def close_modal_if_open(self):
        """Close open modal by pressing Escape."""
        if self.is_modal_open():
            self.page.keyboard.press("Escape")
