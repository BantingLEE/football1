import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import youthRoutes from './routes/youth'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3006

app.use(express.json())
app.use('/youth', youthRoutes)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`Youth service running on port ${PORT}`)
})
