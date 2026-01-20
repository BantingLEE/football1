import express from 'express'
import dotenv from 'dotenv'
import notificationRoutes from './routes/notifications'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3009

app.use(express.json())
app.use('/notifications', notificationRoutes)

connectToDatabase()
  .then(() => runner.up())
  .then(() => app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`)
  }))
  .catch(err => {
    console.error('Failed to start service:', err)
    process.exit(1)
  })
