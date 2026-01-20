import Joi from 'joi'

export const createMatchSchema = Joi.object({
  homeTeam: Joi.object({
    clubId: Joi.string().required(),
    lineup: Joi.array().items(Joi.string()).optional(),
    tactics: Joi.object({
      formation: Joi.string().valid('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3').optional(),
      attacking: Joi.number().integer().min(0).max(100).optional(),
      defending: Joi.number().integer().min(0).max(100).optional(),
      playStyle: Joi.string().valid('possession', 'counter', 'long-ball').optional()
    }).optional()
  }).required(),
  awayTeam: Joi.object({
    clubId: Joi.string().required(),
    lineup: Joi.array().items(Joi.string()).optional(),
    tactics: Joi.object({
      formation: Joi.string().valid('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3').optional(),
      attacking: Joi.number().integer().min(0).max(100).optional(),
      defending: Joi.number().integer().min(0).max(100).optional(),
      playStyle: Joi.string().valid('possession', 'counter', 'long-ball').optional()
    }).optional()
  }).required(),
  date: Joi.date().required(),
  leagueId: Joi.string().required(),
  status: Joi.string().valid('scheduled', 'live', 'completed', 'postponed').optional(),
  events: Joi.array().items(Joi.object()).optional(),
  statistics: Joi.object().optional(),
  playerRatings: Joi.object().optional()
})

export const updateMatchSchema = Joi.object({
  homeTeam: Joi.object({
    clubId: Joi.string(),
    lineup: Joi.array().items(Joi.string()),
    tactics: Joi.object({
      formation: Joi.string().valid('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'),
      attacking: Joi.number().integer().min(0).max(100),
      defending: Joi.number().integer().min(0).max(100),
      playStyle: Joi.string().valid('possession', 'counter', 'long-ball')
    })
  }),
  awayTeam: Joi.object({
    clubId: Joi.string(),
    lineup: Joi.array().items(Joi.string()),
    tactics: Joi.object({
      formation: Joi.string().valid('4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '5-3-2', '3-4-3'),
      attacking: Joi.number().integer().min(0).max(100),
      defending: Joi.number().integer().min(0).max(100),
      playStyle: Joi.string().valid('possession', 'counter', 'long-ball')
    })
  }),
  date: Joi.date(),
  leagueId: Joi.string(),
  status: Joi.string().valid('scheduled', 'live', 'completed', 'postponed'),
  events: Joi.array().items(Joi.object()),
  statistics: Joi.object(),
  playerRatings: Joi.object()
}).min(1)

export const idSchema = Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)
