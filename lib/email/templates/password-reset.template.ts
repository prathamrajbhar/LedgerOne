import { getAppBaseUrl } from "@/lib/utils/url";

export interface PasswordResetTemplateParams {
  email: string;
  resetToken: string;
  userName?: string | null;
}

export function renderPasswordResetTemplate({
  email,
  resetToken,
  userName,
}: PasswordResetTemplateParams): { subject: string; html: string } {
  const baseUrl = getAppBaseUrl();
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your LedgerOne Password</title>
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
                            Account Security
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #DC2626; background-color: #FEE2E2; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Password Reset
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px 28px 36px;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #1E293B; line-height: 1.3;">
                Hello${userName ? ` ${userName}` : ""},
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                We received a request to reset the password associated with your LedgerOne account (<strong>${email}</strong>). Click the secure button below to set a new password.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #16324F; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(22, 50, 79, 0.25); text-align: center;">
                      Reset Your Password &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 12px; font-weight: 700; color: #92400E; margin-bottom: 3px;">
                      Link Expires in 1 Hour
                    </div>
                    <div style="font-size: 12px; color: #B45309; line-height: 1.5;">
                      For your protection, this link can only be used once and expires in 60 minutes. If you did not make this request, you can safely ignore this email.
                    </div>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #F1F5F9; padding-top: 18px; margin-top: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B;">
                  If the button above does not work, copy and paste this link into your web browser:
                </p>
                <p style="margin: 0; font-size: 11px; word-break: break-all; color: #167C80;">
                  <a href="${resetUrl}" style="color: #167C80; text-decoration: underline;">${resetUrl}</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                This automated security alert was generated by <strong>LedgerOne Accounting System</strong>.
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
    subject: "Reset Your LedgerOne Password",
    html,
  };
}
