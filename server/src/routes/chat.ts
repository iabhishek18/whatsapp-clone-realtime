import { Router, Request, Response } from 'express';
import { Chat } from '../models/Chat';

export const chatRoutes = Router();

chatRoutes.get('/:userId', async (req: Request, res: Response) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId }).sort({ lastMessageAt: -1 });
    res.json({ chats });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch chats' }); }
});

chatRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { participants, isGroup, groupName } = req.body;
    if (!isGroup) {
      const existing = await Chat.findOne({ participants: { $all: participants, $size: 2 }, isGroup: false });
      if (existing) return res.json({ chat: existing });
    }
    const chat = await Chat.create({ participants, isGroup, groupName, admin: isGroup ? participants[0] : undefined });
    res.status(201).json({ chat });
  } catch (err) { res.status(500).json({ error: 'Failed to create chat' }); }
});
