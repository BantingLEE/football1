import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
})

export async function sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!to || !subject || !body) {
      throw new Error('Missing required fields: to, subject, or body')
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@footballmanager.com',
      to,
      subject,
      html: body
    })

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
