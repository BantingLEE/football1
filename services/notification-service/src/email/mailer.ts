import nodemailer from 'nodemailer'

interface EmailJob {
  id: string
  to: string
  subject: string
  body: string
  attempts: number
  maxRetries: number
  resolve: (value: any) => void
  reject: (reason?: any) => void
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
})

const emailQueue: EmailJob[] = []
let isProcessing = false

const MAX_RETRIES = 3
const RETRY_DELAY = 1000

function processQueue() {
  if (isProcessing || emailQueue.length === 0) {
    return
  }

  isProcessing = true
  const job = emailQueue.shift()!

  sendEmailWithRetry(job).finally(() => {
    isProcessing = false
    processQueue()
  })
}

async function sendEmailWithRetry(job: EmailJob) {
  try {
    const result = await sendEmailInternal(job.to, job.subject, job.body)
    job.resolve(result)
  } catch (error) {
    if (job.attempts < job.maxRetries) {
      job.attempts++
      const delay = RETRY_DELAY * Math.pow(2, job.attempts - 1)
      
      setTimeout(() => {
        emailQueue.push(job)
        processQueue()
      }, delay)
    } else {
      job.reject(error)
    }
  }
}

async function sendEmailInternal(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
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
}

export async function sendEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return new Promise((resolve, reject) => {
    const job: EmailJob = {
      id: Math.random().toString(36).substr(2, 9),
      to,
      subject,
      body,
      attempts: 0,
      maxRetries: MAX_RETRIES,
      resolve,
      reject
    }

    emailQueue.push(job)
    processQueue()
  })
}

export async function sendBulkEmails(emails: Array<{ to: string; subject: string; body: string }>): Promise<Array<{ success: boolean; messageId?: string; error?: string }>> {
  const promises = emails.map(email => sendEmail(email.to, email.subject, email.body))
  return Promise.all(promises)
}
