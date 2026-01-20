import { Router } from 'express'
import * as notificationController from '../controllers/notificationController'

const router = Router()

router.post('/', notificationController.createNotification)
router.get('/:userId', notificationController.getUserNotifications)
router.put('/:id/read', notificationController.markAsRead)
router.put('/user/:userId/read-all', notificationController.markAllAsRead)
router.delete('/:id/:userId', notificationController.deleteNotification)
router.post('/email', notificationController.sendEmailNotification)
router.post('/batch', notificationController.batchCreateNotifications)

export default router
