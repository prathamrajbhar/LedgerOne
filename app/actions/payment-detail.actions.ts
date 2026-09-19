"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guard";
import { PaymentMethod } from "@prisma/client";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export async function getPaymentByIdAction(id: string) {
  try {
    await requirePermission(["payments:read", "sales:read", "purchase:read"]);

    // Check Invoice Payment first
    const invPayment = await prisma.invoicePayment.findUnique({
      where: { id },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
        journalEntry: {
          include: {
            journal: true,
            lines: {
              include: {
                account: true,
                partner: true,
              },
            },
          },
        },
        gatewayTransaction: true,
      },
    });

    if (invPayment) {
      const record = {
        id: invPayment.id,
        ref: `PAY-INV-${invPayment.id.slice(-6).toUpperCase()}`,
        direction: "INBOUND" as const,
        amount: Number(invPayment.amount),
        paymentDate: invPayment.paymentDate.toISOString(),
        paymentMethod: invPayment.paymentMethod,
        source: invPayment.source,
        note: invPayment.note,
        accountName: invPayment.paymentMethod === PaymentMethod.BANK ? "HDFC Bank Current A/c" : "Cash in Hand",
        party: {
          id: invPayment.invoice.customer.id,
          name: invPayment.invoice.customer.name,
          email: invPayment.invoice.customer.email,
          phone: invPayment.invoice.customer.phone,
          address: invPayment.invoice.customer.address,
        },
        settledDocument: {
          type: "INVOICE" as const,
          id: invPayment.invoice.id,
          number: invPayment.invoice.invoiceNumber,
          date: invPayment.invoice.invoiceDate.toISOString(),
          total: Number(invPayment.invoice.total),
          amountPaid: Number(invPayment.invoice.amountPaid),
          amountDue: Number(invPayment.invoice.amountDue),
          status: invPayment.invoice.status,
        },
        journalEntry: invPayment.journalEntry
          ? {
              id: invPayment.journalEntry.id,
              entryNumber: invPayment.journalEntry.entryNumber,
              status: invPayment.journalEntry.status,
              totalDebit: Number(invPayment.journalEntry.totalDebit),
              totalCredit: Number(invPayment.journalEntry.totalCredit),
              lines: invPayment.journalEntry.lines.map((l) => ({
                id: l.id,
                account: { code: l.account.code, name: l.account.name },
                partnerName: l.partner?.name || null,
                debit: Number(l.debit),
                credit: Number(l.credit),
              })),
            }
          : null,
      };
      return { success: true, data: serialize(record) };
    }

    // Check Bill Payment
    const billPayment = await prisma.billPayment.findUnique({
      where: { id },
      include: {
        vendorBill: {
          include: {
            vendor: true,
          },
        },
        journalEntry: {
          include: {
            journal: true,
            lines: {
              include: {
                account: true,
                partner: true,
              },
            },
          },
        },
      },
    });

    if (billPayment) {
      const record = {
        id: billPayment.id,
        ref: `PAY-BILL-${billPayment.id.slice(-6).toUpperCase()}`,
        direction: "OUTBOUND" as const,
        amount: Number(billPayment.amount),
        paymentDate: billPayment.paymentDate.toISOString(),
        paymentMethod: billPayment.paymentMethod,
        source: "MANUAL",
        note: billPayment.note,
        accountName: billPayment.paymentMethod === PaymentMethod.BANK ? "HDFC Bank Current A/c" : "Cash in Hand",
        party: {
          id: billPayment.vendorBill.vendor.id,
          name: billPayment.vendorBill.vendor.name,
          email: billPayment.vendorBill.vendor.email,
          phone: billPayment.vendorBill.vendor.phone,
          address: billPayment.vendorBill.vendor.address,
        },
        settledDocument: {
          type: "BILL" as const,
          id: billPayment.vendorBill.id,
          number: billPayment.vendorBill.billNumber,
          date: billPayment.vendorBill.billDate.toISOString(),
          total: Number(billPayment.vendorBill.total),
          amountPaid: Number(billPayment.vendorBill.amountPaid),
          amountDue: Number(billPayment.vendorBill.amountDue),
          status: billPayment.vendorBill.status,
        },
        journalEntry: billPayment.journalEntry
          ? {
              id: billPayment.journalEntry.id,
              entryNumber: billPayment.journalEntry.entryNumber,
              status: billPayment.journalEntry.status,
              totalDebit: Number(billPayment.journalEntry.totalDebit),
              totalCredit: Number(billPayment.journalEntry.totalCredit),
              lines: billPayment.journalEntry.lines.map((l) => ({
                id: l.id,
                account: { code: l.account.code, name: l.account.name },
                partnerName: l.partner?.name || null,
                debit: Number(l.debit),
                credit: Number(l.credit),
              })),
            }
          : null,
      };
      return { success: true, data: serialize(record) };
    }

    return { success: false, error: "Payment record not found" };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message || "Failed to fetch payment record" };
  }
}
