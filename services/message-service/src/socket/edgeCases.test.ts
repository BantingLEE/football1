import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { MessageService } from '../../src/services/messageService';
import { SocketHandlers } from '../../src/socket/handlers';
import { RedisAdapter } from '../../src/middleware/redisAdapter';
import jwt from 'jsonwebtoken';

describe('Edge Cases - Disconnection during events', () => {
  let io: SocketIOServer;
  let clientSocket: ClientSocket;
  let messageService: MessageService;
  let socketHandlers: SocketHandlers;
  let redisAdapter: RedisAdapter;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new SocketIOServer(httpServer);
    
    messageService = new MessageService(io);
    socketHandlers = new SocketHandlers(io, messageService);
    redisAdapter = new RedisAdapter();
    
    redisAdapter.connect().then(() => {
      redisAdapter.adapt(io);
      socketHandlers.registerHandlers();
    });
    
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      const token = jwt.sign({ userId: 'user123' }, 'test-secret');
      
      clientSocket = ioClient(`http://localhost:${port}`, {
        auth: { token }
      });
      
      clientSocket.on('connect', done);
    });
  });

  afterAll(async () => {
    await redisAdapter.disconnect();
    io.close();
    clientSocket.close();
  });

  describe('Disconnection during join:match', () => {
    it('should handle disconnection while joining room', (done) => {
      const data = { matchId: 'match123', userId: 'user123' };
      
      clientSocket.emit('join:match', data);
      clientSocket.disconnect();
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Disconnection during match:event', () => {
    it('should handle disconnection while broadcasting event', (done) => {
      const data = {
        matchId: 'match123',
        event: 'goal',
        payload: { scorer: 'player1' }
      };
      
      clientSocket.emit('match:event', data);
      clientSocket.disconnect();
      
      setTimeout(() => {
        expect(clientSocket.connected).toBe(false);
        done();
      }, 100);
    });
  });

  describe('Multiple rapid disconnections', () => {
    it('should handle rapid connect/disconnect cycles', (done) => {
      const httpServer = createServer();
      const testIo = new SocketIOServer(httpServer);
      
      const testService = new MessageService(testIo);
      const testHandlers = new SocketHandlers(testIo, testService);
      
      testHandlers.registerHandlers();
      
      httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        const token = jwt.sign({ userId: 'user456' }, 'test-secret');
        
        const clients: ClientSocket[] = [];
        
        for (let i = 0; i < 5; i++) {
          const client = ioClient(`http://localhost:${port}`, {
            auth: { token }
          });
          clients.push(client);
        }
        
        setTimeout(() => {
          clients.forEach((client, index) => {
            setTimeout(() => {
              client.disconnect();
            }, index * 10);
          });
          
          setTimeout(() => {
            clients.forEach(client => {
              expect(client.connected).toBe(false);
            });
            testIo.close();
            done();
          }, 200);
        }, 100);
      });
    }, 5000);
  });

  describe('Disconnection during room operations', () => {
    it('should handle disconnection while in room', (done) => {
      const data = { matchId: 'match456', userId: 'user789' };
      
      clientSocket.emit('join:match', data);
      
      clientSocket.on('joined:match', () => {
        clientSocket.disconnect();
        
        setTimeout(() => {
          expect(clientSocket.connected).toBe(false);
          done();
        }, 50);
      });
    });
  });

  describe('Concurrent events with disconnection', () => {
    it('should handle multiple events before disconnection', (done) => {
      const events = [
        { matchId: 'match1', userId: 'user1' },
        { matchId: 'match2', userId: 'user1' },
        { matchId: 'match3', userId: 'user1' }
      ];
      
      events.forEach(data => {
        clientSocket.emit('join:match', data);
      });
      
      setTimeout(() => {
        clientSocket.disconnect();
        
        setTimeout(() => {
          expect(clientSocket.connected).toBe(false);
          done();
        }, 50);
      }, 100);
    });
  });

  describe('Server shutdown during active connection', () => {
    it('should handle server shutdown gracefully', (done) => {
      const httpServer = createServer();
      const testIo = new SocketIOServer(httpServer);
      
      const testService = new MessageService(testIo);
      const testHandlers = new SocketHandlers(testIo, testService);
      const testRedisAdapter = new RedisAdapter();
      
      testRedisAdapter.connect().then(() => {
        testRedisAdapter.adapt(testIo);
        testHandlers.registerHandlers();
      });
      
      httpServer.listen(() => {
        const port = (httpServer.address() as any).port;
        const token = jwt.sign({ userId: 'user999' }, 'test-secret');
        
        const client = ioClient(`http://localhost:${port}`, {
          auth: { token }
        });
        
        client.on('connect', async () => {
          client.emit('join:match', { matchId: 'match999', userId: 'user999' });
          
          setTimeout(async () => {
            await testRedisAdapter.disconnect();
            testIo.close();
            
            setTimeout(() => {
              expect(client.connected).toBe(false);
              done();
            }, 100);
          }, 100);
        });
      });
    }, 5000);
  });
});
