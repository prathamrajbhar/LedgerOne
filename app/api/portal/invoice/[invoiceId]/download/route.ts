import { requirePortalAuth } from "@/lib/auth/portal-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf/invoice-pdf";

export async function GET(
  request: Request,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const portalSession = await requirePortalAuth();
    const { invoiceId } = params;

    // Fetch invoice with all relations needed for PDF
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        salesOrder: {
          select: {
            id: true,
            soNumber: true,
          },
        },
        lines: {
          include: {
            product: true,
            taxRate: true,
            analyticAccount: true,
          },
        },
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Security: Verify this invoice belongs to the logged-in customer
    if (invoice.customerId !== portalSession.contactId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch company settings
    const companySettings = await prisma.companySettings.findFirst();

    const invoiceWithSettings = {
      ...invoice,
      companySettings,
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceWithSettings);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF" },
      { status: 500 }
    );
  }
}
