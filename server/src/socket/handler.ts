import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User } from '../modules/user/user.model';
import { Message } from '../modules/message/message.model';
import { Chat } from '../modules/chat/chat.model';
import { AuthPayload } from '../middleware/auth';

interface ConnectedUser {
  socketId: string;
  userId: string;
}

const onlineUsers = new Map<string, ConnectedUser>();

export function initializeSocket(io: Server): void {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) {
      return next(new Error('Authentication token required'));
    }
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as AuthPayload;
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId as string;
    onlineUsers.set(userId, { socketId: socket.id, userId });

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

    const userChats = await Chat.find({ 'members.userId': userId }).select('_id');
    userChats.forEach((chat) => socket.join(chat._id.toString()));

    socket.broadcast.emit('user:status', { userId, isOnline: true, lastSeen: new Date() });

    socket.on('message:send', async (data: { chatId: string; content: string; type: string; replyTo?: string; mediaUrl?: string }) => {
      try {
        const chat = await Chat.findById(data.chatId);
        if (!chat) return socket.emit('error', { code: 'CHAT_NOT_FOUND', message: 'Chat not found' });

        const isMember = chat.members.some((m) => m.userId.toString() === userId);
        if (!isMember) return socket.emit('error', { code: 'NOT_MEMBER', message: 'You are not a member of this chat' });

        const message = await Message.create({
          chatId: data.chatId,
          sender: userId,
          content: data.content,
          type: data.type || 'text',
          replyTo: data.replyTo || undefined,
          mediaUrl: data.mediaUrl,
          status: 'sent',
        });

        await Chat.findByIdAndUpdate(data.chatId, { lastMessage: message._id, lastMessageAt: new Date() });

        const populated = await Message.findById(message._id).populate('sender', 'name avatar').populate('replyTo', 'content sender');

        socket.to(data.chatId).emit('message:new', populated);
        socket.emit('message:sent', { messageId: message._id, chatId: data.chatId, status: 'sent' });

        chat.members.forEach((member) => {
          if (member.userId.toString() !== userId) {
            const recipient = onlineUsers.get(member.userId.toString());
            if (recipient) {
              io.to(recipient.socketId).emit('message:delivered', { messageId: message._id, chatId: data.chatId });
            }
          }
        });
      } catch (error) {
        socket.emit('error', { code: 'SEND_FAILED', message: 'Failed to send message' });
      }
    });

    socket.on('message:read', async (data: { chatId: string; messageIds: string[] }) => {
      try {
        await Message.updateMany(
          { _id: { $in: data.messageIds }, sender: { $ne: userId } },
          { $addToSet: { readBy: userId }, status: 'read' }
        );
        socket.to(data.chatId).emit('message:read_receipt', { chatId: data.chatId, readBy: userId, messageIds: data.messageIds, readAt: new Date() });
      } catch {
        socket.emit('error', { code: 'READ_FAILED', message: 'Failed to mark messages as read' });
      }
    });

    socket.on('typing:start', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('typing:indicator', { chatId: data.chatId, userId, isTyping: true });
    });

    socket.on('typing:stop', (data: { chatId: string }) => {
      socket.to(data.chatId).emit('typing:indicator', { chatId: data.chatId, userId, isTyping: false });
    });

    socket.on('message:delete', async (data: { messageId: string; chatId: string; forEveryone: boolean }) => {
      try {
        const message = await Message.findById(data.messageId);
        if (!message || message.sender.toString() !== userId) return;

        if (data.forEveryone) {
          message.content = 'This message was deleted';
          message.isDeleted = true;
          await message.save();
          socket.to(data.chatId).emit('message:deleted', { messageId: data.messageId, chatId: data.chatId });
        } else {
          await Message.findByIdAndDelete(data.messageId);
        }
        socket.emit('message:delete_success', { messageId: data.messageId });
      } catch {
        socket.emit('error', { code: 'DELETE_FAILED', message: 'Failed to delete message' });
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      socket.broadcast.emit('user:status', { userId, isOnline: false, lastSeen: new Date() });
    });
  });
}

export function getOnlineUsers(): Map<string, ConnectedUser> {
  return onlineUsers;
}
