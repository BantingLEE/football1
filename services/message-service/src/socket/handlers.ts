import { Server as SocketIOServer, Socket } from 'socket.io';
import { MessageService } from '../services/messageService';

export class SocketHandlers {
  constructor(
    private io: SocketIOServer,
    private messageService: MessageService
  ) {}

  registerHandlers(): void {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(socket: Socket): void {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join:match', (data) => this.handleJoinMatch(socket, data));
    socket.on('leave:match', (data) => this.handleLeaveMatch(socket, data));
    socket.on('match:event', (data) => this.handleMatchEvent(socket, data));
    socket.on('match:update', (data) => this.handleMatchUpdate(socket, data));
    socket.on('league:update', (data) => this.handleLeagueUpdate(socket, data));
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  private handleJoinMatch(socket: Socket, data: { matchId: string; userId: string }): void {
    const { matchId, userId } = data;
    const room = `match:${matchId}`;
    
    this.messageService.addToRoom(room, socket.id);
    socket.join(room);
    
    console.log(`User ${userId} joined match ${matchId}`);
    
    socket.emit('joined:match', { matchId, socketId: socket.id });
  }

  private handleLeaveMatch(socket: Socket, data: { matchId: string; userId: string }): void {
    const { matchId, userId } = data;
    const room = `match:${matchId}`;
    
    this.messageService.removeFromRoom(room, socket.id);
    socket.leave(room);
    
    console.log(`User ${userId} left match ${matchId}`);
    
    socket.emit('left:match', { matchId });
  }

  private handleMatchEvent(socket: Socket, data: { matchId: string; event: string; payload: any }): void {
    const { matchId, event, payload } = data;
    const room = `match:${matchId}`;
    
    this.messageService.broadcastToRoom(room, 'match:event', {
      event,
      payload,
      timestamp: new Date().toISOString()
    });
  }

  private handleMatchUpdate(socket: Socket, data: { matchId: string; state: any }): void {
    const { matchId, state } = data;
    const room = `match:${matchId}`;
    
    this.messageService.broadcastToRoom(room, 'match:update', {
      matchId,
      state,
      timestamp: new Date().toISOString()
    });
  }

  private handleLeagueUpdate(socket: Socket, data: { leagueId: string; update: any }): void {
    const { leagueId, update } = data;
    const room = `league:${leagueId}`;
    
    this.messageService.broadcastToRoom(room, 'league:update', {
      leagueId,
      update,
      timestamp: new Date().toISOString()
    });
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);
  }
}
