import { requireVendorAccess } from "@/lib/auth/portal-session";
import { prisma } from "@/lib/prisma";
import { PortalBillsClient } from "./portal-bills-client";

export default async function PortalBillsPage() {
  const portalSession = await requireVendorAccess();

  // Fetch bills for this contact only
  const bills = await prisma.vendorBill.findMany({
    where: {
      vendorId: portalSession.contactId,
    },
    include: {
      purchaseOrder: {
        select: {
          poNumber: true,
        },
      },
      lines: {
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      },
    },
    orderBy: {
      billDate: "desc",
    },
  });

  const serializedBills = bills.map((b) => ({
    id: b.id,
    billNumber: b.billNumber,
    billDate: b.billDate.toISOString(),
    dueDate: b.dueDate.toISOString(),
    total: Number(b.total),
    amountPaid: Number(b.amountPaid),
    amountDue: Number(b.amountDue),
    paymentStatus: b.paymentStatus,
    status: b.status,
    purchaseOrder: b.purchaseOrder ? { poNumber: b.purchaseOrder.poNumber } : null,
    lines: b.lines.map((l) => ({
      id: l.id,
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
      lineTotal: Number(l.lineTotal),
      product: {
        name: l.product.name,
        sku: l.product.sku,
      },
    })),
  }));

  return <PortalBillsClient bills={serializedBills} />;
}
