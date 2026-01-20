import { Socket } from 'socket.io';

const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 100;

export function rateLimiterMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const clientIp = socket.handshake.address || 'unknown';
  const now = Date.now();
  const record = rateLimiter.get(clientIp);

  if (!record) {
    rateLimiter.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (now > record.resetTime) {
    rateLimiter.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return next(new Error('Rate limit exceeded'));
  }

  record.count++;
  next();
}

export function eventRateLimit(socket: Socket, event: string, next: (err?: Error) => void): void {
  const key = `${socket.id}:${event}`;
  const now = Date.now();
  const record = rateLimiter.get(key);

  if (!record) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (now > record.resetTime) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return next(new Error('Event rate limit exceeded'));
  }

  record.count++;
  next();
}
