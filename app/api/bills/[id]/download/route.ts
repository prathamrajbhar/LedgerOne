import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.config";
import { vendorBillService } from "@/lib/services/vendor-bill.service";
import { generateBillPDF, BillWithRelations } from "@/lib/pdf/bill-pdf";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [bill, companySettings] = await Promise.all([
      vendorBillService.findById(params.id),
      prisma.companySettings.findFirst(),
    ]);

    if (!bill) {
      return NextResponse.json({ error: "Vendor bill not found" }, { status: 404 });
    }

    const billWithSettings = {
      ...bill,
      companySettings,
    };

    const pdfBuffer = await generateBillPDF(billWithSettings as unknown as BillWithRelations);

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
