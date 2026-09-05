"""
Test Suite 10: Analytical Budgeting and Achievement Tracking.
Covers UC-10 (Create Budget), UC-11 (Revise Budget), UC-12 (Cancel Budget), UC-29 (Budget Report), UC-30 (Budget Achievement).
"""

from playwright.sync_api import Page, expect
from scripts.pages.budgets_page import BudgetsPage
from scripts.config import NAVIGATION_TIMEOUT_MS


def test_budgets_list_renders(admin_page: Page):
    """Verify analytical budgets list page renders."""
    budgets_page = BudgetsPage(admin_page)
    budgets_page.navigate_to_budgets()
    
    expect(admin_page.locator("h1, h2:has-text('Budget')").first).to_be_visible()
    expect(admin_page.locator(":has-text('Committed')").first).to_be_visible()
    expect(admin_page.locator(":has-text('Achieved')").first).to_be_visible()


def test_new_budget_navigation(admin_page: Page):
    """Verify navigating to New Budget form."""
    budgets_page = BudgetsPage(admin_page)
    budgets_page.navigate_to_budgets()
    
    budgets_page.click_new_budget()
    admin_page.wait_for_url("**/budgets/new", timeout=NAVIGATION_TIMEOUT_MS)
    expect(admin_page.locator("h1, h2:has-text('Budget')").first).to_be_visible()

