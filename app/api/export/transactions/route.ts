import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JournalEntryStatus, JournalEntrySource } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        status: JournalEntryStatus.POSTED,
      },
      include: {
        journal: true,
        invoice: { include: { customer: true } },
        vendorBill: { include: { vendor: true } },
        billPayment: { include: { vendorBill: { include: { vendor: true } } } },
        invoicePayment: { include: { invoice: { include: { customer: true } } } },
        lines: {
          include: {
            account: true,
            partner: true,
          },
        },
      },
      orderBy: { accountingDate: "desc" },
    });

    const headers = [
      "Entry Number",
      "Date",
      "Journal",
      "Source",
      "Reference",
      "Party",
      "Status",
      "Account Code",
      "Account Name",
      "Partner",
      "Debit (INR)",
      "Credit (INR)",
    ];

    const rows: string[][] = [];

    for (const entry of entries) {
      let ref = "Manual Entry";
      let party = "-";
      if (entry.vendorBill) {
        ref = entry.vendorBill.billNumber;
        party = entry.vendorBill.vendor.name;
      } else if (entry.invoice) {
        ref = entry.invoice.invoiceNumber;
        party = entry.invoice.customer.name;
      } else if (entry.billPayment) {
        ref = entry.billPayment.vendorBill.billNumber;
        party = entry.billPayment.vendorBill.vendor.name;
      } else if (entry.invoicePayment) {
        ref = entry.invoicePayment.invoice.invoiceNumber;
        party = entry.invoicePayment.invoice.customer.name;
      }

      for (const line of entry.lines) {
        rows.push([
          `"${entry.entryNumber.replace(/"/g, '""')}"`,
          `"${entry.accountingDate.toISOString().split("T")[0]}"`,
          `"${entry.journal.name.replace(/"/g, '""')}"`,
          `"${entry.source}"`,
          `"${ref.replace(/"/g, '""')}"`,
          `"${party.replace(/"/g, '""')}"`,
          `"${entry.status}"`,
          `"${line.account.code.replace(/"/g, '""')}"`,
          `"${line.account.name.replace(/"/g, '""')}"`,
          `"${(line.partner?.name || "").replace(/"/g, '""')}"`,
          `"${Number(line.debit).toFixed(2)}"`,
          `"${Number(line.credit).toFixed(2)}"`,
        ]);
      }
    }

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-ledger-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export transactions error:", error);
    return new NextResponse("Failed to export transactions", { status: 500 });
  }
}
