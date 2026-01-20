import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';

export class MessageController {
  constructor(private messageService: MessageService) {}

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({ status: 'ok', service: 'message-service' });
  }

  async broadcastToRoom(req: Request, res: Response): Promise<void> {
    const { room, event, data } = req.body;

    if (!room || !event) {
      res.status(400).json({ error: 'room and event are required' });
      return;
    }

    this.messageService.broadcastToRoom(room, event, data);
    res.json({ success: true, message: 'Broadcast sent' });
  }

  async sendToUser(req: Request, res: Response): Promise<void> {
    const { userId, event, data } = req.body;

    if (!userId || !event) {
      res.status(400).json({ error: 'userId and event are required' });
      return;
    }

    this.messageService.sendToUser(userId, event, data);
    res.json({ success: true, message: 'Message sent to user' });
  }
}
