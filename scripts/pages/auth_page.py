"""
Auth Page object for login, signup, password recovery, and logout flows.
"""

from playwright.sync_api import Page, expect
from scripts.pages.base_page import BasePage
from scripts.config import ROUTES, NAVIGATION_TIMEOUT_MS


class AuthPage(BasePage):
    def __init__(self, page: Page):
        super().__init__(page)

    def navigate_to_login(self):
        self.page.goto(ROUTES["login"], wait_until="networkidle")
        self.page.wait_for_selector("button[type='submit']", state="visible")

    def navigate_to_signup(self):
        self.navigate_to(ROUTES["sign_up"])

    def navigate_to_forgot_password(self):
        self.navigate_to(ROUTES["forgot_password"])

    def login(self, login_id_or_email: str, password: str):
        """Perform login action with given credentials."""
        self.navigate_to_login()
        
        # Fill login ID or email
        login_input = self.page.locator("input[placeholder*='cust006'], input[type='text']").first
        login_input.fill(login_id_or_email)
        
        # Fill password
        password_input = self.page.locator("input[type='password']").first
        password_input.fill(password)
        
        # Click Sign In button
        submit_btn = self.page.locator("button[type='submit']").first
        submit_btn.click()

    def signup(self, login_id: str, email: str, password: str, confirm_password: str, name: str = "Test User"):
        """Perform self-registration as an Accountant."""
        self.navigate_to_signup()
        
        # Fill fields
        self.page.locator("input[name='loginId'], input[placeholder*='login']").fill(login_id)
        self.page.locator("input[name='name'], input[placeholder*='Name']").fill(name)
        self.page.locator("input[type='email'], input[name='email']").fill(email)
        
        passwords = self.page.locator("input[type='password']")
        if passwords.count() >= 2:
            passwords.nth(0).fill(password)
            passwords.nth(1).fill(confirm_password)
        else:
            self.page.locator("input[name='password']").fill(password)
            self.page.locator("input[name='confirmPassword']").fill(confirm_password)
            
        submit_btn = self.page.locator("button[type='submit']").first
        submit_btn.click()

    def logout(self):
        """Click user menu in top navbar and sign out."""
        # Find user avatar / menu in navbar
        user_trigger = self.page.locator("header button:has(.rounded-full), header button:has-text('Administrator'), header button:has-text('Accountant')").first
        user_trigger.click()
        
        # Click Logout in dropdown menu
        logout_btn = self.page.locator("[role='menuitem']:has-text('Logout'), [role='menuitem']:has-text('Log out'), [role='menuitem']:has-text('Sign Out')").first
        logout_btn.click()
        self.page.wait_for_url("**/login", timeout=NAVIGATION_TIMEOUT_MS)
