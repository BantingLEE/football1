import { Notification, INotification, NotificationType } from '../models/Notification'
import { sendEmail } from '../email/mailer'

export class NotificationService {
  async createNotification(userId: string, type: NotificationType, title: string, message: string, data?: any): Promise<INotification> {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!type) {
        throw new Error('Notification type is required')
      }
      if (!title) {
        throw new Error('Title is required')
      }
      if (!message) {
        throw new Error('Message is required')
      }

      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        read: false,
        priority: this.determinePriority(type)
      })

      return notification
    } catch (error) {
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<INotification[]> {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const query: any = { userId }
      if (unreadOnly) {
        query.read = false
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .exec()

      return notifications
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required')
      }
      if (!userId) {
        throw new Error('User ID is required')
      }

      const notification = await Notification.findById(notificationId).exec()
      if (!notification) {
        throw new Error('Notification not found')
      }

      if (notification.userId !== userId) {
        throw new Error('Unauthorized')
      }

      notification.read = true
      await notification.save()

      return notification
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      ).exec()

      return { modifiedCount: result.modifiedCount || 0 }
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<INotification | null> {
    try {
      if (!notificationId) {
        throw new Error('Notification ID is required')
      }
      if (!userId) {
        throw new Error('User ID is required')
      }

      const notification = await Notification.findByIdAndDelete(notificationId).exec()
      return notification
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendEmailNotification(userId: string, subject: string, body: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      if (!subject) {
        throw new Error('Subject is required')
      }
      if (!body) {
        throw new Error('Body is required')
      }

      const result = await sendEmail(userId, subject, body)

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email')
      }

      return {
        success: true,
        messageId: result.messageId
      }
    } catch (error) {
      throw new Error(`Failed to send email notification: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async batchCreateNotifications(userIds: string[], type: NotificationType, title: string, message: string, data?: any): Promise<INotification[]> {
    try {
      if (!userIds || userIds.length === 0) {
        throw new Error('User IDs array is required')
      }
      if (!type) {
        throw new Error('Notification type is required')
      }
      if (!title) {
        throw new Error('Title is required')
      }
      if (!message) {
        throw new Error('Message is required')
      }

      const priority = this.determinePriority(type)

      const notifications = userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        data,
        read: false,
        priority
      }))

      const createdNotifications = await Notification.insertMany(notifications)
      return createdNotifications
    } catch (error) {
      throw new Error(`Failed to create batch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private determinePriority(type: NotificationType): 'low' | 'normal' | 'high' {
    const highPriorityTypes: NotificationType[] = ['injury_report', 'transfer_complete']
    const lowPriorityTypes: NotificationType[] = ['financial_report', 'training_complete']

    if (highPriorityTypes.includes(type)) {
      return 'high'
    }
    if (lowPriorityTypes.includes(type)) {
      return 'low'
    }
    return 'normal'
  }
}
