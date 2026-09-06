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

  // Fetch customer payments with invoice details and line items
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
              id: true,
              invoiceNumber: true,
              invoiceDate: true,
              total: true,
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
      id: p.invoice.id,
      invoiceNumber: p.invoice.invoiceNumber,
      invoiceDate: p.invoice.invoiceDate.toISOString(),
      total: Number(p.invoice.total),
      lines: p.invoice.lines.map((line) => ({
        id: line.id,
        productName: line.product?.name || "Unknown Product",
        productSku: line.product?.sku || null,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        lineTotal: Number(line.lineTotal),
        taxAmount: Number(line.taxAmount),
      })),
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
