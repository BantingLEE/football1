import { NotificationService } from '../src/services/notificationService'
import { Notification, NotificationType } from '../src/models/Notification'
import { User } from '../src/models/User'

jest.mock('../src/models/Notification')
jest.mock('../src/models/User')

describe('NotificationService - Concurrent Operations', () => {
  let notificationService: NotificationService

  beforeEach(() => {
    notificationService = new NotificationService()
    jest.clearAllMocks()
  })

  describe('Concurrent Create Operations', () => {
    it('should handle multiple concurrent create requests', async () => {
      const userIds = ['user1', 'user2', 'user3', 'user4', 'user5']
      const createPromises = userIds.map((userId, index) =>
        notificationService.createNotification(
          userId,
          'match_start',
          `Title ${index}`,
          `Message ${index}`,
          { index }
        )
      )

      const mockNotifications = userIds.map((userId, index) => ({
        _id: String(index + 1),
        userId,
        type: 'match_start',
        title: `Title ${index}`,
        message: `Message ${index}`,
        data: { index },
        read: false,
        priority: 'normal',
        createdAt: new Date()
      }))

      Notification.create = jest.fn()
        .mockResolvedValueOnce(mockNotifications[0])
        .mockResolvedValueOnce(mockNotifications[1])
        .mockResolvedValueOnce(mockNotifications[2])
        .mockResolvedValueOnce(mockNotifications[3])
        .mockResolvedValueOnce(mockNotifications[4])

      const results = await Promise.all(createPromises)

      expect(results).toHaveLength(5)
      
      results.forEach((result: any, index) => {
        expect(result).toBeDefined()
        if (result) {
          expect(result.userId).toBe(userIds[index])
          expect(result.title).toBe(`Title ${index}`)
        }
      })
    })
    })

    it('should handle mixed concurrent operations', async () => {
      const mockNotification = {
        _id: '1',
        userId: 'user1',
        type: 'match_start',
        title: 'Title',
        message: 'Message',
        read: false,
        priority: 'normal',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      }

      Notification.create = jest.fn().mockResolvedValue(mockNotification)
      Notification.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification)
      } as any)
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockNotification])
        })
      } as any)

      const operations = [
        notificationService.createNotification('user1', 'match_start', 'Title', 'Message'),
        notificationService.getUserNotifications('user1'),
        notificationService.markAsRead('1', 'user1')
      ]

      const results = await Promise.all(operations)

      expect(results).toHaveLength(3)
      expect((results[0] as any).userId).toBe('user1')
      expect((results[1] as any[])).toHaveLength(1)
      expect((results[2] as any).read).toBe(true)
    })
  })

  describe('Concurrent Mark as Read Operations', () => {
    it('should handle multiple concurrent markAsRead requests for same user', async () => {
      const notificationIds = ['notif1', 'notif2', 'notif3']
      const userId = 'user1'

      const mockNotifications = notificationIds.map(id => ({
        _id: id,
        userId,
        read: false,
        save: jest.fn().mockResolvedValue(true)
      }))

      Notification.findById = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[0]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[1]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[2]) } as any)

      const promises = notificationIds.map(id =>
        notificationService.markAsRead(id, userId)
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach(result => {
        expect(result.read).toBe(true)
        expect(result.userId).toBe(userId)
      })
      expect(Notification.findById).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent markAsRead from different users without race conditions', async () => {
      const mockNotificationUser1 = {
        _id: 'notif1',
        userId: 'user1',
        read: false,
        save: jest.fn().mockResolvedValue(true)
      }

      const mockNotificationUser2 = {
        _id: 'notif2',
        userId: 'user2',
        read: false,
        save: jest.fn().mockResolvedValue(true)
      }

      Notification.findById = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotificationUser1) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotificationUser2) } as any)

      const results = await Promise.all([
        notificationService.markAsRead('notif1', 'user1'),
        notificationService.markAsRead('notif2', 'user2')
      ])

      expect(results[0].userId).toBe('user1')
      expect(results[1].userId).toBe('user2')
    })
  })

  describe('Concurrent Delete Operations', () => {
    it('should handle multiple concurrent delete requests', async () => {
      const notificationIds = ['notif1', 'notif2', 'notif3']
      const userId = 'user1'

      const mockNotifications = notificationIds.map(id => ({
        _id: id,
        userId
      }))

      Notification.findById = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[0]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[1]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[2]) } as any)

      Notification.findByIdAndDelete = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[0]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[1]) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotifications[2]) } as any)

      const promises = notificationIds.map(id =>
        notificationService.deleteNotification(id, userId)
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result?._id).toBe(notificationIds[index])
      })
    })

    it('should prevent unauthorized concurrent deletions', async () => {
      const mockNotificationUser1 = {
        _id: 'notif1',
        userId: 'user1'
      }

      Notification.findById = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotificationUser1) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotificationUser1) } as any)

      Notification.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotificationUser1)
      } as any)

      const results = await Promise.allSettled([
        notificationService.deleteNotification('notif1', 'user1'),
        notificationService.deleteNotification('notif1', 'user2')
      ])

      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
    })
  })

  describe('Concurrent Batch Operations', () => {
    it('should handle multiple concurrent batchCreateNotifications requests', async () => {
      const batches = [
        { userIds: ['user1', 'user2'], title: 'Batch 1' },
        { userIds: ['user3', 'user4'], title: 'Batch 2' },
        { userIds: ['user5', 'user6'], title: 'Batch 3' }
      ]

      const mockNotifications = batches.map(batch =>
        batch.userIds.map(userId => ({
          _id: `${userId}-notif`,
          userId,
          type: 'match_start',
          title: batch.title,
          message: 'Message',
          read: false,
          priority: 'normal'
        }))
      ).flat()

      Notification.insertMany = jest.fn()
        .mockResolvedValueOnce(mockNotifications.slice(0, 2))
        .mockResolvedValueOnce(mockNotifications.slice(2, 4))
        .mockResolvedValueOnce(mockNotifications.slice(4, 6))

      const promises = batches.map(batch =>
        notificationService.batchCreateNotifications(
          batch.userIds,
          'match_start',
          batch.title,
          'Message'
        )
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      results.forEach((result, index) => {
        expect(result).toHaveLength(2)
        expect(result[0].title).toBe(batches[index].title)
      })
      expect(Notification.insertMany).toHaveBeenCalledTimes(3)
    })

    it('should handle concurrent markAllAsRead operations', async () => {
      const userIds = ['user1', 'user2', 'user3']

      Notification.updateMany = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ modifiedCount: 5 }) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ modifiedCount: 3 }) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue({ modifiedCount: 7 }) } as any)

      const promises = userIds.map(userId =>
        notificationService.markAllAsRead(userId)
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(3)
      expect(results[0].modifiedCount).toBe(5)
      expect(results[1].modifiedCount).toBe(3)
      expect(results[2].modifiedCount).toBe(7)
    })
  })

  describe('Concurrent Mixed Authorization Checks', () => {
    it('should handle mixed authorized and unauthorized operations', async () => {
      const mockNotification = {
        _id: 'notif1',
        userId: 'user1',
        read: false,
        save: jest.fn().mockResolvedValue(true)
      }

      Notification.findById = jest.fn()
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotification) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotification) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotification) } as any)
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockNotification) } as any)

      Notification.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockNotification)
      } as any)

      const results = await Promise.allSettled([
        notificationService.markAsRead('notif1', 'user1'),
        notificationService.markAsRead('notif1', 'user2'),
        notificationService.deleteNotification('notif1', 'user1'),
        notificationService.deleteNotification('notif1', 'user2')
      ])

      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('rejected')
      expect(results[2].status).toBe('fulfilled')
      expect(results[3].status).toBe('rejected')
    })
  })
})
