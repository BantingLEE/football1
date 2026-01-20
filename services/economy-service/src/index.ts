import express from 'express'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import economyRoutes from './routes/economy'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

app.use(express.json())

const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
})

app.use('/economy', economyRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'economy-service', timestamp: new Date().toISOString() })
})

connectToDatabase()
  .then(() => runner.up())
  .then(() => {
    io.on('connection', (socket) => {
      console.log('Client connected to economy service')

      socket.on('join-club', (clubId: string) => {
        socket.join(`club-${clubId}`)
        console.log(`Client joined club room: ${clubId}`)
      })

      socket.on('leave-club', (clubId: string) => {
        socket.leave(`club-${clubId}`)
        console.log(`Client left club room: ${clubId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected from economy service')
      })
    })

    httpServer.listen(PORT, () => {
      console.log(`Economy service running on port ${PORT}`)
    })
  })
  .catch(err => {
    console.error('Failed to start service:', err)
    process.exit(1)
  })

export { io }
