import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import economyRoutes from './routes/economy'

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

app.use('/economy', economyRoutes)

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'economy-service', timestamp: new Date().toISOString() })
})

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Economy service connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

httpServer.listen(PORT, () => {
  console.log(`Economy service running on port ${PORT}`)
})

export { io }
