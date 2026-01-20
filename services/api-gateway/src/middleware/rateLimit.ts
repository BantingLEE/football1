import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

export const userRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  keyGenerator: (req: any) => {
    return (req.user?.userId as string) || req.ip
  },
  message: 'Too many requests from this account, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: any) => !req.user,
})
