import express from 'express'
import dotenv from 'dotenv'
import playerRoutes from './routes/players'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

app.use(express.json())
app.use('/players', playerRoutes)

connectToDatabase()
  .then(() => runner.up())
  .then(() => app.listen(PORT, () => {
    console.log(`Player service running on port ${PORT}`)
  }))
  .catch(err => {
    console.error('Failed to start service:', err)
    process.exit(1)
  })