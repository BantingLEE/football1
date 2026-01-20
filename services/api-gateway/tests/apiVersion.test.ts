import { Request, Response, NextFunction } from 'express'
import { setApiVersion, checkApiVersion, getVersionInfo } from '../src/middleware/apiVersion'

describe('API Version Middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction

  beforeEach(() => {
    mockRequest = {
      headers: {}
    }
    mockResponse = {
      setHeader: jest.fn(),
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    }
    nextFunction = jest.fn()
  })

  describe('setApiVersion', () => {
    it('should set the API version on request', () => {
      setApiVersion('1.0.0')(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.apiVersion).toBe('1.0.0')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('API-Version', '1.0.0')
      expect(nextFunction).toHaveBeenCalled()
    })
  })

  describe('checkApiVersion', () => {
    it('should use current version when no API-Version header is provided', () => {
      checkApiVersion()(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.apiVersion).toBe('1.0.0')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('API-Version', '1.0.0')
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should accept valid API version from header', () => {
      mockRequest.headers = { 'api-version': '1.0.0' }

      checkApiVersion()(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.apiVersion).toBe('1.0.0')
      expect(mockResponse.setHeader).toHaveBeenCalledWith('API-Version', '1.0.0')
      expect(nextFunction).toHaveBeenCalled()
    })

    it('should return 400 for unsupported API version', () => {
      mockRequest.headers = { 'api-version': '2.0.0' }

      checkApiVersion()(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(nextFunction).not.toHaveBeenCalled()
      expect(mockResponse.status).toHaveBeenCalledWith(400)
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('API-Version', '2.0.0')
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unsupported API version',
        version: '2.0.0',
        supportedVersions: ['1.0.0'],
        currentVersion: '1.0.0',
        message: 'The requested API version is not supported.'
      })
    })

    it('should not set deprecation headers for current version', () => {
      mockRequest.headers = { 'api-version': '1.0.0' }

      checkApiVersion()(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockResponse.setHeader).toHaveBeenCalledWith('API-Version', '1.0.0')
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Deprecation', 'true')
      expect(mockResponse.setHeader).not.toHaveBeenCalledWith('Sunset', expect.any(String))
    })

    it('should set deprecation headers for non-current supported version', () => {
      mockRequest.headers = { 'api-version': '1.0.0' }

      checkApiVersion()(mockRequest as Request, mockResponse as Response, nextFunction)

      expect(mockRequest.apiVersion).toBe('1.0.0')
      expect(nextFunction).toHaveBeenCalled()
    })
  })

  describe('getVersionInfo', () => {
    it('should return complete version information', () => {
      const versionInfo = getVersionInfo()

      expect(versionInfo).toHaveProperty('currentVersion')
      expect(versionInfo).toHaveProperty('supportedVersions')
      expect(versionInfo).toHaveProperty('deprecatedVersions')
      expect(versionInfo).toHaveProperty('deprecationDates')
      expect(versionInfo).toHaveProperty('compatibilityMatrix')
    })

    it('should include 1.0.0 in supported versions', () => {
      const versionInfo = getVersionInfo()

      expect(versionInfo.supportedVersions).toContain('1.0.0')
      expect(versionInfo.currentVersion).toBe('1.0.0')
    })

    it('should include compatibility matrix for 1.0.0', () => {
      const versionInfo = getVersionInfo()

      expect(versionInfo.compatibilityMatrix['1.0.0']).toBeDefined()
      expect(versionInfo.compatibilityMatrix['1.0.0'].stable).toBe(true)
      expect(versionInfo.compatibilityMatrix['1.0.0'].introduced).toBeDefined()
      expect(versionInfo.compatibilityMatrix['1.0.0'].deprecation).toBeNull()
      expect(versionInfo.compatibilityMatrix['1.0.0'].sunset).toBeNull()
      expect(versionInfo.compatibilityMatrix['1.0.0'].features).toBeDefined()
    })

    it('should include feature list in compatibility matrix', () => {
      const versionInfo = getVersionInfo()

      const features = versionInfo.compatibilityMatrix['1.0.0'].features
      expect(Array.isArray(features)).toBe(true)
      expect(features).toContain('Club management')
      expect(features).toContain('Player management')
      expect(features).toContain('Match management')
    })
  })
})
