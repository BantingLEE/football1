import { validateEnv, validateEnvVar } from '../src/config/env-validator'

describe('Environment Validator', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('validateEnvVar', () => {
    it('should validate JWT_SECRET with secure value', () => {
      process.env.JWT_SECRET = 'a'.repeat(64)
      const result = validateEnvVar('JWT_SECRET', true)
      
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should fail JWT_SECRET with placeholder value', () => {
      process.env.JWT_SECRET = 'your-secret-key'
      const result = validateEnvVar('JWT_SECRET', true)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('placeholder value')
    })

    it('should fail JWT_SECRET with short value', () => {
      process.env.JWT_SECRET = 'short'
      const result = validateEnvVar('JWT_SECRET', true)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('at least 32 characters')
    })

    it('should fail JWT_SECRET with CHANGE_ME', () => {
      process.env.JWT_SECRET = 'CHANGE_ME_STRONG_PASSWORD_HERE_MIN_20_CHARS'
      const result = validateEnvVar('JWT_SECRET', true)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('placeholder value')
    })

    it('should validate valid PORT', () => {
      process.env.PORT = '3001'
      const result = validateEnvVar('PORT', false)
      
      expect(result.isValid).toBe(true)
    })

    it('should fail invalid PORT', () => {
      process.env.PORT = 'invalid'
      const result = validateEnvVar('PORT', false)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid number')
    })

    it('should fail PORT out of range', () => {
      process.env.PORT = '99999'
      const result = validateEnvVar('PORT', false)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('1 and 65535')
    })

    it('should validate valid MONGODB_URI', () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
      const result = validateEnvVar('MONGODB_URI', true)
      
      expect(result.isValid).toBe(true)
    })

    it('should fail invalid MONGODB_URI', () => {
      process.env.MONGODB_URI = 'invalid-uri'
      const result = validateEnvVar('MONGODB_URI', true)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid MongoDB connection string')
    })

    it('should validate valid service URLs', () => {
      process.env.CLUB_SERVICE_URL = 'http://localhost:3002'
      const result = validateEnvVar('CLUB_SERVICE_URL', true)
      
      expect(result.isValid).toBe(true)
    })

    it('should fail invalid service URL', () => {
      process.env.CLUB_SERVICE_URL = 'not-a-url'
      const result = validateEnvVar('CLUB_SERVICE_URL', true)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('valid URL')
    })

    it('should mark missing required env var as invalid', () => {
      const result = validateEnvVar('MISSING_VAR', true)
      
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Missing required')
    })

    it('should allow missing optional env var', () => {
      const result = validateEnvVar('MISSING_OPTIONAL', false)
      
      expect(result.isValid).toBe(true)
    })
  })
})
