import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { MessageService } from '../../src/services/messageService';
import { SocketHandlers } from '../../src/socket/handlers';
import { authMiddleware } from '../../src/middleware/auth';
import jwt from 'jsonwebtoken';

describe('SocketHandlers', () => {
  let io: SocketIOServer;
  let serverSocket: any;
  let clientSocket: ClientSocket;
  let messageService: MessageService;
  let socketHandlers: SocketHandlers;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new SocketIOServer(httpServer);
    
    messageService = new MessageService(io);
    socketHandlers = new SocketHandlers(io, messageService);
    
    socketHandlers.registerHandlers();
    
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = ioClient(`http://localhost:${port}`);
      
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  beforeEach(() => {
    clientSocket.removeAllListeners();
  });

  describe('Authentication', () => {
    it('should reject connection without token', (done) => {
      io = new SocketIOServer();
      
      const unauthenticatedClient = ioClient('http://localhost:3000', {
        auth: {}
      });

      unauthenticatedClient.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        unauthenticatedClient.close();
        done();
      });
    });

    it('should accept connection with valid token', (done) => {
      const token = jwt.sign({ userId: 'user123' }, 'test-secret');
      
      const authenticatedClient = ioClient('http://localhost:3000', {
        auth: { token }
      });

      authenticatedClient.on('connect', () => {
        expect(authenticatedClient.connected).toBe(true);
        authenticatedClient.close();
        done();
      });
    });

    it('should reject connection with invalid token', (done) => {
      const invalidClient = ioClient('http://localhost:3000', {
        auth: { token: 'invalid-token' }
      });

      invalidClient.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        invalidClient.close();
        done();
      });
    });
  });

  describe('join:match event', () => {
    it('should successfully join match room', (done) => {
      const data = { matchId: 'match123', userId: 'user123' };
      
      clientSocket.emit('join:match', data);
      
      clientSocket.on('joined:match', (response) => {
        expect(response.matchId).toBe(data.matchId);
        expect(response.socketId).toBeDefined();
        done();
      });
    });

    it('should validate matchId is required', (done) => {
      const data = { userId: 'user123' };
      
      clientSocket.emit('join:match', data);
      
      clientSocket.on('error', (err) => {
        expect(err.message).toContain('matchId');
        done();
      });
    });

    it('should validate userId is required', (done) => {
      const data = { matchId: 'match123' };
      
      clientSocket.emit('join:match', data);
      
      clientSocket.on('error', (err) => {
        expect(err.message).toContain('userId');
        done();
      });
    });
  });

  describe('leave:match event', () => {
    it('should successfully leave match room', (done) => {
      const data = { matchId: 'match123', userId: 'user123' };
      
      clientSocket.emit('leave:match', data);
      
      clientSocket.on('left:match', (response) => {
        expect(response.matchId).toBe(data.matchId);
        done();
      });
    });
  });

  describe('match:event', () => {
    it('should broadcast match event to room', (done) => {
      const data = {
        matchId: 'match123',
        event: 'goal',
        payload: { scorer: 'player1', time: '45:00' }
      };
      
      clientSocket.emit('match:event', data);
      
      clientSocket.on('match:event', (response) => {
        expect(response.event).toBe(data.event);
        expect(response.payload).toEqual(data.payload);
        expect(response.timestamp).toBeDefined();
        done();
      });
    });
  });

  describe('match:update', () => {
    it('should broadcast match update to room', (done) => {
      const data = {
        matchId: 'match123',
        state: { score: '1-0', status: 'HALF_TIME' }
      };
      
      clientSocket.emit('match:update', data);
      
      clientSocket.on('match:update', (response) => {
        expect(response.matchId).toBe(data.matchId);
        expect(response.state).toEqual(data.state);
        done();
      });
    });
  });

  describe('league:update', () => {
    it('should broadcast league update to room', (done) => {
      const data = {
        leagueId: 'league1',
        update: { standings: 'updated' }
      };
      
      clientSocket.emit('league:update', data);
      
      clientSocket.on('league:update', (response) => {
        expect(response.leagueId).toBe(data.leagueId);
        expect(response.update).toEqual(data.update);
        done();
      });
    });
  });

  describe('Rate limiting', () => {
    it('should enforce rate limit on events', (done) => {
      const data = { matchId: 'match123', userId: 'user123' };
      const requests = Array(101).fill(data);
      
      let errorCount = 0;
      
      requests.forEach((req, index) => {
        clientSocket.emit('join:match', req);
      });

      clientSocket.on('error', () => {
        errorCount++;
        if (errorCount > 0) {
          done();
        }
      });
    }, 10000);
  });

  describe('Error handling', () => {
    it('should handle malformed JSON gracefully', (done) => {
      clientSocket.emit('join:match', null);
      
      clientSocket.on('error', (err) => {
        expect(err).toBeDefined();
        done();
      });
    });

    it('should handle missing fields gracefully', (done) => {
      clientSocket.emit('join:match', {});
      
      clientSocket.on('error', (err) => {
        expect(err.message).toBeDefined();
        done();
      });
    });
  });
});
