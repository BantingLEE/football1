import { Request, Response } from 'express'
import { NotificationService } from '../services/notificationService'
import { notificationCreateSchema, markAsReadSchema, batchNotificationSchema, emailNotificationSchema } from '../validators/notificationValidator'

const notificationService = new NotificationService()

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { error, value } = notificationCreateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const notification = await notificationService.createNotification(value.userId, value.type, value.title, value.message, value.data)
    res.status(201).json(notification)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create notification' })
  }
}

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const unreadOnly = req.query.unreadOnly === 'true'
    const notifications = await notificationService.getUserNotifications(userId, unreadOnly)
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch notifications' })
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' })
    }

    const { error, value } = markAsReadSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const notification = await notificationService.markAsRead(id, value.userId)
    res.json(notification)
  } catch (error) {
    const statusCode = error instanceof Error && error.message === 'Notification not found' ? 404 : 500
    res.status(statusCode).json({ error: error instanceof Error ? error.message : 'Failed to mark notification as read' })
  }
}

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const result = await notificationService.markAllAsRead(userId)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' })
  }
}

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params
    if (!id) {
      return res.status(400).json({ error: 'Notification ID is required' })
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const notification = await notificationService.deleteNotification(id, userId)
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }
    res.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete notification' })
  }
}

export const sendEmailNotification = async (req: Request, res: Response) => {
  try {
    const { error, value } = emailNotificationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const result = await notificationService.sendEmailNotification(value.userId, value.subject, value.body)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send email notification' })
  }
}

export const batchCreateNotifications = async (req: Request, res: Response) => {
  try {
    const { error, value } = batchNotificationSchema.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }

    const notifications = await notificationService.batchCreateNotifications(value.userIds, value.type, value.title, value.message, value.data)
    res.status(201).json(notifications)
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create batch notifications' })
  }
}
