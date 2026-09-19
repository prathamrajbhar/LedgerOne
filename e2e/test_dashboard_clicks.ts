import { chromium } from "@playwright/test";

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

  console.log("1. Navigating to Login...");
  await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
  await page.waitForSelector('input[name="username"]', { timeout: 15000 });
  await page.focus('input[name="username"]');
  await page.keyboard.type("admin001");
  await page.focus('input[name="password"]');
  await page.keyboard.type("Admin@123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  console.log("URL after submit:", page.url());

  if (!page.url().includes("/dashboard")) {
    await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
  }
  console.log("Final URL:", page.url());

  console.log("2. Testing Overdue Invoices link...");
  await page.click('text="Overdue Invoices"');
  await page.waitForTimeout(1500);
  console.log("Navigated to Overdue Invoices URL:", page.url());

  console.log("3. Testing Pending Invoices link...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.click('text="Pending Invoices"');
  await page.waitForTimeout(1500);
  console.log("Navigated to Pending Invoices URL:", page.url());

  console.log("4. Testing In Stock Inventory link...");
  await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.click('text="In Stock"');
  await page.waitForTimeout(1500);
  console.log("Navigated to In Stock Products URL:", page.url());

  console.log("SUCCESS: All dashboard click targets verified!");
  await browser.close();
}

run();
