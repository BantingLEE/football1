import { Request, Response, NextFunction } from 'express'
import { sanitizeMiddleware, sanitizeQueryParams } from '../src/middleware/sanitize'

describe('Sanitization Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction

  beforeEach(() => {
    mockRequest = {}
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    nextFunction = jest.fn()
  })

  describe('sanitizeMiddleware', () => {
    it('should sanitize request body', () => {
      mockRequest.body = {
        name: '<script>alert("xss")</script>Test',
        age: '25',
        nested: {
          field: '<p>html</p>'
        }
      }

      sanitizeMiddleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.body.name).not.toContain('<script>')
      expect(mockRequest.body.name).toContain('&lt;script&gt;')
      expect(mockRequest.body.nested.field).not.toContain('<p>')
    })

    it('should sanitize query parameters', () => {
      mockRequest.query = {
        search: '<script>alert(1)</script>',
        limit: '10'
      }

      sanitizeMiddleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.query.search).not.toContain('<script>')
    })

    it('should trim whitespace from strings', () => {
      mockRequest.body = {
        name: '  John Doe  '
      }

      sanitizeMiddleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.body.name).toBe('John Doe')
    })

    it('should handle null and undefined values', () => {
      mockRequest.body = {
        name: null,
        age: undefined
      }

      sanitizeMiddleware(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.body.name).toBeNull()
      expect(mockRequest.body.age).toBeUndefined()
    })
  })

  describe('sanitizeQueryParams', () => {
    it('should sanitize query params without escaping', () => {
      mockRequest.query = {
        search: '  test  '
      }

      sanitizeQueryParams(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).toHaveBeenCalled()
      expect(mockRequest.query.search).toBe('test')
    })

    it('should handle special characters without escaping in query params', () => {
      mockRequest.query = {
        query: '<div>content</div>'
      }

      sanitizeQueryParams(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.query.query).toContain('<div>')
      expect(mockRequest.query.query).not.toContain('&lt;')
    })
  })
})
