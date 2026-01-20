import express from 'express'
import dotenv from 'dotenv'
import playerRoutes from './routes/players'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'
import { initLogger, getLogger, toAppError } from 'football-manager-shared'

dotenv.config()

const logger = initLogger('player-service')
const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())
app.use('/players', playerRoutes)

let server: ReturnType<express.Application['listen']>

connectToDatabase()
  .then(() => runner.up())
  .then(() => {
    server = app.listen(PORT, () => {
      logger.info(`Player service running on port ${PORT}`)
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
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed')
      })
    }
    
    process.exit(0)
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