import 'express'

declare global {
  namespace Express {
    interface Request {
      user?: any
      apiVersion?: string
    }
  }
}
