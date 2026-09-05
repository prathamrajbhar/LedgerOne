"""
Test Suite 02: ERP Workspace Dashboard and Real-Time Business Metrics.
Verifies KPI metric cards, revenue/expense summaries, inventory warnings, and transaction feeds.
"""

from playwright.sync_api import Page, expect
from scripts.pages.dashboard_page import DashboardPage


def test_dashboard_kpis_render(admin_page: Page):
    """Verify primary financial KPI cards render on dashboard."""
    dashboard = DashboardPage(admin_page)
    dashboard.navigate_to_dashboard()
    
    # Assert KPI cards container is loaded
    kpi_cards = dashboard.get_kpi_cards()
    expect(kpi_cards.first).to_be_visible()
    assert kpi_cards.count() >= 2, "Expected at least 2 KPI metric cards on dashboard"


def test_dashboard_user_greeting(admin_page: Page):
    """Verify dashboard displays personalized welcome greeting."""
    dashboard = DashboardPage(admin_page)
    dashboard.navigate_to_dashboard()
    greeting = dashboard.get_greeting_text()
    assert len(greeting) > 0, "Expected greeting text on dashboard header"


def test_dashboard_recent_activity_section(admin_page: Page):
    """Verify recent transactions or activity overview table is visible."""
    dashboard = DashboardPage(admin_page)
    dashboard.navigate_to_dashboard()
    
    # Check for activity or transactions container
    activity_section = admin_page.locator(":has-text('Recent Transactions'), :has-text('Recent Activity'), :has-text('Monthly Overview')")
    expect(activity_section.first).to_be_visible()
