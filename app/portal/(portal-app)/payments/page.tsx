import { requirePortalAuth } from "@/lib/auth/portal-session";
import { ContactType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PortalPaymentsClient } from "./portal-payments-client";

export default async function PortalPaymentsPage() {
  const portalSession = await requirePortalAuth();

  const isCustomer =
    portalSession.contactType === ContactType.CUSTOMER ||
    portalSession.contactType === ContactType.BOTH;
  const isVendor =
    portalSession.contactType === ContactType.VENDOR ||
    portalSession.contactType === ContactType.BOTH;

  // Fetch customer payments
  const customerPayments = isCustomer
    ? await prisma.invoicePayment.findMany({
        where: {
          invoice: {
            customerId: portalSession.contactId,
          },
        },
        include: {
          invoice: {
            select: {
              invoiceNumber: true,
              invoiceDate: true,
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
      })
    : [];

  // Fetch vendor payments
  const vendorPayments = isVendor
    ? await prisma.billPayment.findMany({
        where: {
          vendorBill: {
            vendorId: portalSession.contactId,
          },
        },
        include: {
          vendorBill: {
            select: {
              billNumber: true,
              billDate: true,
            },
          },
        },
        orderBy: {
          paymentDate: "desc",
        },
      })
    : [];

  const serializedCustomerPayments = customerPayments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    paymentDate: p.paymentDate.toISOString(),
    paymentMethod: p.paymentMethod,
    invoice: {
      invoiceNumber: p.invoice.invoiceNumber,
      invoiceDate: p.invoice.invoiceDate.toISOString(),
    },
  }));

  const serializedVendorPayments = vendorPayments.map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    paymentDate: p.paymentDate.toISOString(),
    paymentMethod: p.paymentMethod,
    vendorBill: {
      billNumber: p.vendorBill.billNumber,
      billDate: p.vendorBill.billDate.toISOString(),
    },
  }));

  return (
    <PortalPaymentsClient
      isCustomer={isCustomer}
      isVendor={isVendor}
      customerPayments={serializedCustomerPayments}
      vendorPayments={serializedVendorPayments}
    />
  );
}
