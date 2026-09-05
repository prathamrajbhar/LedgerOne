import { NextRequest, NextResponse } from "next/server";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const invoice = await customerInvoiceService.create(data);
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("Error creating customer invoice:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create customer invoice" },
      { status: 400 }
    );
  }
}
