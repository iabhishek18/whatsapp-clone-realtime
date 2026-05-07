import mongoose, { Schema, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: MessageType;
  status: MessageStatus;
  readBy: Types.ObjectId[];
  deliveredTo: Types.ObjectId[];
  replyTo?: Types.ObjectId;
  mediaUrl?: string;
  mediaThumbnail?: string;
  isForwarded: boolean;
  isDeleted: boolean;
  isStarred: boolean;
  editedAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 4096 },
    type: { type: String, enum: ['text', 'image', 'video', 'audio', 'document', 'location', 'contact'], default: 'text' },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    mediaUrl: String,
    mediaThumbnail: String,
    isForwarded: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isStarred: { type: Boolean, default: false },
    editedAt: Date,
  },
  { timestamps: true }
);

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
