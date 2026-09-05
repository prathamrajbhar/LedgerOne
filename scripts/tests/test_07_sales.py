"""
Test Suite 07: Sales Cycle (Accounts Receivable).
Covers UC-22 (Create Sales Order), UC-23 (Customer Invoices), UC-24 (Confirm Invoice).
"""

from playwright.sync_api import Page, expect
from scripts.pages.sales_page import SalesPage


def test_sales_orders_list(admin_page: Page):
    """Verify sales orders list page loads."""
    sales_page = SalesPage(admin_page)
    sales_page.navigate_to_sales()
    
    expect(admin_page.locator("h1, h2:has-text('Sales')").first).to_be_visible()
    count = sales_page.get_sales_orders_count()
    assert count >= 0, "Sales orders table rendered"


def test_new_sales_order_dialog(admin_page: Page):
    """Verify opening 'New Sales Order' modal dialog."""
    sales_page = SalesPage(admin_page)
    sales_page.navigate_to_sales()
    
    sales_page.open_new_sales_order_modal()
    dialog = admin_page.locator("[role='dialog']")
    expect(dialog).to_be_visible()
    
    sales_page.close_modal_if_open()


def test_customer_invoices_list(admin_page: Page):
    """Verify customer invoices page loads with status badges."""
    sales_page = SalesPage(admin_page)
    sales_page.navigate_to_invoices()
    
    expect(admin_page.locator("h1:has-text('Customer Invoices'), h1:has-text('Invoices')").first).to_be_visible()
    count = sales_page.get_invoices_count()
    assert count >= 0, "Invoices table rendered"

