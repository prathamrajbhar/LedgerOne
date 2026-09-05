"""
Products Page object for viewing furniture catalog, inventory, and adding products.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class ProductsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_products(self):
        self.navigate_to(ROUTES["products"])

    def navigate_to_new_product(self):
        self.navigate_to(ROUTES["products_new"])

    def navigate_to_inventory(self):
        self.navigate_to(ROUTES["inventory"])

    def search_products(self, query: str):
        """Search products by name or SKU."""
        search_input = self.page.locator("input[placeholder*='Search']").first
        search_input.fill(query)
        self.page.wait_for_timeout(500)

    def filter_by_category(self, category_name: str):
        """Filter products by selected category dropdown."""
        category_select = self.page.locator("[role='combobox']:has-text('All Categories'), button:has-text('Categories')").first
        if category_select.is_visible():
            category_select.click()
            self.page.locator(f"[role='option']:has-text('{category_name}')").first.click()

    def get_products_count(self) -> int:
        """Return row count in products table."""
        return self.get_table_row_count()

    def create_product(
        self,
        name: str,
        sales_price: float,
        cost: float,
        sku: str = "TEST-SKU-001",
        stock: int = 10,
        reorder_point: int = 3,
        material: str = "Solid Oak",
    ):
        """Create a new furniture product."""
        self.navigate_to_new_product()
        self.page.wait_for_selector("input#product-name, input[placeholder*='Teak Wood']")
        
        # Fill product name
        self.page.locator("input#product-name, input[placeholder*='Teak Wood']").first.fill(name)
        
        # Fill SKU
        sku_input = self.page.locator("input#sku-code, input[placeholder*='FUR-DIN']").first
        if sku_input.is_visible():
            sku_input.fill(sku)
            
        # Fill selling price
        sales_price_input = self.page.locator("input#selling-price-\\(\\₹\\), input[placeholder='32000']").first
        sales_price_input.fill(str(sales_price))
        
        # Fill cost price
        cost_input = self.page.locator("input#cost-price-\\(\\₹\\), input[placeholder='18500']").first
        if cost_input.is_visible():
            cost_input.fill(str(cost))
            
        # Fill stock count
        stock_input = self.page.locator("input#initial-stock-count").first
        if stock_input.is_visible():
            stock_input.fill(str(stock))
            
        # Fill reorder point
        reorder_input = self.page.locator("input#reorder-alert-point").first
        if reorder_input.is_visible():
            reorder_input.fill(str(reorder_point))
            
        # Fill material if present
        material_input = self.page.locator("input#material-\\/-finish").first
        if material_input.is_visible():
            material_input.fill(material)
            
        # Submit form via 'Save Product' button
        submit_btn = self.page.locator("button:has-text('Save Product')").first
        submit_btn.click()

