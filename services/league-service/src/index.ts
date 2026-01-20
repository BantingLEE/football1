import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import leagueRoutes from './routes/league'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3007

app.use(express.json())
app.use('/leagues', leagueRoutes)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err))

app.listen(PORT, () => {
  console.log(`League service running on port ${PORT}`)
})
