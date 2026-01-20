import { Request, Response, NextFunction } from 'express'
import { validateRequest, commonSchemas } from '../src/middleware/requestValidator'
import Joi from 'joi'

describe('Request Validator Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {}
    }
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    nextFunction = jest.fn()
  })

  describe('validateRequest', () => {
    it('should call next function for valid request body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })

      mockRequest.body = { name: 'John', age: 25 }

      validateRequest({ body: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
    })

    it('should return 400 for invalid request body', () => {
      const schema = Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })

      mockRequest.body = { name: 123 }

      validateRequest({ body: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'age',
            message: expect.stringContaining('required')
          })
        ])
      })
    })

    it('should validate query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().max(100)
      })

      mockRequest.query = { page: '1', limit: '50' }

      validateRequest({ query: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
    })

    it('should return 400 for invalid query parameters', () => {
      const schema = Joi.object({
        page: Joi.number().integer().min(1).required()
      })

      mockRequest.query = { page: 'abc' }

      validateRequest({ query: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })

    it('should validate path parameters', () => {
      const schema = Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
      })

      mockRequest.params = { id: '507f1f77bcf86cd799439011' }

      validateRequest({ params: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
    })

    it('should return 400 for invalid path parameters', () => {
      const schema = Joi.object({
        id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
      })

      mockRequest.params = { id: 'invalid-id' }

      validateRequest({ params: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
    })

    it('should validate multiple parts (body, query, params)', () => {
      const bodySchema = Joi.object({ name: Joi.string().required() })
      const querySchema = Joi.object({ page: Joi.number().required() })
      const paramsSchema = Joi.object({ id: Joi.string().required() })

      mockRequest.body = { name: 'Test' }
      mockRequest.query = { page: '1' }
      mockRequest.params = { id: 'test-id' }

      validateRequest({ body: bodySchema, query: querySchema, params: paramsSchema })(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      )

      expect(nextFunction).toHaveBeenCalled()
    })

    it('should handle multiple validation errors', () => {
      const schema = Joi.object({
        name: Joi.string().min(3).required(),
        age: Joi.number().min(18).required(),
        email: Joi.string().email().required()
      })

      mockRequest.body = { name: 'Jo', age: 16, email: 'invalid' }

      validateRequest({ body: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'age' }),
          expect.objectContaining({ field: 'email' })
        ])
      })
    })

    it('should work with nested objects', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          address: Joi.object({
            city: Joi.string().required(),
            zip: Joi.string().required()
          }).required()
        }).required()
      })

      mockRequest.body = {
        user: {
          name: 'John',
          address: {
            city: 'New York',
            zip: '10001'
          }
        }
      }

      validateRequest({ body: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
    })

    it('should return 400 for invalid nested objects', () => {
      const schema = Joi.object({
        user: Joi.object({
          name: Joi.string().required()
        }).required()
      })

      mockRequest.body = { user: {} }

      validateRequest({ body: schema })(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'user.name',
            message: expect.stringContaining('required')
          })
        ])
      })
    })
  })

  describe('commonSchemas', () => {
    it('should validate MongoDB ID format', () => {
      const result = commonSchemas.id.validate('507f1f77bcf86cd799439011')
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid MongoDB ID', () => {
      const result = commonSchemas.id.validate('invalid-id')
      expect(result.error).toBeDefined()
    })

    it('should validate pagination schema', () => {
      const pagination = { page: 2, limit: 50, sort: 'name', order: 'desc' }
      const result = commonSchemas.pagination.validate(pagination)
      expect(result.error).toBeUndefined()
    })

    it('should apply default values to pagination', () => {
      const result = commonSchemas.pagination.validate({})
      expect(result.value.page).toBe(1)
      expect(result.value.limit).toBe(20)
      expect(result.value.sort).toBe('_id')
      expect(result.value.order).toBe('asc')
    })

    it('should reject invalid pagination values', () => {
      const result = commonSchemas.pagination.validate({ page: 0, limit: 200 })
      expect(result.error).toBeDefined()
    })
  })
})
