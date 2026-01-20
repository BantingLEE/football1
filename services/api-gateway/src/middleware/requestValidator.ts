import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export interface ValidationSchema {
  body?: Joi.ObjectSchema
  query?: Joi.ObjectSchema
  params?: Joi.ObjectSchema
}

export function validateRequest(schema: ValidationSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = []

    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false })
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: detail.path.join('.'),
            message: detail.message
          })
        })
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false })
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: `query.${detail.path.join('.')}`,
            message: detail.message
          })
        })
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false })
      if (error) {
        error.details.forEach((detail) => {
          errors.push({
            field: `params.${detail.path.join('.')}`,
            message: detail.message
          })
        })
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      })
    }

    next()
  }
}

export const commonSchemas = {
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('_id'),
    order: Joi.string().valid('asc', 'desc').default('asc')
  }),
  mongoId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/)
}
