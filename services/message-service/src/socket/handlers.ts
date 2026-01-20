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

export class SocketHandlers {
  constructor(
    private io: SocketIOServer,
    private messageService: MessageService
  ) {}

  registerHandlers(): void {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    console.log(`Client connected: ${socket.id}, User: ${socket.userId || 'anonymous'}`);

    socket.on('join:match', (data) => {
      try {
        eventRateLimit(socket, 'join:match', (err) => {
          if (err) {
            socket.emit('error', { message: err.message });
            return;
          }
          this.handleJoinMatch(socket, data);
        });
      } catch (error) {
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('leave:match', (data) => {
      try {
        eventRateLimit(socket, 'leave:match', (err) => {
          if (err) {
            socket.emit('error', { message: err.message });
            return;
          }
          this.handleLeaveMatch(socket, data);
        });
      } catch (error) {
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('match:event', (data) => {
      try {
        eventRateLimit(socket, 'match:event', (err) => {
          if (err) {
            socket.emit('error', { message: err.message });
            return;
          }
          this.handleMatchEvent(socket, data);
        });
      } catch (error) {
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('match:update', (data) => {
      try {
        eventRateLimit(socket, 'match:update', (err) => {
          if (err) {
            socket.emit('error', { message: err.message });
            return;
          }
          this.handleMatchUpdate(socket, data);
        });
      } catch (error) {
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('league:update', (data) => {
      try {
        eventRateLimit(socket, 'league:update', (err) => {
          if (err) {
            socket.emit('error', { message: err.message });
            return;
          }
          this.handleLeagueUpdate(socket, data);
        });
      } catch (error) {
        socket.emit('error', { message: 'Internal server error' });
      }
    });

    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private handleJoinMatch(socket: AuthenticatedSocket, data: unknown): void {
    try {
      const { matchId, userId } = validateJoinMatch(data);
      const room = `match:${matchId}`;
      
      this.messageService.addToRoom(room, socket.id);
      socket.join(room);
      
      console.log(`User ${userId} joined match ${matchId}`);
      
      socket.emit('joined:match', { matchId, socketId: socket.id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      socket.emit('error', { message });
      console.error(`Error in handleJoinMatch: ${message}`);
    }
  }

  private handleLeaveMatch(socket: AuthenticatedSocket, data: unknown): void {
    try {
      const { matchId, userId } = validateLeaveMatch(data);
      const room = `match:${matchId}`;
      
      this.messageService.removeFromRoom(room, socket.id);
      socket.leave(room);
      
      console.log(`User ${userId} left match ${matchId}`);
      
      socket.emit('left:match', { matchId });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      socket.emit('error', { message });
      console.error(`Error in handleLeaveMatch: ${message}`);
    }
  }

  private handleMatchEvent(socket: AuthenticatedSocket, data: unknown): void {
    try {
      const { matchId, event, payload } = validateMatchEvent(data);
      const room = `match:${matchId}`;
      
      this.messageService.broadcastToRoom(room, 'match:event', {
        event,
        payload,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      socket.emit('error', { message });
      console.error(`Error in handleMatchEvent: ${message}`);
    }
  }

  private handleMatchUpdate(socket: AuthenticatedSocket, data: unknown): void {
    try {
      const { matchId, state } = validateMatchUpdate(data);
      const room = `match:${matchId}`;
      
      this.messageService.broadcastToRoom(room, 'match:update', {
        matchId,
        state,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      socket.emit('error', { message });
      console.error(`Error in handleMatchUpdate: ${message}`);
    }
  }

  private handleLeagueUpdate(socket: AuthenticatedSocket, data: unknown): void {
    try {
      const { leagueId, update } = validateLeagueUpdate(data);
      const room = `league:${leagueId}`;
      
      this.messageService.broadcastToRoom(room, 'league:update', {
        leagueId,
        update,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      socket.emit('error', { message });
      console.error(`Error in handleLeagueUpdate: ${message}`);
    }
  }

  private handleDisconnect(socket: AuthenticatedSocket): void {
    console.log(`Client disconnected: ${socket.id}`);
  }
}
