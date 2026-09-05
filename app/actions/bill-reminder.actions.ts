"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email/client";
import { requireAuth } from "@/lib/auth/session";
import { DocumentStatus, PaymentStatus, EmailReminderType, EmailDeliveryStatus } from "@prisma/client";

export interface SendBillReminderResult {
  success: boolean;
  message?: string;
  error?: string;
  log?: {
    id: string;
    sentAt: string;
    recipientEmail: string;
    emailType: string;
    status: string;
  };
}

/**
 * Dispatch an on-demand payment reminder email for a single vendor bill
 * Records the exact date, time, recipient, subject, and status in BillEmailLog
 */
export async function sendBillReminderAction(billId: string): Promise<SendBillReminderResult> {
  try {
    await requireAuth();

    const bill = await prisma.vendorBill.findUnique({
      where: { id: billId },
      include: { vendor: true },
    });

    if (!bill) {
      return { success: false, error: "Vendor bill not found" };
    }

    if (!bill.vendor?.email) {
      return { success: false, error: "Vendor does not have a registered email address" };
    }

    if (bill.status !== DocumentStatus.CONFIRMED) {
      return { success: false, error: "Only confirmed bills can have payment alerts sent" };
    }

    if (bill.paymentStatus === PaymentStatus.PAID || Number(bill.amountDue) <= 0) {
      return { success: false, error: "This bill is already fully paid" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(bill.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = daysDiff < 0;
    const absDays = Math.abs(daysDiff);

    const emailType: EmailReminderType = isOverdue
      ? EmailReminderType.OVERDUE
      : absDays <= 3
      ? EmailReminderType.DUE_SOON
      : EmailReminderType.MANUAL;

    const formattedDue = new Date(bill.dueDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const statusBadge = isOverdue
      ? `Overdue by ${absDays} Day${absDays === 1 ? "" : "s"}`
      : absDays === 0
      ? "Due Today"
      : `Due in ${absDays} Day${absDays === 1 ? "" : "s"}`;

    const emailSubject = `${isOverdue ? "[OVERDUE ALERT]" : "[PAYMENT DUE REMINDER]"} Bill #${bill.billNumber} (${statusBadge})`;

    let deliveryStatus: EmailDeliveryStatus = EmailDeliveryStatus.SENT;
    let deliveryError: string | undefined;

    try {
      await emailService.sendBillPaymentReminder({
        vendorName: bill.vendor.name,
        vendorEmail: bill.vendor.email,
        billNumber: bill.billNumber,
        totalAmount: Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        amountDue: Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        dueDate: formattedDue,
        isOverdue,
        daysDiff: absDays,
      });
    } catch (sendErr) {
      deliveryStatus = EmailDeliveryStatus.FAILED;
      deliveryError = sendErr instanceof Error ? sendErr.message : "Failed to dispatch email via SMTP";
    }

    // Persist email log record and update VendorBill audit columns
    const now = new Date();

    const [log] = await prisma.$transaction([
      prisma.billEmailLog.create({
        data: {
          vendorBillId: bill.id,
          recipientEmail: bill.vendor.email,
          recipientName: bill.vendor.name,
          emailType,
          subject: emailSubject,
          status: deliveryStatus,
          errorMessage: deliveryError,
          sentAt: now,
        },
      }),
      prisma.vendorBill.update({
        where: { id: bill.id },
        data: {
          lastReminderSentAt: now,
          reminderCount: { increment: 1 },
        },
      }),
    ]);

    revalidatePath("/bills");

    if (deliveryStatus === EmailDeliveryStatus.FAILED) {
      return {
        success: false,
        error: deliveryError || "Failed to dispatch email",
      };
    }

    return {
      success: true,
      message: `Reminder email successfully sent to ${bill.vendor.email}`,
      log: {
        id: log.id,
        sentAt: log.sentAt.toISOString(),
        recipientEmail: log.recipientEmail,
        emailType: log.emailType,
        status: log.status,
      },
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: msg };
  }
}

/**
 * Fetch all historical reminder logs for a vendor bill
 */
export async function getBillEmailLogsAction(billId: string) {
  try {
    await requireAuth();

    const logs = await prisma.billEmailLog.findMany({
      where: { vendorBillId: billId },
      orderBy: { sentAt: "desc" },
    });

    return {
      success: true,
      data: logs.map((l) => ({
        id: l.id,
        recipientEmail: l.recipientEmail,
        recipientName: l.recipientName,
        emailType: l.emailType,
        subject: l.subject,
        status: l.status,
        errorMessage: l.errorMessage,
        sentAt: l.sentAt.toISOString(),
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch email logs",
      data: [],
    };
  }
}

/**
 * Batch processor: Checks all confirmed vendor bills with pending balance
 * Dispatches due soon (<= 3 days) or overdue reminders, enforcing a 24-hour rate limit
 */
export async function dispatchBatchDueBillAlertsAction(): Promise<{
  success: boolean;
  dispatchedCount: number;
  skippedCount: number;
  message: string;
  error?: string;
}> {
  try {
    await requireAuth();

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const eligibleBills = await prisma.vendorBill.findMany({
      where: {
        status: DocumentStatus.CONFIRMED,
        paymentStatus: { in: [PaymentStatus.NOT_PAID, PaymentStatus.PARTIAL] },
        amountDue: { gt: 0 },
        vendor: { email: { not: "" } },
      },
      include: { vendor: true },
    });

    let dispatchedCount = 0;
    let skippedCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const bill of eligibleBills) {
      if (!bill.vendor?.email) continue;

      const due = new Date(bill.dueDate);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const isOverdue = daysDiff < 0;
      const absDays = Math.abs(daysDiff);

      // Alert criteria: overdue (< 0) or due soon (<= 3 days)
      const isEligibleForAlert = isOverdue || absDays <= 3;
      if (!isEligibleForAlert) continue;

      // Rate limit: Skip if reminder sent within last 24h
      if (bill.lastReminderSentAt && bill.lastReminderSentAt > twentyFourHoursAgo) {
        skippedCount++;
        continue;
      }

      const emailType = isOverdue ? EmailReminderType.OVERDUE : EmailReminderType.DUE_SOON;

      const formattedDue = new Date(bill.dueDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const statusBadge = isOverdue
        ? `Overdue by ${absDays} Day${absDays === 1 ? "" : "s"}`
        : absDays === 0
        ? "Due Today"
        : `Due in ${absDays} Day${absDays === 1 ? "" : "s"}`;

      const emailSubject = `${isOverdue ? "[OVERDUE ALERT]" : "[PAYMENT DUE REMINDER]"} Bill #${bill.billNumber} (${statusBadge})`;

      let deliveryStatus: EmailDeliveryStatus = EmailDeliveryStatus.SENT;
      let deliveryError: string | undefined;

      try {
        await emailService.sendBillPaymentReminder({
          vendorName: bill.vendor.name,
          vendorEmail: bill.vendor.email,
          billNumber: bill.billNumber,
          totalAmount: Number(bill.total).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          amountDue: Number(bill.amountDue).toLocaleString("en-IN", { minimumFractionDigits: 2 }),
          dueDate: formattedDue,
          isOverdue,
          daysDiff: absDays,
        });
      } catch (e) {
        deliveryStatus = EmailDeliveryStatus.FAILED;
        deliveryError = e instanceof Error ? e.message : "SMTP send failed";
      }

      const logTime = new Date();
      await prisma.$transaction([
        prisma.billEmailLog.create({
          data: {
            vendorBillId: bill.id,
            recipientEmail: bill.vendor.email,
            recipientName: bill.vendor.name,
            emailType,
            subject: emailSubject,
            status: deliveryStatus,
            errorMessage: deliveryError,
            sentAt: logTime,
          },
        }),
        prisma.vendorBill.update({
          where: { id: bill.id },
          data: {
            lastReminderSentAt: logTime,
            reminderCount: { increment: 1 },
          },
        }),
      ]);

      if (deliveryStatus === EmailDeliveryStatus.SENT) {
        dispatchedCount++;
      }
    }

    revalidatePath("/bills");

    return {
      success: true,
      dispatchedCount,
      skippedCount,
      message: `Dispatched ${dispatchedCount} reminder email${dispatchedCount === 1 ? "" : "s"} (${skippedCount} skipped due to 24h rate limit).`,
    };
  } catch (error) {
    return {
      success: false,
      dispatchedCount: 0,
      skippedCount: 0,
      error: error instanceof Error ? error.message : "Failed to run batch reminder alerts",
      message: "Batch reminder execution failed.",
    };
  }
}
