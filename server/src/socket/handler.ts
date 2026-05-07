import { Server, Socket } from 'socket.io';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { User } from '../models/User';

const onlineUsers = new Map<string, string>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).exec();
      io.emit('user:online', { userId, isOnline: true });
    }

    socket.on('message:send', async (data: { chatId: string; content: string; type: string; replyTo?: string }) => {
      const message = await Message.create({ chatId: data.chatId, sender: userId, content: data.content, type: data.type || 'text', replyTo: data.replyTo });
      await Chat.findByIdAndUpdate(data.chatId, { lastMessage: data.content, lastMessageAt: new Date() });
      const chat = await Chat.findById(data.chatId);
      if (chat) {
        chat.participants.forEach((participantId) => {
          const participantSocket = onlineUsers.get(participantId);
          if (participantSocket && participantId !== userId) {
            io.to(participantSocket).emit('message:received', message);
          }
        });
      }
      socket.emit('message:sent', message);
    });

    socket.on('message:read', async (data: { chatId: string; messageIds: string[] }) => {
      await Message.updateMany({ _id: { $in: data.messageIds } }, { $addToSet: { readBy: userId } });
      const chat = await Chat.findById(data.chatId);
      if (chat) {
        chat.participants.forEach((participantId) => {
          const participantSocket = onlineUsers.get(participantId);
          if (participantSocket && participantId !== userId) {
            io.to(participantSocket).emit('message:read', { chatId: data.chatId, readBy: userId, messageIds: data.messageIds });
          }
        });
      }
    });

    socket.on('typing:start', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('typing:start', { chatId: data.chatId, userId });
    });

    socket.on('typing:stop', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('typing:stop', { chatId: data.chatId, userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }).exec();
      io.emit('user:online', { userId, isOnline: false });
    });
  });
}
