import { getAppBaseUrl } from "@/lib/utils/url";

export interface BillPaymentReminderTemplateParams {
  vendorName: string;
  vendorEmail: string;
  billNumber: string;
  totalAmount: string;
  amountDue: string;
  dueDate: string;
  isOverdue: boolean;
  daysDiff: number;
}

export function renderBillPaymentReminderTemplate(
  input: BillPaymentReminderTemplateParams
): { subject: string; html: string } {
  const portalUrl = `${getAppBaseUrl()}/bills`;

  const statusBadgeText = input.isOverdue
    ? `Overdue by ${input.daysDiff} Day${input.daysDiff === 1 ? "" : "s"}`
    : input.daysDiff === 0
    ? "Due Today"
    : `Due in ${input.daysDiff} Day${input.daysDiff === 1 ? "" : "s"}`;

  const statusBadgeColor = input.isOverdue ? "#DC2626" : "#D97706";
  const statusBadgeBg = input.isOverdue ? "#FEE2E2" : "#FEF3C7";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Bill Payment Alert - #${input.billNumber}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F3F6F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F3F6F9; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(22, 50, 79, 0.08), 0 8px 10px -6px rgba(22, 50, 79, 0.04); border: 1px solid #E2E8F0;">
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #16324F 0%, #D97706 50%, #DC2626 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 32px 36px 20px 36px; background-color: #FFFFFF; border-bottom: 1px solid #F1F5F9;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #16324F; width: 38px; height: 38px; border-radius: 10px; text-align: center; vertical-align: middle; color: #FFFFFF; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                          L1
                        </td>
                        <td style="padding-left: 14px;">
                          <div style="font-size: 20px; font-weight: 800; color: #16324F; letter-spacing: -0.5px; line-height: 1.2;">
                            Ledger<span style="color: #167C80;">One</span>
                          </div>
                          <div style="font-size: 11px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">
                            Accounts Payable Alert
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: ${statusBadgeColor}; background-color: ${statusBadgeBg}; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${statusBadgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px 28px 36px;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #1E293B; line-height: 1.3;">
                Payment Notification for ${input.vendorName}
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                ${
                  input.isOverdue
                    ? `This is a reminder that Vendor Bill <strong>#${input.billNumber}</strong> was due on <strong>${input.dueDate}</strong> and remains pending settlement.`
                    : `This is an advance notice that Vendor Bill <strong>#${input.billNumber}</strong> has an upcoming payment due date on <strong>${input.dueDate}</strong>.`
                }
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${input.isOverdue ? "#FFF1F2" : "#FFFBEB"}; border: 1px solid ${input.isOverdue ? "#FECDD3" : "#FDE68A"}; border-radius: 12px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 18px 20px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: ${input.isOverdue ? "#9F1239" : "#92400E"}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
                      Outstanding Balance
                    </div>
                    <div style="font-size: 28px; font-weight: 800; color: ${input.isOverdue ? "#BE123C" : "#B45309"}; letter-spacing: -0.5px;">
                      ₹${input.amountDue}
                    </div>
                    <div style="font-size: 12px; color: ${input.isOverdue ? "#9F1239" : "#92400E"}; margin-top: 4px;">
                      Total Bill Amount: ₹${input.totalAmount} &bull; Due Date: ${input.dueDate}
                    </div>
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Bill Reference:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A;">#${input.billNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Vendor Name:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A;">${input.vendorName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Due Date:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A;">${input.dueDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #0F172A; font-weight: 700;">Remaining Balance:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 800; color: ${input.isOverdue ? "#DC2626" : "#D97706"};">
                    ₹${input.amountDue}
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #16324F; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(22, 50, 79, 0.25); text-align: center;">
                      View Bill Details in Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                This automated payment reminder was issued by <strong>LedgerOne Accounting System</strong>.
              </p>
              <p style="margin: 0; font-size: 11px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} LedgerOne Inc. All rights reserved. &bull; Enterprise Financial Cloud
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return {
    subject: `${input.isOverdue ? "[OVERDUE ALERT]" : "[PAYMENT DUE REMINDER]"} Bill #${input.billNumber} (${statusBadgeText})`,
    html,
  };
}
