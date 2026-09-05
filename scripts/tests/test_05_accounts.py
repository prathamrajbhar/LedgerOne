"""
Test Suite 05: Master Data - Accounting Setup.
Covers UC-18 (Chart of Accounts), UC-19 (Journals), UC-20 (Analytic Accounts), UC-21 (Tax Rates).
"""

from playwright.sync_api import Page, expect
from scripts.pages.accounts_page import AccountsPage


def test_chart_of_accounts_renders(admin_page: Page):
    """Verify Chart of Accounts displays account classifications (Assets, Liabilities, Equity, etc.)."""
    accounts_page = AccountsPage(admin_page)
    accounts_page.navigate_to_chart_of_accounts()
    
    expect(admin_page.locator("table tbody tr").first).to_be_visible()
    count = accounts_page.get_accounts_count()
    assert count >= 10, "Expected full chart of accounts with standard codes"


def test_journals_list_renders(admin_page: Page):
    """Verify standard journals (Sales, Purchase, Bank, Cash) are configured."""
    accounts_page = AccountsPage(admin_page)
    accounts_page.navigate_to_journals()
    
    expect(admin_page.locator("table tbody tr").first).to_be_visible()
    expect(admin_page.locator("table:has-text('Sales')")).to_be_visible()
    expect(admin_page.locator("table:has-text('Purchase')")).to_be_visible()
    expect(admin_page.locator("table:has-text('Bank')")).to_be_visible()
    expect(admin_page.locator("table:has-text('Cash')")).to_be_visible()


def test_analytic_accounts_list(admin_page: Page):
    """Verify cost centers and departments for budgeting are present."""
    accounts_page = AccountsPage(admin_page)
    accounts_page.navigate_to_analytic_accounts()
    
    expect(admin_page.locator("table tbody tr").first).to_be_visible()
    count = accounts_page.get_analytic_accounts_count()
    assert count > 0, "Expected analytic accounts for project/cost tracking"


def test_tax_rates_list(admin_page: Page):
    """Verify tax rate configurations are available."""
    accounts_page = AccountsPage(admin_page)
    accounts_page.navigate_to_tax_rates()
    
    expect(admin_page.locator("table tbody tr").first).to_be_visible()
    count = accounts_page.get_tax_rates_count()
    assert count > 0, "Expected tax rates configured"
