import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

class SocketManager {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0
      console.log('Socket connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++
      console.error('Socket connection error:', error)
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })

    return this.socket
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    this.socket?.on(event, callback)
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback)
    } else {
      this.socket?.off(event)
    }
  }

  emit(event: string, data?: unknown): void {
    this.socket?.emit(event, data)
  }
}

export const socketManager = new SocketManager()
