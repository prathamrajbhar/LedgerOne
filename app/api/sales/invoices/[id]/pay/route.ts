import { NextRequest, NextResponse } from "next/server";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const payment = await customerInvoiceService.recordPayment({
      invoiceId: params.id,
      amount: data.amount,
      paymentMethod: data.paymentMethod || "BANK",
      paymentDate: data.paymentDate,
      note: data.note,
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("Error recording invoice payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record payment" },
      { status: 400 }
    );
  }
}
