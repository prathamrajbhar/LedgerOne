"""
Chat Widget Page object for interacting with the AI Help Assistant.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage


class ChatWidgetPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def get_launcher_button(self):
        """Locate the floating robot toggle button in the bottom right."""
        return self.page.locator("button:has(svg.animate-robo-jump), button:has-text('Ask AI'), .fixed.bottom-6.right-6 button").first

    def open_chat(self):
        """Click launcher button to open the chat drawer."""
        launcher = self.get_launcher_button()
        launcher.click()
        # Expect input or card to be visible
        chat_input = self.page.locator("input[placeholder*='Ask about products']").first
        expect(chat_input).to_be_visible()

    def close_chat(self):
        """Click close / toggle button."""
        close_btn = self.page.locator("button[aria-label='Close Help Assistant'], button:has(svg.lucide-x)").first
        if close_btn.is_visible():
            close_btn.click()

    def is_chat_open(self) -> bool:
        """Check if chat drawer is visible."""
        input_elem = self.page.locator("input[placeholder*='Ask about products']").first
        return input_elem.is_visible()

    def send_message(self, text: str):
        """Type message and submit form."""
        input_elem = self.page.locator("input[placeholder*='Ask about products']").first
        input_elem.fill(text)
        send_btn = self.page.locator("button[type='submit']:has(svg.lucide-send)").first
        send_btn.click()

    def get_messages_count(self) -> int:
        """Return count of message bubbles."""
        return self.page.locator(".fixed.bottom-6.right-6 .animate-in").count()
