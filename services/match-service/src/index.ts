import express from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import matchRoutes from './routes/matches'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'
import { initLogger, getLogger, Tracing, toAppError } from 'football-manager-shared'

dotenv.config()

const logger = initLogger('match-service')
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
})

const PORT = process.env.PORT || 3004

app.use(express.json())

app.use((req: any, res: any, next: any) => {
  const tracingContext = Tracing.extractContext(req.headers)
  ;(req as any).tracing = tracingContext
  res.setHeader('x-correlation-id', tracingContext.correlationId)
  res.setHeader('x-request-id', tracingContext.requestId)
  req.io = io
  next()
})

app.use('/matches', matchRoutes)

connectToDatabase()
  .then(() => runner.up())
  .then(() => {
    io.on('connection', (socket) => {
      const tracingContext = Tracing.toLogContext({
        correlationId: socket.handshake.headers['x-correlation-id'] as string || Tracing.generateCorrelationId(),
        requestId: Tracing.generateRequestId(),
      })
      
      logger.info('Client connected to match service', tracingContext)

      socket.on('subscribe:match', (matchId: string) => {
        try {
          socket.join(`match:${matchId}`)
          logger.info(`Client subscribed to match ${matchId}`, tracingContext)
        } catch (error) {
          logger.error(`Error subscribing to match ${matchId}`, error, tracingContext)
        }
      })

      socket.on('unsubscribe:match', (matchId: string) => {
        try {
          socket.leave(`match:${matchId}`)
          logger.info(`Client unsubscribed from match ${matchId}`, tracingContext)
        } catch (error) {
          logger.error(`Error unsubscribing from match ${matchId}`, error, tracingContext)
        }
      })

      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected from match service: ${reason}`, tracingContext)
      })

      socket.on('error', (error) => {
        logger.error('Socket error', error, tracingContext)
      })
    })

    server.listen(PORT, () => {
      logger.info(`Match service running on port ${PORT}`)
    })
  })
  .catch(err => {
    const appError = toAppError(err)
    logger.error('Failed to start service', err)
    process.exit(1)
  })

const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)
  
  try {
    io.close(() => {
      logger.info('Socket.IO server closed')
    })
    
    server.close(() => {
      logger.info('HTTP server closed')
      process.exit(0)
    })
  } catch (error) {
    logger.error('Error during graceful shutdown', error)
    process.exit(1)
  }
  
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
