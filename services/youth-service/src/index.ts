import express from 'express'
import dotenv from 'dotenv'
import youthRoutes from './routes/youth'
import { connectToDatabase } from '@shared/database'
import { runner } from '@shared/migrations'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3006

app.use(express.json())
app.use('/youth', youthRoutes)

connectToDatabase()
  .then(() => runner.up())
  .then(() => app.listen(PORT, () => {
    console.log(`Youth service running on port ${PORT}`)
  }))
  .catch(err => {
    console.error('Failed to start service:', err)
    process.exit(1)
  })
