import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { PaymentStatus } from "@prisma/client";
import { PortalPayClient } from "./portal-pay-client";
import { prisma } from "@/lib/prisma";

export default async function PortalInvoicePayPage({
  params,
}: {
  params: { id: string };
}) {
  const portalSession = await requireCustomerAccess();

  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: params.id },
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
      salesOrder: {
        select: {
          soNumber: true,
        },
      },
      lines: {
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!invoice || invoice.customerId !== portalSession.contactId) {
    notFound();
  }

  if (invoice.paymentStatus === PaymentStatus.PAID) {
    redirect("/portal/invoices");
  }

  const invoiceData = {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    total: Number(invoice.total),
    amountPaid: Number(invoice.amountPaid),
    amountDue: Number(invoice.amountDue),
    customerName: invoice.customer?.name || "Valued Customer",
    customerEmail: invoice.customer?.email || "",
    soNumber: invoice.salesOrder?.soNumber || null,
    lines: invoice.lines.map((l) => ({
      name: l.product.name,
      quantity: Number(l.quantity),
      lineTotal: Number(l.lineTotal),
    })),
  };

  return (
    <div className="py-4">
      <PortalPayClient invoice={invoiceData} />
    </div>
  );
}
