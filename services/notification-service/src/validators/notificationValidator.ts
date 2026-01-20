import Joi from 'joi'

export const notificationCreateSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid('match_start', 'match_end', 'transfer_complete', 'injury_report', 'training_complete', 'financial_report', 'youth_player_generated').required(),
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(1000).required(),
  data: Joi.any(),
  priority: Joi.string().valid('low', 'normal', 'high')
})

export const markAsReadSchema = Joi.object({
  userId: Joi.string().required()
})

export const batchNotificationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required(),
  type: Joi.string().valid('match_start', 'match_end', 'transfer_complete', 'injury_report', 'training_complete', 'financial_report', 'youth_player_generated').required(),
  title: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(1000).required(),
  data: Joi.any()
})

export const emailNotificationSchema = Joi.object({
  userId: Joi.string().required(),
  subject: Joi.string().min(1).max(200).required(),
  body: Joi.string().min(1).max(10000).required()
})
