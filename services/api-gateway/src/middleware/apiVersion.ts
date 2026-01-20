import { Request, Response, NextFunction } from 'express'

interface ApiVersionConfig {
  currentVersion: string
  supportedVersions: string[]
  deprecatedVersions: string[]
  deprecationDates: Record<string, string>
}

const API_VERSIONS: ApiVersionConfig = {
  currentVersion: '1.0.0',
  supportedVersions: ['1.0.0'],
  deprecatedVersions: [],
  deprecationDates: {}
}

export function setApiVersion(version: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.apiVersion = version
    res.setHeader('API-Version', version)
    next()
  }
}

export function checkApiVersion() {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedVersion = req.headers['api-version'] as string

    if (requestedVersion) {
      if (!API_VERSIONS.supportedVersions.includes(requestedVersion)) {
        if (API_VERSIONS.deprecatedVersions.includes(requestedVersion)) {
          const deprecationDate = API_VERSIONS.deprecationDates[requestedVersion]
          return res.status(410).json({
            error: 'API version deprecated',
            version: requestedVersion,
            deprecationDate,
            currentVersion: API_VERSIONS.currentVersion,
            message: 'This API version is no longer supported. Please upgrade to the latest version.'
          })
        }

        return res.status(400).json({
          error: 'Unsupported API version',
          version: requestedVersion,
          supportedVersions: API_VERSIONS.supportedVersions,
          currentVersion: API_VERSIONS.currentVersion,
          message: 'The requested API version is not supported.'
        })
      }

      req.apiVersion = requestedVersion
    } else {
      req.apiVersion = API_VERSIONS.currentVersion
    }

    res.setHeader('API-Version', req.apiVersion)

    if (req.apiVersion !== API_VERSIONS.currentVersion) {
      res.setHeader('Deprecation', 'true')
      res.setHeader('Sunset', new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toUTCString())
    }

    next()
  }
}

export function getVersionInfo() {
  return {
    currentVersion: API_VERSIONS.currentVersion,
    supportedVersions: API_VERSIONS.supportedVersions,
    deprecatedVersions: API_VERSIONS.deprecatedVersions,
    deprecationDates: API_VERSIONS.deprecationDates,
    compatibilityMatrix: {
      '1.0.0': {
        stable: true,
        introduced: '2025-01-20',
        deprecation: null,
        sunset: null,
        features: [
          'Club management',
          'Player management',
          'Match management',
          'Economy system',
          'Notification system',
          'Messaging system'
        ]
      }
    }
  }
}
