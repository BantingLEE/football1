import { Router } from 'express';
import { MessageController } from '../controllers/messageController';

export function createMessageRoutes(messageController: MessageController): Router {
  const router = Router();

  router.get('/health', (req, res) => messageController.healthCheck(req, res));
  router.post('/broadcast', (req, res) => messageController.broadcastToRoom(req, res));
  router.post('/send', (req, res) => messageController.sendToUser(req, res));

  return router;
}
