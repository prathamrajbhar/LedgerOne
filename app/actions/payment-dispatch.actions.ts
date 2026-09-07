"use server";

import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/client";
import { PaymentMethod } from "@prisma/client";

interface DispatchReceiptInput {
  documentId: string;
  documentType: "BILL" | "INVOICE";
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
}

export async function dispatchPaymentReceiptNotification(input: DispatchReceiptInput): Promise<void> {
  const { documentId, documentType, amount, paymentDate, paymentMethod } = input;
  const formattedDate = paymentDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedAmt = amount.toLocaleString("en-IN", { minimumFractionDigits: 2 });
  const methodLabel = paymentMethod === PaymentMethod.BANK ? "Bank Transfer" : "Cash";

  if (documentType === "BILL") {
    const bill = await prisma.vendorBill.findUnique({
      where: { id: documentId },
      include: { vendor: true },
    });
    if (!bill?.vendor?.email) return;

    await emailService.sendRemittanceAdvice({
      vendorName: bill.vendor.name,
      vendorEmail: bill.vendor.email,
      billNumber: bill.billNumber,
      paymentAmount: formattedAmt,
      paymentDate: formattedDate,
      paymentMethod: methodLabel,
      remainingDue: Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
    });
  } else {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id: documentId },
      include: { customer: true },
    });
    if (!invoice?.customer?.email) return;

    await emailService.sendPaymentConfirmation(
      invoice.customer.name,
      invoice.customer.email,
      invoice.invoiceNumber,
      Number(invoice.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      formattedAmt,
      formattedDate,
      Number(invoice.amountPaid).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      Number(invoice.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
      invoice.id
    );
  }
}
