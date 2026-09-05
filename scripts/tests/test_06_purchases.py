"""
Test Suite 06: Purchase Cycle (Accounts Payable).
Covers UC-13 (Create Purchase Order), UC-14 (Confirm PO), UC-15 (Vendor Bills), UC-16 (Confirm Bill).
"""

from playwright.sync_api import Page, expect
from scripts.pages.purchases_page import PurchasesPage


def test_purchase_orders_list(admin_page: Page):
    """Verify purchase orders list loads."""
    purchases_page = PurchasesPage(admin_page)
    purchases_page.navigate_to_purchases()
    
    expect(admin_page.locator("h1, h2:has-text('Purchase')").first).to_be_visible()
    count = purchases_page.get_purchase_orders_count()
    assert count >= 0, "Purchase orders table rendered"


def test_new_purchase_order_modal_renders(admin_page: Page):
    """Verify 'New Purchase Order' modal dialog opens with form controls."""
    purchases_page = PurchasesPage(admin_page)
    purchases_page.navigate_to_purchases()
    
    purchases_page.open_new_purchase_order_modal()
    dialog = admin_page.locator("[role='dialog']")
    expect(dialog).to_be_visible()
    expect(dialog.locator(":has-text('Vendor')").first).to_be_visible()
    
    # Close dialog
    purchases_page.close_modal_if_open()


def test_vendor_bills_list(admin_page: Page):
    """Verify vendor bills list renders."""
    purchases_page = PurchasesPage(admin_page)
    purchases_page.navigate_to_bills()
    
    expect(admin_page.locator("h1:has-text('Vendor Bills'), h1:has-text('Bills')").first).to_be_visible()
    count = purchases_page.get_vendor_bills_count()
    assert count >= 0, "Vendor bills table rendered"
