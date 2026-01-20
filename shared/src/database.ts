import mongoose from 'mongoose'

const MAX_RETRIES = 5
const INITIAL_RETRY_DELAY = 1000

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function retryWithBackoff(fn: () => Promise<void>, maxRetries: number): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await fn()
      return
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1)
      console.log(`Connection attempt ${attempt} failed, retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
}

mongoose.set('debug', process.env.NODE_ENV === 'development')

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully')
})

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected')
})

export async function connectToDatabase(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/football_manager'

  const connectFn = async () => {
    await mongoose.connect(mongoUri, {
      minPoolSize: 5,
      maxPoolSize: 50,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true
    })
  }

  try {
    await retryWithBackoff(connectFn, MAX_RETRIES)
  } catch (error) {
    console.error('Failed to connect to MongoDB after retries:', error)
    process.exit(1)
  }
}

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (mongoose.connection.readyState !== 1) {
      return false
    }
    await mongoose.connection.db?.admin().ping()
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
