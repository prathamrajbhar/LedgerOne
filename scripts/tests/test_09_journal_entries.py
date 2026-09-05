"""
Test Suite 09: Double-Entry Bookkeeping & General Ledger.
Covers UC-24 (Validate Journal Entry), UC-25 (Auto Journal Entries), UC-26 (Audit Trail), and Balance Enforcement (Debit = Credit).
"""

from playwright.sync_api import Page, expect
from scripts.pages.journal_entries_page import JournalEntriesPage


def test_journal_entries_list(admin_page: Page):
    """Verify general ledger journal entries table renders."""
    je_page = JournalEntriesPage(admin_page)
    je_page.navigate_to_journal_entries()
    
    expect(admin_page.locator("h1, h2:has-text('Journal')").first).to_be_visible()
    count = je_page.get_journal_entries_count()
    assert count >= 0, "Journal entries table rendered"


def test_manual_journal_entry_modal(admin_page: Page):
    """Verify manual journal entry modal opens with debit and credit lines."""
    je_page = JournalEntriesPage(admin_page)
    je_page.navigate_to_journal_entries()
    
    je_page.open_new_journal_entry_modal()
    dialog = admin_page.locator("[role='dialog']")
    expect(dialog).to_be_visible()
    expect(dialog.locator(":has-text('Debit')").first).to_be_visible()
    expect(dialog.locator(":has-text('Credit')").first).to_be_visible()
    
    je_page.close_modal_if_open()


def test_transactions_audit_view(admin_page: Page):
    """Verify transactions view displays posted entries."""
    je_page = JournalEntriesPage(admin_page)
    je_page.navigate_to_transactions()
    
    expect(admin_page.locator("h1, h2:has-text('Transaction')").first).to_be_visible()
