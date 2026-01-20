import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import routes from './routes'
import { rateLimiter, userRateLimiter } from './middleware/rateLimit'
import { sanitizeMiddleware, sanitizeQueryParams } from './middleware/sanitize'
import { validateEnv } from './config/env-validator'
import { checkApiVersion } from './middleware/apiVersion'
import { connectToDatabase } from './config/database'
import { initLogger, getLogger, Tracing, toAppError } from 'football-manager-shared'
import path from 'path'

dotenv.config()

validateEnv()

const logger = initLogger('api-gateway')
const PORT = process.env.PORT || 3001

connectToDatabase()

const app = express()

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Football Manager API',
      version: '1.0.0',
      description: 'REST API for Football Manager game - a comprehensive football management simulation',
      contact: {
        name: 'API Support',
        email: 'support@footballmanager.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: 'Local development server',
      },
      {
        url: 'https://api.footballmanager.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token authentication'
        }
      }
    }
  },
  apis: [path.join(__dirname, '..', '..', '..', 'api-docs', 'openapi.yaml')],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))

app.use((req, res, next) => {
  const tracingContext = Tracing.extractContext(req.headers)
  ;(req as any).tracing = tracingContext
  
  res.setHeader('x-correlation-id', tracingContext.correlationId)
  res.setHeader('x-request-id', tracingContext.requestId)
  
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined', {
  skip: () => process.env.NODE_ENV === 'test'
}))
app.use(sanitizeMiddleware)
app.use(sanitizeQueryParams)
app.use(rateLimiter)
app.use(checkApiVersion())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', '..', 'api-docs', 'openapi.yaml'))
})

app.use('/api', userRateLimiter, routes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const appError = toAppError(err)
  const tracing = (req as any).tracing || {}
  
  logger.error('Request error', err, Tracing.toLogContext(tracing))
  
  const statusCode = appError.statusCode
  const response: Record<string, unknown> = {
    error: appError.message,
    code: appError.code,
    correlationId: tracing.correlationId,
  }
  
  if (process.env.NODE_ENV !== 'production') {
    response.context = appError.context
  }
  
  res.status(statusCode).json(response)
})

const server = app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`)
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`)
  logger.info(`OpenAPI Specification available at http://localhost:${PORT}/openapi.yaml`)
})

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)
  
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', reason, { promise })
  gracefulShutdown('unhandledRejection')
})
