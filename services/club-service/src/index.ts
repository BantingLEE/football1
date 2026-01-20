import express from 'express'
import dotenv from 'dotenv'
import clubRoutes from './routes/clubs'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())
app.use('/clubs', clubRoutes)

connectToDatabase()
  .then(() => runner.up())
  .then(() => app.listen(PORT, () => {
    console.log(`Club service running on port ${PORT}`)
  }))
  .catch(err => {
    console.error('Failed to start service:', err)
    process.exit(1)
  })
