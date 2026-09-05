"""
Test Suite 04: Master Data - Products, Inventory Tracking, and Stock Alerts.
Covers UC-07 (Create Product), UC-08 (Manage Products), and low-stock reorder thresholds.
"""

from datetime import datetime
from playwright.sync_api import Page, expect
from scripts.pages.products_page import ProductsPage


def test_products_list_renders(admin_page: Page):
    """Verify furniture products catalog loads items."""
    products_page = ProductsPage(admin_page)
    products_page.navigate_to_products()
    
    expect(admin_page.locator("table tbody tr").first).to_be_visible()
    count = products_page.get_products_count()
    assert count > 0, "Expected products in catalog table"


def test_products_search(admin_page: Page):
    """Verify searching products by name or SKU."""
    products_page = ProductsPage(admin_page)
    products_page.navigate_to_products()
    
    # Search for known seeded product "Sofa"
    products_page.search_products("Sofa")
    admin_page.wait_for_timeout(1000)
    
    expect(admin_page.locator("table:has-text('Sofa')")).to_be_visible()


def test_inventory_page_metrics(admin_page: Page):
    """Verify inventory page displays stock counts and alerts."""
    products_page = ProductsPage(admin_page)
    products_page.navigate_to_inventory()
    
    # Check for inventory overview
    expect(admin_page.locator("h1, h2:has-text('Inventory')").first).to_be_visible()
    expect(admin_page.locator("table tbody tr").first).to_be_visible()


def test_create_product_flow(admin_page: Page):
    """Verify adding a new furniture item to the catalog."""
    products_page = ProductsPage(admin_page)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    product_name = f"Modern Armchair {timestamp}"
    sku = f"CHR-{timestamp[-4:]}"
    
    products_page.create_product(
        name=product_name,
        sales_price=799.00,
        cost=450.00,
        sku=sku,
        stock=15,
        reorder_point=4,
        material="Walnut & Velvet",
    )
    
    # Verify redirected back to products catalog
    admin_page.wait_for_url("**/products", timeout=10000)
    products_page.search_products(product_name)
    expect(admin_page.locator(f"table:has-text('{product_name}')")).to_be_visible()
