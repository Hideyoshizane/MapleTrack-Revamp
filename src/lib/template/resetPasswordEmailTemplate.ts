export default function getForgotPasswordTemplate(resetLink: string, username?: string) {
	return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
  </head>
  <body style="margin: 0; padding: 24px; background-color: #b8b8b8; font-family: Helvetica, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#b8b8b8">
      <tr>
        <td align="center">
          <table width="640" cellpadding="0" cellspacing="0" border="0" bgcolor="#ededed" style="border-radius: 15px;">
            <!-- Logo Bar -->
            <tr>
              <td bgcolor="#424242" style="padding: 16px; text-align: center; border-top-left-radius: 15px; border-top-right-radius: 15px;">
                <img
                  src="https://mapletrack.vercel.app/public/assets/logo/logo.webp"
                  alt="MapleTrack Logo"
                  width="200"
                  style="display: block; margin: 0 auto; max-width: 100%; height: auto;"
                />
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 40px 16px 40px; color: #262626; font-size: 16px; line-height: 1.6;">
                <h2 style="text-align: center; color: #262626; margin-bottom: 24px; font-size: 24px;">
                  Password Reset Request
                </h2>

                <p>Hello ${username},</p>

                <p>
                  We received a request to reset the password for your MapleTrack account.
                  If you made this request, click the button below to choose a new password:
                </p>

                <!-- Button -->
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background-color: #96e4a5; color: #262626 !important; text-decoration: none !important; border-radius: 6px; font-weight: bold;">
                    Reset Password
                  </a>
                </div>

                <p>
                  This link is valid for a limited time, so please reset your password as
                  soon as possible.<br />
                  If you didn’t request this, feel free to ignore this email. Your account
                  will remain secure.
                </p>

                <!-- Divider -->
                <hr style="margin-top: 32px; border: none; border-top: 1px solid #ccc;" />

                <!-- Footer -->
                <div style="font-size: 12px; color: #888; text-align: center; margin-top: 16px;">
                  Best regards,<br />
                  <strong>The MapleTrack Team</strong>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>

  `;
}
