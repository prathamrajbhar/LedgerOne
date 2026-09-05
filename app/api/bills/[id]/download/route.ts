import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.config";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { generateBillPDF, BillWithRelations } from "@/lib/pdf/bill-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bill = await vendorBillService.findById(params.id);
    if (!bill) {
      return NextResponse.json({ error: "Vendor bill not found" }, { status: 404 });
    }

    const pdfBuffer = await generateBillPDF(bill as unknown as BillWithRelations);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="VendorBill-${bill.billNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Vendor bill PDF download error:", error);
    return NextResponse.json({ error: "Failed to generate vendor bill PDF" }, { status: 500 });
  }
}
