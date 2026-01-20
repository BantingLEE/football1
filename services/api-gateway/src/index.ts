import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import routes from './routes'
import { rateLimiter, userRateLimiter } from './middleware/rateLimit'
import { sanitizeMiddleware, sanitizeQueryParams } from './middleware/sanitize'
import { validateEnv } from './config/env-validator'

dotenv.config()

validateEnv()

connectToDatabase()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('combined'))
app.use(sanitizeMiddleware)
app.use(sanitizeQueryParams)
app.use(rateLimiter)

app.use('/api', userRateLimiter, routes)

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})
