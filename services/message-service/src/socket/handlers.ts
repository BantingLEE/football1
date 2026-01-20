import { Server as SocketIOServer } from 'socket.io';
import { MessageService } from '../services/messageService';
import { AuthenticatedSocket } from '../types/socket';
import {
  validateJoinMatch,
  validateLeaveMatch,
  validateMatchEvent,
  validateMatchUpdate,
  validateLeagueUpdate
} from '../middleware/validation';
import { eventRateLimit } from '../middleware/rateLimiter';
import { getLogger, Tracing, toAppError } from 'football-manager-shared';

const logger = getLogger();

export class SocketHandlers {
  constructor(
    private io: SocketIOServer,
    private messageService: MessageService
  ) {}

  registerHandlers(): void {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    const userId = socket.userId || 'anonymous';
    const tracingContext = Tracing.toLogContext({
      correlationId: socket.handshake.headers['x-correlation-id'] as string || Tracing.generateCorrelationId(),
      requestId: Tracing.generateRequestId(),
      userId,
    });

    logger.info(`Client connected: ${socket.id}, User: ${userId}`, tracingContext);

    socket.on('join:match', (data) => {
      this.wrapHandler(socket, 'join:match', () => {
        eventRateLimit(socket, 'join:match', (err) => {
          if (err) {
            socket.emit('error', { message: err.message, code: 'RATE_LIMIT_EXCEEDED' });
            return;
          }
          this.handleJoinMatch(socket, data, tracingContext);
        });
      }, tracingContext);
    });

    socket.on('leave:match', (data) => {
      this.wrapHandler(socket, 'leave:match', () => {
        eventRateLimit(socket, 'leave:match', (err) => {
          if (err) {
            socket.emit('error', { message: err.message, code: 'RATE_LIMIT_EXCEEDED' });
            return;
          }
          this.handleLeaveMatch(socket, data, tracingContext);
        });
      }, tracingContext);
    });

    socket.on('match:event', (data) => {
      this.wrapHandler(socket, 'match:event', () => {
        eventRateLimit(socket, 'match:event', (err) => {
          if (err) {
            socket.emit('error', { message: err.message, code: 'RATE_LIMIT_EXCEEDED' });
            return;
          }
          this.handleMatchEvent(socket, data, tracingContext);
        });
      }, tracingContext);
    });

    socket.on('match:update', (data) => {
      this.wrapHandler(socket, 'match:update', () => {
        eventRateLimit(socket, 'match:update', (err) => {
          if (err) {
            socket.emit('error', { message: err.message, code: 'RATE_LIMIT_EXCEEDED' });
            return;
          }
          this.handleMatchUpdate(socket, data, tracingContext);
        });
      }, tracingContext);
    });

    socket.on('league:update', (data) => {
      this.wrapHandler(socket, 'league:update', () => {
        eventRateLimit(socket, 'league:update', (err) => {
          if (err) {
            socket.emit('error', { message: err.message, code: 'RATE_LIMIT_EXCEEDED' });
            return;
          }
          this.handleLeagueUpdate(socket, data, tracingContext);
        });
      }, tracingContext);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error, tracingContext);
    });

    socket.on('disconnect', (reason) => {
      this.handleDisconnect(socket, reason, tracingContext);
    });
  }

  private wrapHandler(socket: AuthenticatedSocket, event: string, handler: () => void, tracingContext: Record<string, string>): void {
    try {
      handler();
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in ${event}`, error, tracingContext);
      socket.emit('error', {
        message: appError.message,
        code: appError.code,
        correlationId: tracingContext.correlationId,
      });
    }
  }

  private handleJoinMatch(socket: AuthenticatedSocket, data: unknown, tracingContext: Record<string, string>): void {
    try {
      const { matchId, userId } = validateJoinMatch(data);
      const room = `match:${matchId}`;
      
      this.messageService.addToRoom(room, socket.id);
      socket.join(room);
      
      logger.info(`User ${userId} joined match ${matchId}`, tracingContext);
      
      socket.emit('joined:match', { matchId, socketId: socket.id });
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in handleJoinMatch`, error, tracingContext);
      socket.emit('error', {
        message: appError.message,
        code: appError.code,
        correlationId: tracingContext.correlationId,
      });
    }
  }

  private handleLeaveMatch(socket: AuthenticatedSocket, data: unknown, tracingContext: Record<string, string>): void {
    try {
      const { matchId, userId } = validateLeaveMatch(data);
      const room = `match:${matchId}`;
      
      this.messageService.removeFromRoom(room, socket.id);
      socket.leave(room);
      
      logger.info(`User ${userId} left match ${matchId}`, tracingContext);
      
      socket.emit('left:match', { matchId });
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in handleLeaveMatch`, error, tracingContext);
      socket.emit('error', {
        message: appError.message,
        code: appError.code,
        correlationId: tracingContext.correlationId,
      });
    }
  }

  private handleMatchEvent(socket: AuthenticatedSocket, data: unknown, tracingContext: Record<string, string>): void {
    try {
      const { matchId, event, payload } = validateMatchEvent(data);
      const room = `match:${matchId}`;
      
      this.messageService.broadcastToRoom(room, 'match:event', {
        event,
        payload,
        timestamp: new Date().toISOString()
      });
      
      logger.debug(`Match event broadcasted for match ${matchId}`, tracingContext);
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in handleMatchEvent`, error, tracingContext);
      socket.emit('error', {
        message: appError.message,
        code: appError.code,
        correlationId: tracingContext.correlationId,
      });
    }
  }

  private handleMatchUpdate(socket: AuthenticatedSocket, data: unknown, tracingContext: Record<string, string>): void {
    try {
      const { matchId, state } = validateMatchUpdate(data);
      const room = `match:${matchId}`;
      
      this.messageService.broadcastToRoom(room, 'match:update', {
        matchId,
        state,
        timestamp: new Date().toISOString()
      });
      
      logger.debug(`Match update broadcasted for match ${matchId}`, tracingContext);
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in handleMatchUpdate`, error, tracingContext);
      socket.emit('error', {
        message: appError.message,
        code: appError.code,
        correlationId: tracingContext.correlationId,
      });
    }
  }

  private handleLeagueUpdate(socket: AuthenticatedSocket, data: unknown, tracingContext: Record<string, string>): void {
    try {
      const { leagueId, update } = validateLeagueUpdate(data);
      const room = `league:${leagueId}`;
      
      this.messageService.broadcastToRoom(room, 'league:update', {
        leagueId,
        update,
        timestamp: new Date().toISOString()
      });
      
      logger.debug(`League update broadcasted for league ${leagueId}`, tracingContext);
    } catch (error) {
      const appError = toAppError(error);
      logger.error(`Error in handleLeagueUpdate`, error, tracingContext);
      socket.emit('error', {
        message: appError.message,
        code: appError.code,
        correlationId: tracingContext.correlationId,
      });
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket, reason: string, tracingContext: Record<string, string>): void {
    const userId = (socket as any).userId || 'unknown';
    logger.info(`Client disconnected: ${socket.id}, User: ${userId}, Reason: ${reason}`, tracingContext);
    
    try {
      this.messageService.handleDisconnect(socket.id);
    } catch (error) {
      logger.error(`Error handling disconnect for socket ${socket.id}`, error, tracingContext);
    }
  }
}
