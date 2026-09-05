import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.config";
import { customerInvoiceService } from "@/lib/services/customer-invoice.service";
import { generateInvoicePDF, InvoiceWithRelations } from "@/lib/pdf/invoice-pdf";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user is authenticated
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoiceId = params.id;

    // Fetch invoice with relations and company settings in parallel
    const [invoice, companySettings] = await Promise.all([
      customerInvoiceService.findById(invoiceId),
      prisma.companySettings.findFirst(),
    ]);

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const invoiceWithSettings = {
      ...invoice,
      companySettings,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceWithSettings as unknown as InvoiceWithRelations);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF download error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
