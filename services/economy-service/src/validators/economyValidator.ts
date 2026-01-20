import Joi from 'joi'

export const processTransferSchema = Joi.object({
  playerId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  fromClubId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  toClubId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  transferFee: Joi.number().required().min(0),
  type: Joi.string().valid('permanent', 'loan', 'free').required(),
  contractLength: Joi.number().integer().min(1).optional()
})

export const getTransferListSchema = Joi.object({
  type: Joi.string().valid('permanent', 'loan', 'free').optional(),
  status: Joi.string().valid('active', 'pending', 'completed', 'cancelled').optional(),
  fromClubId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  toClubId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
})

export const updateBudgetSchema = Joi.object({
  income: Joi.number().min(0).default(0),
  expense: Joi.number().min(0).default(0)
})

export const getFinancialReportSchema = Joi.object({
  period: Joi.string().valid('weekly', 'monthly', 'yearly').required()
})

export const clubIdSchema = Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)

export const createFinancialRecordSchema = Joi.object({
  clubId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
  recordType: Joi.string().valid('income', 'expense').required(),
  type: Joi.string().valid('ticket', 'broadcast', 'sponsorship', 'merchandise', 'wages', 'transfer', 'operations', 'penalty', 'other').required(),
  amount: Joi.number().required().min(0),
  description: Joi.string().max(500).optional(),
  transferId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional()
})

export const getFinancialRecordsQuerySchema = Joi.object({
  recordType: Joi.string().valid('income', 'expense').optional(),
  type: Joi.string().valid('ticket', 'broadcast', 'sponsorship', 'merchandise', 'wages', 'transfer', 'operations', 'penalty', 'other').optional(),
  limit: Joi.number().integer().min(1).max(1000).default(100),
  skip: Joi.number().integer().min(0).default(0)
})
