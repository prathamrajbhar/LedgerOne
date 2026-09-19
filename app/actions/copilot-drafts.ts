"use server";

import { contactService } from "@/lib/services/contact.service";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { prisma } from "@/lib/prisma";
import { JournalEntrySource, JournalEntryStatus } from "@prisma/client";

export async function handleCreateInvoiceDraft(input: Record<string, unknown>, userId: string) {
  try {
    const customerName = String(input.customerName || "").trim();
    const productName = String(input.productName || "").trim();
    const quantity = Math.max(1, Number(input.quantity) || 1);
    const unitPrice = Math.max(0, Number(input.unitPrice) || 0);
    const dueDateDays = Number(input.dueDateDays) || 30;

    let customer = await prisma.contact.findFirst({
      where: { name: { contains: customerName, mode: "insensitive" }, type: { in: ["CUSTOMER", "BOTH"] } },
    });
    if (!customer) {
      customer = await contactService.create({
        name: customerName,
        email: `${customerName.toLowerCase().replace(/[^a-z0-9]/g, "")}@client.com`,
        type: "CUSTOMER",
      });
    }

    let product = await prisma.product.findFirst({
      where: { name: { contains: productName, mode: "insensitive" }, isArchived: false },
    });
    if (!product) {
      product = await prisma.product.findFirst({ where: { isArchived: false } });
    }
    if (!product) return { success: false, error: "No active products found in catalog." };

    const analyticAccount = await prisma.analyticAccount.findFirst();
    if (!analyticAccount) return { success: false, error: "No analytic account configured." };

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDateDays);

    const invoice = await customerInvoiceService.createStandalone({
      customerId: customer.id,
      invoiceDate: new Date(),
      dueDate,
      userId,
      lines: [
        {
          productId: product.id,
          description: product.name,
          analyticAccountId: analyticAccount.id,
          quantity,
          unitPrice,
        },
      ],
    });

    return {
      success: true,
      action: "createCustomerInvoiceDraftAction",
      message: `Draft invoice ${invoice.invoiceNumber} created for ${customer.name} (Total: ₹${Number(invoice.total).toLocaleString("en-IN")}).`,
      invoiceNumber: invoice.invoiceNumber,
      invoiceId: invoice.id,
    };
  } catch (err) {
    return { success: false, action: "createCustomerInvoiceDraftAction", error: (err as Error).message || "Failed to create draft invoice." };
  }
}

export async function handleCreateBillDraft(input: Record<string, unknown>, userId: string) {
  try {
    const vendorName = String(input.vendorName || "").trim();
    const productName = String(input.productName || "").trim();
    const quantity = Math.max(1, Number(input.quantity) || 1);
    const unitPrice = Math.max(0, Number(input.unitPrice) || 0);
    const dueDateDays = Number(input.dueDateDays) || 30;

    let vendor = await prisma.contact.findFirst({
      where: { name: { contains: vendorName, mode: "insensitive" }, type: { in: ["VENDOR", "BOTH"] } },
    });
    if (!vendor) {
      vendor = await contactService.create({
        name: vendorName,
        email: `${vendorName.toLowerCase().replace(/[^a-z0-9]/g, "")}@vendor.com`,
        type: "VENDOR",
      });
    }

    let product = await prisma.product.findFirst({
      where: { name: { contains: productName, mode: "insensitive" }, isArchived: false },
    });
    if (!product) {
      product = await prisma.product.findFirst({ where: { isArchived: false } });
    }
    if (!product) return { success: false, error: "No active products found in catalog." };

    const analyticAccount = await prisma.analyticAccount.findFirst();
    if (!analyticAccount) return { success: false, error: "No analytic account configured." };

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDateDays);

    const bill = await vendorBillService.create({
      vendorId: vendor.id,
      billDate: new Date(),
      dueDate,
      createdById: userId,
      lines: [
        {
          productId: product.id,
          analyticAccountId: analyticAccount.id,
          quantity,
          unitPrice,
        },
      ],
    });

    return {
      success: true,
      action: "createVendorBillDraftAction",
      message: `Draft vendor bill ${bill.billNumber} created for ${vendor.name} (Total: ₹${Number(bill.total).toLocaleString("en-IN")}).`,
      billNumber: bill.billNumber,
      billId: bill.id,
    };
  } catch (err) {
    return { success: false, action: "createVendorBillDraftAction", error: (err as Error).message || "Failed to create draft vendor bill." };
  }
}

export async function handleRecordExpense(input: Record<string, unknown>, userId: string) {
  try {
    const description = String(input.description || "Operational Expense").trim();
    const amount = Math.max(1, Number(input.amount) || 0);

    const expenseAccount = await prisma.chartOfAccount.findFirst({
      where: { type: { in: ["EXPENSES", "OTHER_EXPENSES"] }, isArchived: false },
    });
    const paymentAccount = await prisma.chartOfAccount.findFirst({
      where: { type: { in: ["BANK", "CASH"] }, isArchived: false },
    });
    const journal = await prisma.journal.findFirst({
      where: { type: { in: ["BANK", "CASH"] } },
    });

    if (!expenseAccount || !paymentAccount || !journal) {
      return { success: false, error: "Required accounts or journals not configured." };
    }

    const settings = await prisma.companySettings.findFirst();
    const prefix = settings?.jeNumberPrefix || "JE";
    const count = await prisma.journalEntry.count();
    const entryNumber = `${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const entry = await prisma.journalEntry.create({
      data: {
        entryNumber,
        journalId: journal.id,
        accountingDate: new Date(),
        status: JournalEntryStatus.POSTED,
        source: JournalEntrySource.MANUAL,
        reference: description,
        totalDebit: amount,
        totalCredit: amount,
        createdById: userId,
        lines: {
          create: [
            { accountId: expenseAccount.id, debit: amount, credit: 0 },
            { accountId: paymentAccount.id, debit: 0, credit: amount },
          ],
        },
      },
    });

    return {
      success: true,
      action: "recordExpenseAction",
      message: `Recorded expense of ₹${amount.toLocaleString("en-IN")} under '${expenseAccount.name}' (${entry.entryNumber}).`,
      entryNumber: entry.entryNumber,
    };
  } catch (err) {
    return { success: false, action: "recordExpenseAction", error: (err as Error).message || "Failed to record expense." };
  }
}
