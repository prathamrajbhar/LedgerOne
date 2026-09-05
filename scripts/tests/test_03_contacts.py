"""
Test Suite 03: Master Data - Contacts Management (Customers & Vendors).
Covers UC-04 (Create Contact), UC-05 (Manage Contacts), UC-06 (Portal Access Invitation).
"""

from datetime import datetime
from playwright.sync_api import Page, expect
from scripts.pages.contacts_page import ContactsPage


def test_contacts_list_renders(admin_page: Page):
    """Verify contacts directory loads seeded contacts."""
    contacts_page = ContactsPage(admin_page)
    contacts_page.navigate_to_contacts()
    
    # Assert table exists and contains contact rows
    expect(admin_page.locator("table tbody tr").first).to_be_visible()
    row_count = contacts_page.get_table_row_count()
    assert row_count > 0, "Expected contacts in table"


def test_contacts_search(admin_page: Page):
    """Verify searching filters the contact list."""
    contacts_page = ContactsPage(admin_page)
    contacts_page.navigate_to_contacts()
    
    # Search for known seeded vendor "Premium Wood"
    contacts_page.search_contact("Wood")
    admin_page.wait_for_timeout(1000)
    
    filtered_count = contacts_page.get_table_row_count()
    assert filtered_count >= 1, "Expected at least one matching contact for 'Wood'"


def test_create_contact_flow(admin_page: Page):
    """Verify creating a new customer contact."""
    contacts_page = ContactsPage(admin_page)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    contact_name = f"Test Client {timestamp}"
    contact_email = f"test_{timestamp}@client.com"
    
    contacts_page.create_contact(
        name=contact_name,
        email=contact_email,
        contact_type="CUSTOMER",
        phone="555-0144",
        address="456 Innovation Blvd",
    )
    
    # Verify redirected back to contacts list or success toast
    admin_page.wait_for_url("**/contacts", timeout=10000)
    contacts_page.search_contact(contact_name)
    expect(admin_page.locator(f"table:has-text('{contact_name}')")).to_be_visible()
