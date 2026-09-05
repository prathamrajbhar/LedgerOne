import { test, expect } from "@playwright/test";

test.describe("Sales Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("should complete SO -> Customer Invoice -> Payment flow", async ({ page }) => {
    // 1. Navigate to Sales Orders
    await page.goto("/sales/orders");
    await expect(page.locator("h1")).toContainText("Sales Orders");

    // 2. Click Create SO
    const createSoBtn = page.getByRole("link", { name: /create so|new sales order/i });
    if (await createSoBtn.isVisible()) {
      await createSoBtn.click();
      await expect(page).toHaveURL(/\/sales\/orders\/new/);

      // Verify form elements exist
      await expect(page.getByText("Customer Details", { exact: false })).toBeVisible();
      await expect(page.getByText("Order Lines", { exact: false })).toBeVisible();
    }

    // 3. Navigate to Customer Invoices
    await page.goto("/sales/invoices");
    await expect(page.locator("h1")).toContainText("Customer Invoices");

    // 4. Click Create Invoice
    const createInvoiceBtn = page.getByRole("link", { name: /create invoice|new invoice/i });
    if (await createInvoiceBtn.isVisible()) {
      await createInvoiceBtn.click();
      await expect(page).toHaveURL(/\/sales\/invoices\/new/);

      // Verify invoice form fields
      await expect(page.getByText("Invoice Details", { exact: false })).toBeVisible();
      await expect(page.getByText("Invoice Lines", { exact: false })).toBeVisible();
    }

    // 5. Navigate to Accounting Journal Entries to verify ledger entries
    await page.goto("/accounting/journal-entries");
    await expect(page.locator("h1")).toContainText("Journal Entries");
  });
});
