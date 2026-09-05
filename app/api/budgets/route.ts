import { NextRequest, NextResponse } from "next/server";
import { budgetService } from "@/lib/services/budget.service";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const formattedLines = (data.lines || []).map((l: any) => ({
      analyticAccountId: l.analyticAccountId,
      type: l.type || "EXPENSES",
      committedAmount: new Decimal(l.committedAmount || 0),
    }));

    const budget = await budgetService.create({
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      responsibleId: data.responsibleId,
      lines: formattedLines,
      userId: data.userId || data.responsibleId,
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error: any) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create budget" },
      { status: 400 }
    );
  }
}
