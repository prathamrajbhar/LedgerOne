import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const SCREENSHOT_DIR = "/home/pratham/.gemini/antigravity/brain/7763f321-d88a-4271-b326-624dc9832d12/screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const routesToTest = [
  { name: "00_login", path: "/login" },
  { name: "01_dashboard", path: "/dashboard" },
  { name: "02_contacts_list", path: "/contacts" },
  { name: "03_contacts_new", path: "/contacts/new" },
  { name: "04_products_list", path: "/products" },
  { name: "05_products_new", path: "/products/new" },
  { name: "06_accounts_list", path: "/accounts" },
  { name: "07_accounts_new", path: "/accounts/new" },
  { name: "08_journals_list", path: "/journals" },
  { name: "09_analytic_accounts_list", path: "/analytic-accounts" },
  { name: "10_taxes_list", path: "/tax-rates" },
  { name: "11_purchases_list", path: "/purchases" },
  { name: "12_purchases_new", path: "/purchases/new" },
  { name: "13_bills_list", path: "/bills" },
  { name: "14_bills_new", path: "/bills/new" },
  { name: "15_sales_list", path: "/sales" },
  { name: "16_sales_new", path: "/sales/new" },
  { name: "17_invoices_list", path: "/invoices" },
  { name: "18_invoices_new", path: "/invoices/new" },
  { name: "19_payments_list", path: "/payments" },
  { name: "20_payments_new", path: "/payments/new" },
  { name: "21_journal_entries_list", path: "/journal-entries" },
  { name: "22_journal_entries_new", path: "/journal-entries/new" },
  { name: "23_budgets_list", path: "/budgets" },
  { name: "24_budgets_new", path: "/budgets/new" },
  { name: "25_reports_overview", path: "/reports" },
  { name: "26_reports_balance_sheet", path: "/reports/balance-sheet" },
  { name: "27_reports_profit_loss", path: "/reports/profit-loss" },
  { name: "28_reports_budget_report", path: "/reports/budget-report" },
  { name: "29_settings", path: "/settings" },
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });
  page.on("pageerror", err => {
    errors.push(`[Page Error] ${err.message}`);
  });

  console.log("--- Navigating to Login Page ---");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  console.log("Current URL after navigating to /login:", page.url());
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "00_login_debug.png"), fullPage: true });

  console.log("--- Logging in as Admin ---");
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.fill('input[name="username"]', "admin001");
  await page.fill('input[name="password"]', "Admin@123");
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
    page.click('button[type="submit"]')
  ]);

  console.log("--- Logged in successfully. Current URL:", page.url());

  for (const route of routesToTest) {
    if (route.name === "00_login") continue;

    console.log(`--- Inspecting ${route.name} (${route.path}) ---`);
    try {
      await page.goto(`http://localhost:3000${route.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1000);
      const screenshotPath = path.join(SCREENSHOT_DIR, `${route.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Saved screenshot: ${screenshotPath}`);
    } catch (err: any) {
      console.error(`Error navigating to ${route.path}:`, err.message);
    }
  }

  console.log("\n--- Console / Page Errors Recorded ---");
  if (errors.length === 0) {
    console.log("No console or page errors recorded during navigation!");
  } else {
    errors.forEach(e => console.error(e));
  }

  await browser.close();
}

run();
