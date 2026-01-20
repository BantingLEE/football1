import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { RedisAdapter } from './middleware/redisAdapter';
import { MessageService } from './services/messageService';
import { SocketHandlers } from './socket/handlers';
import { MessageController } from './controllers/messageController';
import { createMessageRoutes } from './routes/messages';

dotenv.config();

const PORT = process.env.PORT || 3008;

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  app.use(express.json());

  const redisAdapter = new RedisAdapter();
  await redisAdapter.connect();
  redisAdapter.adapt(io);

  const messageService = new MessageService(io);
  const socketHandlers = new SocketHandlers(io, messageService);
  const messageController = new MessageController(messageService);

  socketHandlers.registerHandlers();

  app.use('/api/messages', createMessageRoutes(messageController));

  httpServer.listen(PORT, () => {
    console.log(`Message service listening on port ${PORT}`);
  });

  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await redisAdapter.disconnect();
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
