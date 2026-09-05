import { NextRequest, NextResponse } from "next/server";
import { vendorBillService } from "@/lib/services/vendor-bill.service";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const bill = await vendorBillService.create(data);
    return NextResponse.json(bill, { status: 201 });
  } catch (error: any) {
    console.error("Error creating vendor bill:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create vendor bill" },
      { status: 400 }
    );
  }
}
