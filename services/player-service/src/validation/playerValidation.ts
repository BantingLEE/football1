import Joi from 'joi'

export const playerCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  age: Joi.number().min(14).max(40).required(),
  nationality: Joi.string().min(2).max(50).required(),
  height: Joi.number().min(150).max(220).required(),
  weight: Joi.number().min(50).max(120).required(),
  position: Joi.string().valid('GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'ST', 'CF', 'LW', 'RW').required(),
  attributes: Joi.object({
    speed: Joi.number().min(0).max(99),
    shooting: Joi.number().min(0).max(99),
    passing: Joi.number().min(0).max(99),
    defending: Joi.number().min(0).max(99),
    physical: Joi.number().min(0).max(99),
    technical: Joi.number().min(0).max(99),
    mental: Joi.number().min(0).max(99),
    goalkeeping: Joi.number().min(0).max(99)
  }),
  potential: Joi.number().min(0).max(99),
  currentAbility: Joi.number().min(0).max(99),
  contract: Joi.object({
    salary: Joi.number().min(0),
    expiresAt: Joi.date().required(),
    bonus: Joi.number().min(0)
  }),
  injury: Joi.object({
    isInjured: Joi.boolean(),
    type: Joi.string(),
    recoveryTime: Joi.number().min(0)
  }),
  clubId: Joi.string(),
  isYouth: Joi.boolean()
})

export const playerUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  age: Joi.number().min(14).max(40),
  nationality: Joi.string().min(2).max(50),
  height: Joi.number().min(150).max(220),
  weight: Joi.number().min(50).max(120),
  position: Joi.string().valid('GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'ST', 'CF', 'LW', 'RW'),
  attributes: Joi.object({
    speed: Joi.number().min(0).max(99),
    shooting: Joi.number().min(0).max(99),
    passing: Joi.number().min(0).max(99),
    defending: Joi.number().min(0).max(99),
    physical: Joi.number().min(0).max(99),
    technical: Joi.number().min(0).max(99),
    mental: Joi.number().min(0).max(99),
    goalkeeping: Joi.number().min(0).max(99)
  }),
  potential: Joi.number().min(0).max(99),
  currentAbility: Joi.number().min(0).max(99),
  contract: Joi.object({
    salary: Joi.number().min(0),
    expiresAt: Joi.date(),
    bonus: Joi.number().min(0)
  }),
  injury: Joi.object({
    isInjured: Joi.boolean(),
    type: Joi.string(),
    recoveryTime: Joi.number().min(0)
  }),
  clubId: Joi.string(),
  isYouth: Joi.boolean()
})

export const trainingSchema = Joi.object({
  trainingType: Joi.string().valid('technical', 'physical', 'tactical', 'goalkeeping').required()
})

export const transferSchema = Joi.object({
  fromClubId: Joi.string().required(),
  toClubId: Joi.string().required()
})
