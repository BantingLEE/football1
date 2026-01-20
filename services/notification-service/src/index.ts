import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import notificationRoutes from './routes/notifications'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3009

app.use(express.json())
app.use('/notifications', notificationRoutes)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`)
})
