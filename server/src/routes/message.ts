import { Router, Request, Response } from 'express';
import { Message } from '../models/Message';

export const messageRoutes = Router();

messageRoutes.get('/:chatId', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find({ chatId: req.params.chatId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    const total = await Message.countDocuments({ chatId: req.params.chatId });
    res.json({ messages: messages.reverse(), pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) } });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch messages' }); }
});
