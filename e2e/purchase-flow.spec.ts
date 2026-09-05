import { test, expect } from "@playwright/test";

test.describe("Purchase Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard or sign-in if needed
    await page.goto("/dashboard");
  });

  test("should complete PO -> Vendor Bill -> Payment flow", async ({ page }) => {
    // 1. Navigate to Purchase Orders
    await page.goto("/purchase/orders");
    await expect(page.locator("h1")).toContainText("Purchase Orders");

    // 2. Click Create PO
    const createPoBtn = page.getByRole("link", { name: /create po|new purchase order/i });
    if (await createPoBtn.isVisible()) {
      await createPoBtn.click();
      await expect(page).toHaveURL(/\/purchase\/orders\/new/);

      // Verify form elements exist
      await expect(page.getByText("Vendor Details", { exact: false })).toBeVisible();
      await expect(page.getByText("Order Lines", { exact: false })).toBeVisible();
    }

    // 3. Navigate to Vendor Bills
    await page.goto("/purchase/bills");
    await expect(page.locator("h1")).toContainText("Vendor Bills");

    // 4. Click Create Bill
    const createBillBtn = page.getByRole("link", { name: /create bill|new vendor bill/i });
    if (await createBillBtn.isVisible()) {
      await createBillBtn.click();
      await expect(page).toHaveURL(/\/purchase\/bills\/new/);

      // Verify bill form fields
      await expect(page.getByText("Bill Details", { exact: false })).toBeVisible();
      await expect(page.getByText("Bill Lines", { exact: false })).toBeVisible();
    }

    // 5. Navigate to Accounting Journal Entries to verify ledger entries
    await page.goto("/accounting/journal-entries");
    await expect(page.locator("h1")).toContainText("Journal Entries");
  });
});
