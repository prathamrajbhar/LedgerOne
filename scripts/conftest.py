"""
Pytest fixtures and hooks for LedgerOne Playwright test suite.
Provides authenticated browser contexts for Admin, Accountant, and Portal users.
"""

import pytest
from datetime import datetime
from playwright.sync_api import sync_playwright, Browser, BrowserContext, Page
from scripts.config import (
    BASE_URL,
    DEFAULT_TIMEOUT_MS,
    NAVIGATION_TIMEOUT_MS,
    HEADLESS,
    CREDENTIALS,
    ROUTES,
    SCREENSHOTS_DIR,
)


@pytest.fixture(scope="session")
def browser_instance():
    """Launch a single Chromium browser instance for the test session."""
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=HEADLESS,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        yield browser
        browser.close()


@pytest.fixture(scope="function")
def context(browser_instance: Browser):
    """Create an isolated browser context per test function."""
    ctx = browser_instance.new_context(
        viewport={"width": 1280, "height": 800},
        base_url=BASE_URL,
        ignore_https_errors=True,
    )
    ctx.set_default_timeout(DEFAULT_TIMEOUT_MS)
    ctx.set_default_navigation_timeout(NAVIGATION_TIMEOUT_MS)
    yield ctx
    ctx.close()


@pytest.fixture(scope="function")
def page(context: BrowserContext):
    """Fresh, unauthenticated browser page."""
    p = context.new_page()
    yield p
    p.close()


def _login_as_role(context: BrowserContext, role_key: str) -> Page:
    """Helper to authenticate a session for a given role."""
    creds = CREDENTIALS[role_key]
    page = context.new_page()
    
    # Navigate to unified login and wait for full React hydration
    page.goto(ROUTES["login"], wait_until="networkidle")
    
    # Fill login credentials
    login_input = page.locator("input[placeholder*='cust006'], input[type='text']").first
    login_input.fill(creds["login_id"])
    
    password_input = page.locator("input[type='password']").first
    password_input.fill(creds["password"])
    
    # Submit login form
    submit_btn = page.locator("button[type='submit']").first
    submit_btn.click()
    
    # Wait for post-login redirect away from /login
    page.wait_for_url(lambda url: "/login" not in url, timeout=NAVIGATION_TIMEOUT_MS)
    return page


@pytest.fixture(scope="function")
def admin_page(context: BrowserContext) -> Page:
    """Pre-authenticated page with Administrator session."""
    p = _login_as_role(context, "admin")
    yield p
    p.close()


@pytest.fixture(scope="function")
def accountant_page(context: BrowserContext) -> Page:
    """Pre-authenticated page with Accountant session."""
    p = _login_as_role(context, "accountant")
    yield p
    p.close()


@pytest.fixture(scope="function")
def portal_page(context: BrowserContext) -> Page:
    """Pre-authenticated page with Portal Customer session."""
    p = _login_as_role(context, "portal_customer")
    yield p
    p.close()


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture screenshot on test failure."""
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call" and report.failed:
        # Check if page fixture exists in the test function arguments
        for fixture_name in ("page", "admin_page", "accountant_page", "portal_page"):
            page_obj = item.funcargs.get(fixture_name)
            if page_obj and hasattr(page_obj, "screenshot"):
                try:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    clean_name = item.name.replace("/", "_").replace(":", "_")
                    screenshot_path = SCREENSHOTS_DIR / f"FAILURE_{clean_name}_{timestamp}.png"
                    page_obj.screenshot(path=str(screenshot_path), full_page=True)
                    print(f"\n[Screenshot saved]: {screenshot_path}")
                except Exception as e:
                    print(f"\nFailed to capture screenshot: {e}")
                break
