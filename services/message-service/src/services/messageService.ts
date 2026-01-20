import { Server as SocketIOServer } from 'socket.io';

export class MessageService {
  constructor(private io: SocketIOServer) {}

  broadcastToRoom(room: string, event: string, data: unknown): void {
    this.io.to(room).emit(event, data);
  }

  sendToUser(userId: string, event: string, data: unknown): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  addToRoom(room: string, socketId: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.join(room);
    }
  }

  removeFromRoom(room: string, socketId: string): void {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(room);
    }
  }

  broadcastToAll(event: string, data: unknown): void {
    this.io.emit(event, data);
  }
}
