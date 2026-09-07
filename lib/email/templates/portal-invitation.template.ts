import { getAppBaseUrl } from "@/lib/utils/url";

export interface PortalInvitationTemplateParams {
  email: string;
  loginId: string;
  temporaryPassword: string;
  contactName: string;
}

export function renderPortalInvitationTemplate({
  loginId,
  temporaryPassword,
  contactName,
}: PortalInvitationTemplateParams): { subject: string; html: string } {
  const portalUrl = `${getAppBaseUrl()}/login`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LedgerOne Portal Invitation</title>
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
                            Client & Partner Portal
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #167C80; background-color: #E3F3F3; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
                      Official Invitation
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 36px 28px 36px;">
              <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #1E293B; line-height: 1.3;">
                Welcome, ${contactName}
              </h2>
              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                You have been granted secure access to your organization's financial portal on <strong>LedgerOne</strong>. You can now view issued invoices, track payment reconciliations, and manage statements in real-time.
              </p>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px 22px;">
                    <div style="font-size: 11px; font-weight: 700; color: #16324F; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px;">
                      Your Temporary Access Credentials
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="35%" style="padding: 7px 0; font-size: 13px; color: #64748B; font-weight: 500;">
                          Login ID / Email:
                        </td>
                        <td width="65%" style="padding: 7px 0; font-size: 13px; font-weight: 700; color: #0F172A; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;">
                          ${loginId}
                        </td>
                      </tr>
                      <tr>
                        <td width="35%" style="padding: 7px 0; font-size: 13px; color: #64748B; font-weight: 500;">
                          Temporary Password:
                        </td>
                        <td width="65%" style="padding: 7px 0;">
                          <span style="display: inline-block; padding: 4px 10px; background-color: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 14px; font-weight: 700; color: #16324F; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; letter-spacing: 0.5px;">
                            ${temporaryPassword}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}" target="_blank" style="display: inline-block; background-color: #16324F; color: #FFFFFF; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 12px rgba(22, 50, 79, 0.25); text-align: center;">
                      Sign In to LedgerOne Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 14px 16px;">
                    <div style="font-size: 12px; font-weight: 700; color: #92400E; margin-bottom: 3px;">
                      Mandatory Security Setup
                    </div>
                    <div style="font-size: 12px; color: #B45309; line-height: 1.5;">
                      Upon your first sign-in, you will be prompted to replace this temporary password with a secure permanent one before accessing account data.
                    </div>
                  </td>
                </tr>
              </table>
              <div style="border-top: 1px solid #F1F5F9; padding-top: 20px; margin-top: 20px;">
                <div style="font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                  Features available in your portal:
                </div>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #64748B;">
                  <tr>
                    <td style="padding: 4px 0;">
                      <span style="color: #167C80; font-weight: bold; margin-right: 6px;">&#10003;</span> Review verified invoices, purchase orders & account balances
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">
                      <span style="color: #167C80; font-weight: bold; margin-right: 6px;">&#10003;</span> Complete seamless online payment reconciliations
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0;">
                      <span style="color: #167C80; font-weight: bold; margin-right: 6px;">&#10003;</span> Download official GST invoices and payment receipts (PDF)
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748B; line-height: 1.5;">
                This automated invitation was generated by <strong>LedgerOne Accounting System</strong>.
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
    subject: `You're invited to LedgerOne Portal - Access Credentials`,
    html,
  };
}
