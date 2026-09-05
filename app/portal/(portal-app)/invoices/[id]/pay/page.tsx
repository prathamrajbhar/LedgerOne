import * as React from "react";
import { notFound, redirect } from "next/navigation";
import { requireCustomerAccess } from "@/lib/auth/portal-session";
import { PrismaClient, PaymentStatus } from "@prisma/client";
import { PortalPayClient } from "./portal-pay-client";

const prisma = new PrismaClient();

export default async function PortalInvoicePayPage({
  params,
}: {
  params: { id: string };
}) {
  const portalSession = await requireCustomerAccess();

  const invoice = await prisma.customerInvoice.findUnique({
    where: { id: params.id },
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
  };

  return (
    <div className="py-4">
      <PortalPayClient invoice={invoiceData} />
    </div>
  );
}
