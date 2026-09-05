import { NextRequest, NextResponse } from "next/server";
import { journalEntryService } from "@/lib/services/journal-entry.service";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const formattedLines = (data.lines || []).map((l: any) => ({
      accountId: l.accountId,
      partnerId: l.partnerId || undefined,
      debit: new Decimal(l.debit || 0),
      credit: new Decimal(l.credit || 0),
    }));

    const entry = await journalEntryService.createManual({
      journalId: data.journalId,
      accountingDate: new Date(data.accountingDate || Date.now()),
      lines: formattedLines,
      userId: data.userId || "system",
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error: any) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create journal entry" },
      { status: 400 }
    );
  }
}
