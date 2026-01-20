import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AuthenticatedSocket } from '../types/socket';

export function authMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as { userId: string };
    
    (socket as AuthenticatedSocket).userId = decoded.userId;
    (socket as AuthenticatedSocket).token = token;
    
    next();
  } catch (error) {
    return next(new Error('Authentication error: Invalid token'));
  }
}
