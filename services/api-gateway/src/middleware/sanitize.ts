import { Request, Response, NextFunction } from 'express'
import validator from 'validator'

interface SanitizationOptions {
  trim?: boolean
  escape?: boolean
  whitelist?: boolean
  blacklist?: boolean
}

function sanitizeString(value: any, options: SanitizationOptions = {}): string {
  let result = String(value)
  
  if (options.trim) {
    result = result.trim()
  }
  
  if (options.escape) {
    result = validator.escape(result)
  }
  
  return result
}

function sanitizeNumber(value: any): number | null {
  const num = Number(value)
  return isNaN(num) ? null : num
}

function sanitizeObject(obj: any, options: SanitizationOptions = {}): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  
  const result: any = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      
      if (typeof value === 'string') {
        result[key] = sanitizeString(value, options)
      } else if (typeof value === 'number') {
        result[key] = sanitizeNumber(value)
      } else if (typeof value === 'object' && value !== null) {
        result[key] = sanitizeObject(value, options)
      } else {
        result[key] = value
      }
    }
  }
  
  return result
}

export function sanitizeMiddleware(req: Request, res: Response, next: NextFunction) {
  const options: SanitizationOptions = {
    trim: true,
    escape: true,
  }
  
  if (req.body) {
    req.body = sanitizeObject(req.body, options)
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query, options)
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params, options)
  }
  
  next()
}

export function sanitizeQueryParams(req: Request, res: Response, next: NextFunction) {
  const options: SanitizationOptions = {
    trim: true,
    escape: false,
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query, options)
  }
  
  next()
}
