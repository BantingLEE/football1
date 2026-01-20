import DOMPurify from 'isomorphic-dompurify'

export interface EmailTemplateData {
  subject: string
  recipientName: string
  notificationType: string
  title: string
  message: string
  data?: any
}

export class EmailTemplate {
  static render(data: EmailTemplateData): string {
    const { subject, recipientName, notificationType, title, message, data: additionalData } = data

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(subject)}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .notification-type {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
        }
        .message {
            line-height: 1.8;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${this.escapeHtml(title)}</h1>
    </div>
    <div class="content">
        <span class="notification-type">${this.escapeHtml(notificationType)}</span>
        <p>Dear ${this.escapeHtml(recipientName)},</p>
        <div class="message">
            ${this.escapeHtml(message)}
        </div>
        ${this.renderAdditionalData(additionalData)}
        <div class="footer">
            <p>This is an automated notification from Football Manager.</p>
            <p>If you have any questions, please contact support.</p>
        </div>
    </div>
</body>
</html>
`

    return DOMPurify.sanitize(html)
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }

  private static renderAdditionalData(data?: any): string {
    if (!data || Object.keys(data).length === 0) {
      return ''
    }

    const items = Object.entries(data)
      .filter(([_, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `<li><strong>${this.escapeHtml(key)}:</strong> ${this.escapeHtml(String(value))}</li>`)
      .join('')

    return `
      <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #667eea;">
        <h3 style="margin-top: 0; color: #667eea;">Additional Details</h3>
        <ul style="margin-bottom: 0;">${items}</ul>
      </div>
    `
  }
}
