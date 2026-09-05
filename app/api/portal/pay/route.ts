import { NextRequest, NextResponse } from "next/server";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, amount, paymentMethod } = await request.json();

    const invoice = await customerInvoiceService.findById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const payAmount = Number(amount || invoice.amountDue);

    // Record the payment
    const payment = await customerInvoiceService.recordPayment({
      invoiceId,
      amount: payAmount,
      paymentMethod: paymentMethod || "BANK",
      note: `Online Gateway Payment via Portal (Ref: PAY-${Date.now()})`,
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment processed successfully",
    });
  } catch (error: any) {
    console.error("Portal payment processing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process portal payment" },
      { status: 400 }
    );
  }
}
