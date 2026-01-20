import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { createServer } from 'http'
import { Server } from 'socket.io'
import matchRoutes from './routes/matches'

dotenv.config()

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
  req.io = io
  next()
})

app.use('/matches', matchRoutes)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

io.on('connection', (socket) => {
  console.log('Client connected to match service')

  socket.on('subscribe:match', (matchId: string) => {
    socket.join(`match:${matchId}`)
    console.log(`Client subscribed to match ${matchId}`)
  })

  socket.on('unsubscribe:match', (matchId: string) => {
    socket.leave(`match:${matchId}`)
    console.log(`Client unsubscribed from match ${matchId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected from match service')
  })
})

server.listen(PORT, () => {
  console.log(`Match service running on port ${PORT}`)
})
