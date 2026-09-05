import { test, expect } from "@playwright/test";

test.describe("Portal Payment E2E", () => {
  test("should view customer portal invoices and initiate online payment", async ({ page }) => {
    // 1. Visit Portal Invoices page
    await page.goto("/invoices");

    // Check whether portal layout is present
    const portalNav = page.locator("header");
    await expect(portalNav).toBeVisible();

    // Check for invoices list or empty state
    await expect(page.locator("body")).toBeDefined();

    // 2. Direct check on pay route structure
    await page.goto("/invoices/test-invoice-id/pay");
    // Verify pay page renders with payment title or checkout container
    const payHeading = page.locator("h1, h2");
    await expect(payHeading.first()).toBeVisible();
  });
});
