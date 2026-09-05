"""
Contacts Page object for managing Customers, Vendors, and Portal Invitations.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES


class ContactsPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_contacts(self):
        self.navigate_to(ROUTES["contacts"])

    def navigate_to_new_contact(self):
        self.navigate_to(ROUTES["contacts_new"])

    def search_contact(self, query: str):
        """Type search query into the contacts search input."""
        search_input = self.page.locator("input[placeholder*='Search']").first
        search_input.fill(query)
        self.page.wait_for_timeout(500)

    def filter_by_type(self, contact_type: str):
        """Filter list by Customer / Vendor / All."""
        # Find type filter select or trigger
        type_trigger = self.page.locator("button:has-text('All Types'), button:has-text('All Contacts'), [role='combobox']:has-text('All')").first
        if type_trigger.is_visible():
            type_trigger.click()
            self.page.locator(f"[role='option']:has-text('{contact_type}')").first.click()

    def create_contact(self, name: str, email: str, contact_type: str = "CUSTOMER", phone: str = "555-0199", address: str = "123 Business Way"):
        """Create a new contact from the /contacts/new page."""
        self.navigate_to_new_contact()
        self.page.wait_for_selector("input[placeholder*='Modern Living'], input#contact-\\/-company-name")
        
        # Fill name
        self.page.locator("input[placeholder*='Modern Living'], input#contact-\\/-company-name").first.fill(name)
        
        # Fill email
        self.page.locator("input[type='email'], input[placeholder*='billing@company.com']").first.fill(email)
        
        # Fill phone
        phone_input = self.page.locator("input[placeholder*='98765'], input#phone-number").first
        if phone_input.is_visible():
            phone_input.fill(phone)
            
        # Fill address
        addr_input = self.page.locator("textarea[placeholder*='warehouse address'], textarea").first
        if addr_input.is_visible():
            addr_input.fill(address)
            
        # Select Type if not default CUSTOMER
        if contact_type != "CUSTOMER":
            type_select = self.page.locator("button[role='combobox']").first
            if type_select.is_visible():
                type_select.click()
                self.page.wait_for_timeout(300)
                option = self.page.locator(f"[role='option']:has-text('{contact_type}'), [role='option']:has-text('{contact_type.title()}')").first
                if option.is_visible():
                    option.click()
                
        # Submit via 'Create Contact' action button
        submit_btn = self.page.locator("button:has-text('Create Contact')").first
        submit_btn.click()

