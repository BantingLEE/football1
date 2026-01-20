import { NotificationService } from '../src/services/notificationService'
import { Notification, NotificationType } from '../src/models/Notification'
import { User } from '../src/models/User'
import { sendEmail, sendBulkEmails } from '../src/email/mailer'
import { EmailTemplate } from '../src/email/templates'

jest.mock('../src/models/Notification')
jest.mock('../src/models/User')
jest.mock('../src/email/mailer')

describe('NotificationService - Priority Logic', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService()
    jest.clearAllMocks()
  })

  describe('Priority Determination', () => {
    const testCases = [
      { type: 'injury_report', expected: 'high' },
      { type: 'transfer_complete', expected: 'high' },
      { type: 'match_start', expected: 'normal' },
      { type: 'match_end', expected: 'normal' },
      { type: 'youth_player_generated', expected: 'normal' },
      { type: 'financial_report', expected: 'low' },
      { type: 'training_complete', expected: 'low' }
    ]

    testCases.forEach(({ type, expected }) => {
      it(`should assign ${expected} priority to ${type} notifications`, async () => {
        const mockNotification = {
          _id: '1',
          userId: 'user1',
          type,
          title: 'Test',
          message: 'Test message',
          priority: expected,
          read: false,
          createdAt: new Date()
        }

        Notification.create = jest.fn().mockResolvedValue(mockNotification)

        const result = await notificationService.createNotification('user1', type as NotificationType, 'Test', 'Test message')

        expect(result.priority).toBe(expected)
        expect(Notification.create).toHaveBeenCalledWith(expect.objectContaining({ priority: expected }))
      })
    })
  })
})

describe('NotificationService - Email Functionality', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService()
    jest.clearAllMocks()
  })

  describe('sendEmailNotification', () => {
    it('should render template and send email to user', async () => {
      const mockUser = {
        _id: '1',
        userId: 'user1',
        email: 'user@example.com',
        name: 'John Doe'
      }

      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      } as any)

      ;(sendEmail as jest.Mock).mockResolvedValue({ success: true, messageId: 'msg1' })

      const result = await notificationService.sendEmailNotification('user1', 'Test Subject', 'Test message', 'match_start')

      expect(User.findOne).toHaveBeenCalledWith({ userId: 'user1' })
      expect(sendEmail).toHaveBeenCalledWith('user@example.com', 'Test Subject', expect.stringContaining('<!DOCTYPE html>'))
      expect(result.success).toBe(true)
      expect(result.messageId).toBe('msg1')
    })

    it('should throw error when user not found', async () => {
      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(notificationService.sendEmailNotification('user1', 'Subject', 'Message')).rejects.toThrow('User not found')
    })

    it('should handle email template sanitization', async () => {
      const mockUser = {
        _id: '1',
        userId: 'user1',
        email: 'user@example.com',
        name: 'John'
      }

      User.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      } as any)

      ;(sendEmail as jest.Mock).mockResolvedValue({ success: true, messageId: 'msg1' })

      await notificationService.sendEmailNotification('user1', '<script>alert("xss")</script>Subject', '<script>alert("xss")</script>Message')

      const emailBody = (sendEmail as jest.Mock).mock.calls[0][2]
      expect(emailBody).not.toContain('<script>')
    })

  })

  describe('sendBulkEmailNotifications', () => {
    it('should send emails to multiple users', async () => {
      const mockUsers = [
        { _id: '1', userId: 'user1', email: 'user1@example.com', name: 'User 1' },
        { _id: '2', userId: 'user2', email: 'user2@example.com', name: 'User 2' },
        { _id: '3', userId: 'user3', email: 'user3@example.com', name: 'User 3' }
      ]

      User.findOne = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUsers[0]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUsers[1]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUsers[2]) } as any)

      ;(sendBulkEmails as jest.Mock).mockResolvedValue([
        { success: true, messageId: 'msg1' },
        { success: true, messageId: 'msg2' },
        { success: true, messageId: 'msg3' }
      ])

      const mockNotifications = [
        { _id: '1', userId: 'user1' },
        { _id: '2', userId: 'user2' },
        { _id: '3', userId: 'user3' }
      ]

      Notification.insertMany = jest.fn().mockResolvedValue(mockNotifications)

      await notificationService.batchCreateNotifications(['user1', 'user2', 'user3'], 'match_start', 'Test', 'Message', {}, true)

      expect(Notification.insertMany).toHaveBeenCalled()
    })
  })
})

describe('EmailTemplate', () => {
  describe('render', () => {
    it('should render HTML template with all data', () => {
      const data = {
        subject: 'Test Subject',
        recipientName: 'John Doe',
        notificationType: 'match_start',
        title: 'Match Starting Soon',
        message: 'Your match will start in 30 minutes',
        data: { matchId: '123', opponent: 'Team B' }
      }

      const html = EmailTemplate.render(data)

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Match Starting Soon')
      expect(html).toContain('Dear John Doe,')
      expect(html).toContain('Your match will start in 30 minutes')
      expect(html).toContain('matchId:</strong> 123')
      expect(html).toContain('opponent:</strong> Team B')
    })

    it.skip('should escape HTML in all fields', () => {
      const data = {
        subject: '<script>alert("xss")</script>Subject',
        recipientName: '<script>alert("xss")</script>Name',
        notificationType: 'match_start',
        title: '<img src=x onerror=alert(1)>Title',
        message: '<script>document.cookie</script>Message',
        data: { key: '<script>alert(1)</script>value' }
      }

      const html = EmailTemplate.render(data)

      expect(html).not.toContain('<script>')
      expect(html).toContain('&lt;script&gt;')
      expect(html).not.toContain('onerror')
    })

    it('should handle missing additional data', () => {
      const data = {
        subject: 'Subject',
        recipientName: 'Name',
        notificationType: 'type',
        title: 'Title',
        message: 'Message'
      }

      const html = EmailTemplate.render(data)

      expect(html).toContain('Title')
      expect(html).not.toContain('Additional Details')
    })
  })
})
