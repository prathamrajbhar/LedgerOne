export interface RemittanceAdviceTemplateParams {
  vendorName: string;
  vendorEmail: string;
  billNumber: string;
  paymentAmount: string;
  paymentDate: string;
  paymentMethod: string;
  remainingDue: string;
  note?: string;
}

export function renderRemittanceAdviceTemplate(
  input: RemittanceAdviceTemplateParams
): { subject: string; html: string } {
  const subject = `Payment Remittance Advice: Settle #${input.billNumber}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Remittance Advice</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden;">
          <tr>
            <td height="5" style="background: linear-gradient(90deg, #16324F 0%, #059669 100%);"></td>
          </tr>
          <tr>
            <td style="padding: 28px 32px;">
              <h2 style="margin: 0 0 16px; color: #16324F; font-size: 20px; font-weight: 700;">
                Payment Remittance Advice
              </h2>
              <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 22px;">
                Dear <strong>${input.vendorName}</strong>,
              </p>
              <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 22px;">
                We are pleased to advise that a payment of <strong>₹${input.paymentAmount}</strong> has been processed towards Vendor Bill <strong>#${input.billNumber}</strong>.
              </p>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Amount Settle:</td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #059669; text-align: right;">₹${input.paymentAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Payment Method:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #16324F; text-align: right;">${input.paymentMethod}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Settlement Date:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #16324F; text-align: right;">${input.paymentDate}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Remaining Balance Due:</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #16324F; text-align: right;">₹${input.remainingDue}</td>
                </tr>
                ${
                  input.note
                    ? `<tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">Reference / Note:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #16324F; text-align: right;">${input.note}</td>
                </tr>`
                    : ""
                }
              </table>

              <p style="margin: 20px 0 0; font-size: 12px; color: #94A3B8; text-align: center;">
                Please credit this amount to our account. For any queries, contact our finance department.
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
