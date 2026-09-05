import { NextRequest, NextResponse } from "next/server";
import { budgetService } from "@/lib/services/budget.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const budget = await budgetService.confirm(params.id);
    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to confirm budget" },
      { status: 400 }
    );
  }
}
