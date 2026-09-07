import { getAppBaseUrl } from "@/lib/utils/url";

export interface PaymentConfirmationTemplateParams {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  invoiceTotal: string;
  paymentAmount: string;
  paymentDate: string;
  amountPaid: string;
  remainingBalance: string;
  invoiceId: string;
}

export function renderPaymentConfirmationTemplate({
  customerName,
  invoiceNumber,
  invoiceTotal,
  paymentAmount,
  paymentDate,
  amountPaid,
  remainingBalance,
  invoiceId,
}: PaymentConfirmationTemplateParams): { subject: string; html: string } {
  const portalUrl = `${getAppBaseUrl()}/portal/invoices/${invoiceId}`;
  const isPaidInFull = Number(remainingBalance) <= 0;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Received - Invoice #${invoiceNumber}</title>
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
            <td height="5" style="background: linear-gradient(90deg, #16324F 0%, #167C80 50%, #2DD4BF 100%);"></td>
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
                            Official Payment Receipt
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #047857; background-color: #D1FAE5; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${isPaidInFull ? "Paid in Full" : "Partial Payment"}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px 28px 36px;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #1E293B; line-height: 1.3;">
                Payment Confirmation
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Dear ${customerName}, thank you for your payment. We have successfully processed and verified your transaction for Invoice <strong>#${invoiceNumber}</strong>.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 18px 20px; text-align: center;">
                    <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">
                      Amount Received
                    </div>
                    <div style="font-size: 28px; font-weight: 800; color: #15803D; letter-spacing: -0.5px;">
                      ₹${paymentAmount}
                    </div>
                    <div style="font-size: 12px; color: #166534; margin-top: 4px;">
                      Processed on ${paymentDate} via Online Gateway
                    </div>
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Invoice Reference:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 700; color: #0F172A;">#${invoiceNumber}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Invoice Total:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A;">₹${invoiceTotal}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 10px 0; color: #64748B; font-weight: 500;">Total Paid to Date:</td>
                  <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #0F172A;">₹${amountPaid}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; color: #0F172A; font-weight: 700;">Remaining Balance:</td>
                  <td style="padding: 12px 0; text-align: right; font-weight: 800; color: ${isPaidInFull ? "#059669" : "#DC2626"};">
                    ₹${remainingBalance}
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #16324F; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(22, 50, 79, 0.25); text-align: center;">
                      View Invoice in Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                This automated payment confirmation was issued by <strong>LedgerOne Accounting System</strong>.
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
    subject: `Payment Receipt - Invoice #${invoiceNumber} [Verified]`,
    html,
  };
}
