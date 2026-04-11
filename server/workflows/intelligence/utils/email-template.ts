interface EmailTemplateOptions {
  preview: string
  heading: string
  body: string
  cta?: { label: string, url: string }
  footer?: string
}

export function buildEmailHtml({ preview, heading, body, cta, footer }: EmailTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 0; background-color: #010101; font-family: 'Geist', Helvetica, Arial, sans-serif; }
    a { text-decoration: none; }
  </style>
  <!--[if mso]><style>body { font-family: Helvetica, Arial, sans-serif !important; }</style><![endif]-->
  <div style="display:none;max-height:0;overflow:hidden">${preview}</div>
</head>
<body style="margin:0;padding:0;background-color:#010101;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#010101;">
    <tr>
      <td align="center" style="padding:40px 24px;">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <!-- Heading -->
          <tr>
            <td style="color:#ffffff;font-size:20px;font-weight:500;letter-spacing:-0.3px;padding-bottom:12px;">
              ${heading}
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="color:rgba(255,255,255,0.6);font-size:14px;line-height:22px;padding-bottom:${cta ? '24' : '0'}px;">
              ${body}
            </td>
          </tr>
          ${cta ? `
          <!-- CTA -->
          <tr>
            <td style="padding-bottom:0;">
              <a href="${cta.url}" style="display:inline-block;background-color:#ffffff;color:#010101;font-size:14px;font-weight:500;padding:10px 20px;border-radius:6px;">
                ${cta.label}
              </a>
            </td>
          </tr>` : ''}
          <!-- Divider -->
          <tr>
            <td style="padding:32px 0;">
              <div style="border-top:1px solid rgba(255,255,255,0.1);"></div>
            </td>
          </tr>
          <!-- Signature -->
          <tr>
            <td style="padding-bottom:24px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="https://avatars.githubusercontent.com/u/71938701?v=4&s=64" alt="Hugo Richard" width="32" height="32" style="width:32px;height:32px;display:block;border-radius:50%;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="color:#ffffff;font-size:13px;font-weight:500;">Hugo Richard</span>
                    <br />
                    <span style="color:rgba(255,255,255,0.4);font-size:12px;">Software Engineer & Designer</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Social links -->
          <tr>
            <td style="font-size:12px;padding-bottom:24px;">
              <a href="https://hugorcd.com" style="color:rgba(255,255,255,0.5);">Portfolio</a>
              <span style="color:rgba(255,255,255,0.2);padding:0 6px;">·</span>
              <a href="https://git.new/hugorcd" style="color:rgba(255,255,255,0.5);">GitHub</a>
              <span style="color:rgba(255,255,255,0.2);padding:0 6px;">·</span>
              <a href="https://dub.sh/hrcd-x" style="color:rgba(255,255,255,0.5);">X</a>
              <span style="color:rgba(255,255,255,0.2);padding:0 6px;">·</span>
              <a href="https://dub.sh/hrcd-linkedin" style="color:rgba(255,255,255,0.5);">LinkedIn</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="color:rgba(255,255,255,0.25);font-size:11px;">
              ${footer || 'Sent from HR Folio Intelligence'}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
