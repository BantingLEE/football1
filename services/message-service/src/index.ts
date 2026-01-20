import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { RedisAdapter } from './middleware/redisAdapter';
import { MessageService } from './services/messageService';
import { SocketHandlers } from './socket/handlers';
import { MessageController } from './controllers/messageController';
import { createMessageRoutes } from './routes/messages';
import { authMiddleware } from './middleware/auth';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import { initLogger, getLogger, toAppError } from 'football-manager-shared';

dotenv.config();

const logger = initLogger('message-service');
const PORT = process.env.PORT || 3008;

let httpServer: ReturnType<typeof createServer>;
let redisAdapter: RedisAdapter;

async function startServer() {
  const app = express();
  httpServer = createServer(app);
  
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  app.use(express.json());

  io.use(authMiddleware);
  io.use(rateLimiterMiddleware);

  redisAdapter = new RedisAdapter();
  await redisAdapter.connect();
  redisAdapter.adapt(io);

  const messageService = new MessageService(io);
  const socketHandlers = new SocketHandlers(io, messageService);
  const messageController = new MessageController(messageService);

  socketHandlers.registerHandlers();

  app.use('/api/messages', createMessageRoutes(messageController));

  httpServer.listen(PORT, () => {
    logger.info(`Message service listening on port ${PORT}`);
  });

  setupGracefulShutdown(io);
}

function setupGracefulShutdown(io: SocketIOServer): void {
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    
    try {
      io.close(() => {
        logger.info('Socket.IO server closed');
      });

      if (redisAdapter) {
        await redisAdapter.disconnect();
        logger.info('Redis adapter disconnected');
      }

      if (httpServer) {
        httpServer.close(() => {
          logger.info('HTTP server closed');
          process.exit(0);
        });
      }
    } catch (error) {
      logger.error('Error during graceful shutdown', error);
      process.exit(1);
    }

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', reason, { promise });
    gracefulShutdown('unhandledRejection');
  });
}

startServer().catch((error) => {
  const appError = toAppError(error);
  logger.error('Failed to start server', error);
  process.exit(1);
});
