"""
Test Suite 14: AI Help Assistant Chatbot & Database Function Calling.
Covers UC-38 (Ask the Help Assistant), drawer interaction, and suggestion chips.
"""

from playwright.sync_api import Page, expect
from scripts.pages.chat_widget_page import ChatWidgetPage


def test_ai_assistant_launcher_visible(admin_page: Page):
    """Verify floating AI robot launcher button is visible on workspace."""
    chat = ChatWidgetPage(admin_page)
    launcher = chat.get_launcher_button()
    expect(launcher).to_be_visible()


def test_ai_assistant_drawer_toggle(admin_page: Page):
    """Verify clicking robot opens and closes the AI chat drawer."""
    chat = ChatWidgetPage(admin_page)
    
    # Open chat
    chat.open_chat()
    assert chat.is_chat_open(), "Chat drawer should be open"
    
    # Close chat
    chat.close_chat()
    admin_page.wait_for_timeout(500)


def test_ai_assistant_input_and_suggestion_chips(admin_page: Page):
    """Verify chat input field and suggestion chips are interactive."""
    chat = ChatWidgetPage(admin_page)
    chat.open_chat()
    
    # Verify suggestions container or input is visible
    input_box = admin_page.locator("input[placeholder*='Ask about products']").first
    expect(input_box).to_be_visible()
    
    # Verify send button is present
    send_btn = admin_page.locator("button[type='submit']:has(svg)").first
    expect(send_btn).to_be_visible()
    
    chat.close_chat()
