import { Request, Response, NextFunction } from 'express'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  // TODO: Implement JWT verification
  // For now, just pass through
  next()
}
