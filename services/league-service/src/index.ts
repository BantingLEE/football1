import express from 'express'
import dotenv from 'dotenv'
import leagueRoutes from './routes/league'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3007

app.use(express.json())
app.use('/leagues', leagueRoutes)

connectToDatabase()
  .then(() => runner.up())
  .then(() => app.listen(PORT, () => {
    console.log(`League service running on port ${PORT}`)
  }))
  .catch(err => {
    console.error('Failed to start service:', err)
    process.exit(1)
  })
