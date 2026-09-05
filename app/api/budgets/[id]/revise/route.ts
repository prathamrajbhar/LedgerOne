import { NextRequest, NextResponse } from "next/server";
import { budgetService } from "@/lib/services/budget.service";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const formattedLines = (data.lines || []).map((l: any) => ({
      analyticAccountId: l.analyticAccountId,
      type: l.type,
      committedAmount: new Decimal(l.committedAmount || 0),
    }));

    const revised = await budgetService.revise({
      budgetId: params.id,
      name: data.name,
      lines: formattedLines,
      userId: data.userId || "system",
    });
    return NextResponse.json(revised);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to revise budget" },
      { status: 400 }
    );
  }
}
