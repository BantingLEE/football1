import { NotificationService } from '../src/services/notificationService'
import { Notification, NotificationType } from '../src/models/Notification'

jest.mock('../src/models/Notification')
jest.mock('../src/email/mailer')

import { sendEmail } from '../src/email/mailer'

describe('NotificationService', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService()
    jest.clearAllMocks()
  })

  describe('createNotification', () => {
    it('should create a new notification', async () => {
      const mockNotification = {
        _id: '1',
        userId: 'user1',
        type: 'match_start',
        title: 'Match Starting',
        message: 'Your match is about to start',
        data: { matchId: 'match1' },
        read: false,
        priority: 'normal',
        createdAt: new Date()
      }

      Notification.create = jest.fn().mockResolvedValue(mockNotification)

      const result = await notificationService.createNotification('user1', 'match_start', 'Match Starting', 'Your match is about to start', { matchId: 'match1' })

      expect(Notification.create).toHaveBeenCalled()
      expect(result.userId).toBe('user1')
      expect(result.type).toBe('match_start')
      expect(result.read).toBe(false)
    })

    it('should throw error when userId is missing', async () => {
      await expect(notificationService.createNotification('', 'match_start', 'Title', 'Message')).rejects.toThrow('User ID is required')
    })

    it('should throw error when type is missing', async () => {
      await expect(notificationService.createNotification('user1', '' as NotificationType, 'Title', 'Message')).rejects.toThrow('Notification type is required')
    })

    it('should throw error when title is missing', async () => {
      await expect(notificationService.createNotification('user1', 'match_start', '', 'Message')).rejects.toThrow('Title is required')
    })

    it('should throw error when message is missing', async () => {
      await expect(notificationService.createNotification('user1', 'match_start', 'Title', '')).rejects.toThrow('Message is required')
    })

    it('should throw error when database creation fails', async () => {
      Notification.create = jest.fn().mockRejectedValue(new Error('Database error'))

      await expect(notificationService.createNotification('user1', 'match_start', 'Title', 'Message')).rejects.toThrow('Failed to create notification')
    })
  })

  describe('getUserNotifications', () => {
    it('should return all notifications for a user', async () => {
      const mockNotifications = [
        { _id: '1', userId: 'user1', read: false },
        { _id: '2', userId: 'user1', read: false }
      ]
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotifications)
        })
      } as any)

      const result = await notificationService.getUserNotifications('user1')

      expect(Notification.find).toHaveBeenCalledWith({ userId: 'user1' })
      expect(result).toHaveLength(2)
    })

    it('should return only unread notifications when unreadOnly is true', async () => {
      const mockNotifications = [
        { _id: '1', userId: 'user1', read: false }
      ]
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockNotifications)
        })
      } as any)

      const result = await notificationService.getUserNotifications('user1', true)

      expect(Notification.find).toHaveBeenCalledWith({ userId: 'user1', read: false })
      expect(result).toHaveLength(1)
    })

    it('should throw error when userId is missing', async () => {
      await expect(notificationService.getUserNotifications('')).rejects.toThrow('User ID is required')
    })

    it('should throw error when database query fails', async () => {
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      } as any)

      await expect(notificationService.getUserNotifications('user1')).rejects.toThrow('Failed to fetch notifications')
    })
  })

  describe('markAsRead', () => {
    const mockNotification = {
      _id: '1',
      userId: 'user1',
      read: false,
      save: jest.fn().mockResolvedValue(true)
    }

    it('should mark notification as read', async () => {
      Notification.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification)
      } as any)

      const result = await notificationService.markAsRead('1', 'user1')

      expect(Notification.findById).toHaveBeenCalledWith('1')
      expect(mockNotification.read).toBe(true)
      expect(mockNotification.save).toHaveBeenCalled()
    })

    it('should throw error when notification not found', async () => {
      Notification.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      await expect(notificationService.markAsRead('999', 'user1')).rejects.toThrow('Notification not found')
    })

    it('should throw error when notification belongs to different user', async () => {
      const wrongUserNotification = {
        _id: '1',
        userId: 'user2',
        read: false,
        save: jest.fn()
      }
      Notification.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(wrongUserNotification)
      } as any)

      await expect(notificationService.markAsRead('1', 'user1')).rejects.toThrow('Unauthorized')
    })

    it('should throw error when notificationId is missing', async () => {
      await expect(notificationService.markAsRead('', 'user1')).rejects.toThrow('Notification ID is required')
    })

    it('should throw error when userId is missing', async () => {
      await expect(notificationService.markAsRead('1', '')).rejects.toThrow('User ID is required')
    })

    it('should throw error when database operation fails', async () => {
      Notification.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(notificationService.markAsRead('1', 'user1')).rejects.toThrow('Failed to mark notification as read')
    })
  })

  describe('markAllAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      Notification.updateMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 5 })
      } as any)

      const result = await notificationService.markAllAsRead('user1')

      expect(Notification.updateMany).toHaveBeenCalledWith({ userId: 'user1', read: false }, { read: true })
      expect(result.modifiedCount).toBe(5)
    })

    it('should throw error when userId is missing', async () => {
      await expect(notificationService.markAllAsRead('')).rejects.toThrow('User ID is required')
    })

    it('should throw error when database operation fails', async () => {
      Notification.updateMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(notificationService.markAllAsRead('user1')).rejects.toThrow('Failed to mark all notifications as read')
    })
  })

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const mockNotification = {
        _id: '1',
        userId: 'user1'
      }
      Notification.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification)
      } as any)

      const result = await notificationService.deleteNotification('1', 'user1')

      expect(Notification.findByIdAndDelete).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockNotification)
    })

    it('should return null when notification not found', async () => {
      Notification.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      } as any)

      const result = await notificationService.deleteNotification('999', 'user1')

      expect(result).toBeNull()
    })

    it('should throw error when notificationId is missing', async () => {
      await expect(notificationService.deleteNotification('', 'user1')).rejects.toThrow('Notification ID is required')
    })

    it('should throw error when userId is missing', async () => {
      await expect(notificationService.deleteNotification('1', '')).rejects.toThrow('User ID is required')
    })

    it('should throw error when database operation fails', async () => {
      Notification.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error'))
      } as any)

      await expect(notificationService.deleteNotification('1', 'user1')).rejects.toThrow('Failed to delete notification')
    })
  })

  describe('sendEmailNotification', () => {
    it('should send email notification', async () => {
      (sendEmail as jest.Mock).mockResolvedValue({ success: true, messageId: 'msg1' })

      const result = await notificationService.sendEmailNotification('user1', 'Test Subject', 'Test Body')

      expect(sendEmail).toHaveBeenCalledWith('user1', 'Test Subject', 'Test Body')
      expect(result).toEqual({ success: true, messageId: 'msg1' })
    })

    it('should throw error when userId is missing', async () => {
      await expect(notificationService.sendEmailNotification('', 'Subject', 'Body')).rejects.toThrow('User ID is required')
    })

    it('should throw error when subject is missing', async () => {
      await expect(notificationService.sendEmailNotification('user1', '', 'Body')).rejects.toThrow('Subject is required')
    })

    it('should throw error when body is missing', async () => {
      await expect(notificationService.sendEmailNotification('user1', 'Subject', '')).rejects.toThrow('Body is required')
    })

    it('should throw error when email sending fails', async () => {
      (sendEmail as jest.Mock).mockRejectedValue(new Error('Email error'))

      await expect(notificationService.sendEmailNotification('user1', 'Subject', 'Body')).rejects.toThrow('Failed to send email notification')
    })
  })

  describe('batchCreateNotifications', () => {
    it('should create notifications for multiple users', async () => {
      const mockNotifications = [
        { _id: '1', userId: 'user1', type: 'match_start' },
        { _id: '2', userId: 'user2', type: 'match_start' }
      ]
      Notification.insertMany = jest.fn().mockResolvedValue(mockNotifications)

      const result = await notificationService.batchCreateNotifications(['user1', 'user2'], 'match_start', 'Match Starting', 'Your match is about to start')

      expect(Notification.insertMany).toHaveBeenCalled()
      expect(result).toHaveLength(2)
    })

    it('should throw error when userIds is empty', async () => {
      await expect(notificationService.batchCreateNotifications([], 'match_start', 'Title', 'Message')).rejects.toThrow('User IDs array is required')
    })

    it('should throw error when type is missing', async () => {
      await expect(notificationService.batchCreateNotifications(['user1'], '' as NotificationType, 'Title', 'Message')).rejects.toThrow('Notification type is required')
    })

    it('should throw error when title is missing', async () => {
      await expect(notificationService.batchCreateNotifications(['user1'], 'match_start', '', 'Message')).rejects.toThrow('Title is required')
    })

    it('should throw error when message is missing', async () => {
      await expect(notificationService.batchCreateNotifications(['user1'], 'match_start', 'Title', '')).rejects.toThrow('Message is required')
    })

    it('should throw error when database operation fails', async () => {
      Notification.insertMany = jest.fn().mockRejectedValue(new Error('Database error'))

      await expect(notificationService.batchCreateNotifications(['user1'], 'match_start', 'Title', 'Message')).rejects.toThrow('Failed to create batch notifications')
    })
  })
})
