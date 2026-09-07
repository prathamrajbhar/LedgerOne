import { getAppBaseUrl } from "@/lib/utils/url";

export interface InvoiceDispatchTemplateParams {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  totalAmount: string;
  amountDue: string;
  dueDate: string;
  invoiceId: string;
}

export function renderInvoiceDispatchTemplate(
  input: InvoiceDispatchTemplateParams
): { subject: string; html: string } {
  const portalPayUrl = `${getAppBaseUrl()}/portal/invoices/${input.invoiceId}/pay`;

  const subject = `Tax Invoice #${input.invoiceNumber} from LedgerOne`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice #${input.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden;">
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #16324F 0%, #167C80 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <h2 style="margin: 0 0 16px; color: #16324F; font-size: 20px; font-weight: 700;">
                Tax Invoice #${input.invoiceNumber}
              </h2>
              <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 22px;">
                Dear <strong>${input.customerName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 22px;">
                Please find attached your official Tax Invoice <strong>#${input.invoiceNumber}</strong>. A PDF copy has been attached to this email for your accounting records.
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Invoice Total:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #16324F; text-align: right;">₹${input.totalAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Balance Due:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0D9488; text-align: right;">₹${input.amountDue}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Due Date:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #16324F; text-align: right;">${input.dueDate}</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="${portalPayUrl}" style="background-color: #167C80; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; display: inline-block;">
                  View & Pay Online in Portal
                </a>
              </div>

              <p style="margin: 24px 0 0; font-size: 12px; color: #94A3B8; text-align: center;">
                If you have questions regarding this invoice, please reply directly or reach out to our accounts team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}
