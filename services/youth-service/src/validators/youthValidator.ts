import Joi from 'joi'

export const generateYouthPlayersSchema = Joi.object({
  clubId: Joi.string().required()
})

export const upgradeFacilitySchema = Joi.object({
  targetLevel: Joi.number().min(1).max(5).required()
})

export const trainYouthPlayerSchema = Joi.object({
  trainingType: Joi.string().valid('technical', 'physical', 'tactical', 'goalkeeping').required(),
  duration: Joi.number().min(1).max(365).default(7)
})
