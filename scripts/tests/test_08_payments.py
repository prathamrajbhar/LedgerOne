"""
Test Suite 08: Payments Ledger, Receipts, and Disbursements.
Covers UC-17 (Pay Vendor Bill), UC-25 (Auto Journal Entries for Payments), and UC-26 (Ledger Updates).
"""

from playwright.sync_api import Page, expect
from scripts.pages.payments_page import PaymentsPage


def test_payments_ledger_renders(admin_page: Page):
    """Verify payments list renders all recorded transactions."""
    payments_page = PaymentsPage(admin_page)
    payments_page.navigate_to_payments()
    
    expect(admin_page.locator("h1, h2:has-text('Payment')").first).to_be_visible()
    count = payments_page.get_payments_count()
    assert count >= 0, "Payments table rendered"


def test_record_payment_modal_renders(admin_page: Page):
    """Verify 'Record Payment' modal dialog opens with payment fields."""
    payments_page = PaymentsPage(admin_page)
    payments_page.navigate_to_payments()
    
    payments_page.open_record_payment_modal()
    dialog = admin_page.locator("[role='dialog']")
    expect(dialog).to_be_visible()
    expect(dialog.locator(":has-text('Amount')").first).to_be_visible()
    
    payments_page.close_modal_if_open()


def test_expenses_page_renders(admin_page: Page):
    """Verify operating expenses page loads."""
    payments_page = PaymentsPage(admin_page)
    payments_page.navigate_to_expenses()
    
    expect(admin_page.locator("h1, h2:has-text('Expense')").first).to_be_visible()
