import { RedisAdapter } from '../../src/middleware/redisAdapter';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

describe('RedisAdapter', () => {
  let redisAdapter: RedisAdapter;
  let io: SocketIOServer;

  beforeAll(() => {
    redisAdapter = new RedisAdapter();
  });

  afterAll(async () => {
    await redisAdapter.disconnect();
  });

  describe('Connection', () => {
    it('should connect to Redis successfully', async () => {
      await expect(redisAdapter.connect()).resolves.not.toThrow();
    });

    it('should handle connection errors gracefully', async () => {
      const badAdapter = new RedisAdapter();
      
      process.env.REDIS_URL = 'redis://invalid-host:6379';
      
      await expect(badAdapter.connect()).rejects.toThrow();
      
      process.env.REDIS_URL = 'redis://localhost:6379';
    });
  });

  describe('Disconnection', () => {
    it('should disconnect from Redis successfully', async () => {
      await expect(redisAdapter.disconnect()).resolves.not.toThrow();
    });
  });

  describe('Adapter Integration', () => {
    it('should adapt Socket.IO server with Redis adapter', () => {
      const httpServer = createServer();
      io = new SocketIOServer(httpServer);
      
      expect(() => {
        redisAdapter.adapt(io);
      }).not.toThrow();
      
      io.close();
    });

    it('should provide access to pub/sub clients', () => {
      const pubClient = redisAdapter.getPubClient();
      const subClient = redisAdapter.getSubClient();
      
      expect(pubClient).toBeDefined();
      expect(subClient).toBeDefined();
    });
  });

  describe('Multi-instance coordination', () => {
    it('should handle multiple Socket.IO instances', async () => {
      const httpServer1 = createServer();
      const httpServer2 = createServer();
      
      const io1 = new SocketIOServer(httpServer1);
      const io2 = new SocketIOServer(httpServer2);
      
      redisAdapter.adapt(io1);
      redisAdapter.adapt(io2);
      
      expect(io1.adapter).toBeDefined();
      expect(io2.adapter).toBeDefined();
      
      io1.close();
      io2.close();
    });
  });

  describe('Error handling', () => {
    it('should handle pub client errors', async () => {
      const pubClient = redisAdapter.getPubClient();
      
      const errorHandler = jest.fn();
      pubClient.on('error', errorHandler);
      
      await expect(redisAdapter.connect()).resolves.not.toThrow();
    });

    it('should handle sub client errors', async () => {
      const subClient = redisAdapter.getSubClient();
      
      const errorHandler = jest.fn();
      subClient.on('error', errorHandler);
      
      await expect(redisAdapter.connect()).resolves.not.toThrow();
    });
  });
});
