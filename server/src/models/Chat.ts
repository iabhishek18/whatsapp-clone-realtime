import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  participants: string[];
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  admin?: string;
  lastMessage?: string;
  lastMessageAt: Date;
}

const chatSchema = new Schema<IChat>({
  participants: [{ type: String, ref: 'User', required: true }],
  isGroup: { type: Boolean, default: false },
  groupName: { type: String },
  groupAvatar: { type: String },
  admin: { type: String, ref: 'User' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
