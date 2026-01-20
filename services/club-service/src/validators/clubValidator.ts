import Joi from 'joi'

export const createClubSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  foundedYear: Joi.number().required().integer().min(1800).max(new Date().getFullYear()),
  city: Joi.string().required().min(2).max(100),
  stadium: Joi.object({
    name: Joi.string().required().min(2).max(100),
    capacity: Joi.number().required().integer().min(1000).max(1000000)
  }).required(),
  finances: Joi.object({
    budget: Joi.number().min(0),
    cash: Joi.number().min(0)
  }).optional(),
  youthFacility: Joi.object({
    level: Joi.number().integer().min(1).max(5),
    capacity: Joi.number().integer().min(1).max(100),
    trainingQuality: Joi.number().min(0).max(1)
  }).optional(),
  tacticalPreference: Joi.object({
    formation: Joi.string().valid('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'),
    attacking: Joi.number().integer().min(0).max(100),
    defending: Joi.number().integer().min(0).max(100)
  }).optional()
})

export const updateClubSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  foundedYear: Joi.number().integer().min(1800).max(new Date().getFullYear()),
  city: Joi.string().min(2).max(100),
  stadium: Joi.object({
    name: Joi.string().min(2).max(100),
    capacity: Joi.number().integer().min(1000).max(1000000)
  }),
  finances: Joi.object({
    budget: Joi.number().min(0),
    cash: Joi.number().min(0)
  }),
  youthFacility: Joi.object({
    level: Joi.number().integer().min(1).max(5),
    capacity: Joi.number().integer().min(1).max(100),
    trainingQuality: Joi.number().min(0).max(1)
  }),
  tacticalPreference: Joi.object({
    formation: Joi.string().valid('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'),
    attacking: Joi.number().integer().min(0).max(100),
    defending: Joi.number().integer().min(0).max(100)
  })
}).min(1)

export const updateFinancesSchema = Joi.object({
  income: Joi.number().required().min(0),
  expense: Joi.number().required().min(0)
})

export const idSchema = Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)
