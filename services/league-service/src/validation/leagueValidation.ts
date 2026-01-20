import Joi from 'joi'

export const leagueCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  country: Joi.string().min(2).max(50).required(),
  season: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref('start')).required()
  }).required(),
  rules: Joi.object({
    promotionSlots: Joi.number().min(0).default(3),
    relegationSlots: Joi.number().min(0).default(3),
    points: Joi.object({
      win: Joi.number().min(0).default(3),
      draw: Joi.number().min(0).default(1),
      loss: Joi.number().min(0).default(0)
    }).default()
  }).default(),
  clubs: Joi.array().items(Joi.string()).min(2).required(),
  history: Joi.array().items(Joi.object()),
  isActive: Joi.boolean()
})

export const leagueUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  country: Joi.string().min(2).max(50),
  season: Joi.object({
    start: Joi.date(),
    end: Joi.date().greater(Joi.ref('start'))
  }),
  rules: Joi.object({
    promotionSlots: Joi.number().min(0),
    relegationSlots: Joi.number().min(0),
    points: Joi.object({
      win: Joi.number().min(0),
      draw: Joi.number().min(0),
      loss: Joi.number().min(0)
    })
  }),
  clubs: Joi.array().items(Joi.string()).min(2),
  history: Joi.array().items(Joi.object()),
  isActive: Joi.boolean()
})

export const matchResultSchema = Joi.object({
  leagueId: Joi.string().required(),
  homeClubId: Joi.string().required(),
  awayClubId: Joi.string().required(),
  homeGoals: Joi.number().min(0).required(),
  awayGoals: Joi.number().min(0).required()
})
