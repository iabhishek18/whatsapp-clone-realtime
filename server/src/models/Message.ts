import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chatId: string;
  sender: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio';
  readBy: string[];
  deliveredTo: string[];
  replyTo?: string;
  isDeleted: boolean;
}

const messageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true, index: true },
  sender: { type: String, required: true, ref: 'User' },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'video', 'document', 'audio'], default: 'text' },
  readBy: [{ type: String, ref: 'User' }],
  deliveredTo: [{ type: String, ref: 'User' }],
  replyTo: { type: String, ref: 'Message' },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
