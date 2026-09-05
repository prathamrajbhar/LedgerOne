import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";
import { PortalBillingClient } from "./portal-billing-client";

export default async function PortalBillingPage() {
  const portalSession = await requireCustomerAccess();

  // Fetch customer invoices
  const invoices = await prisma.customerInvoice.findMany({
    where: {
      customerId: portalSession.contactId,
    },
    include: {
      salesOrder: {
        select: {
          soNumber: true,
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          paymentDate: true,
          paymentMethod: true,
          note: true,
        },
        orderBy: {
          paymentDate: "desc",
        },
      },
    },
    orderBy: {
      invoiceDate: "desc",
    },
  });

  // Calculate summaries
  let totalBilled = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let overdueCount = 0;

  const now = new Date();

  const serializedInvoices = invoices.map((inv) => {
    const total = Number(inv.total);
    const amountPaid = Number(inv.amountPaid);
    const amountDue = Number(inv.amountDue);

    totalBilled += total;
    totalPaid += amountPaid;
    totalOutstanding += amountDue;

    const isOverdue =
      amountDue > 0 &&
      new Date(inv.dueDate) < now &&
      inv.paymentStatus !== PaymentStatus.PAID;

    if (isOverdue) overdueCount++;

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      total,
      amountPaid,
      amountDue,
      paymentStatus: inv.paymentStatus,
      status: inv.status,
      salesOrder: inv.salesOrder ? { soNumber: inv.salesOrder.soNumber } : null,
      paymentsCount: inv.payments.length,
    };
  });

  return (
    <PortalBillingClient
      invoices={serializedInvoices}
      stats={{
        totalBilled,
        totalPaid,
        totalOutstanding,
        overdueCount,
        totalInvoices: invoices.length,
      }}
    />
  );
}
