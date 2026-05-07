import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatMember {
  userId: Types.ObjectId;
  role: 'admin' | 'member';
  joinedAt: Date;
  isMuted: boolean;
  mutedUntil?: Date;
}

export interface IChat extends Document {
  type: 'private' | 'group';
  members: IChatMember[];
  groupName?: string;
  groupDescription?: string;
  groupAvatar?: string;
  createdBy: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  lastMessageAt: Date;
  pinnedMessages: Types.ObjectId[];
}

const chatMemberSchema = new Schema<IChatMember>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    isMuted: { type: Boolean, default: false },
    mutedUntil: Date,
  },
  { _id: false }
);

const chatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ['private', 'group'], required: true },
    members: { type: [chatMemberSchema], validate: [{ validator: (v: IChatMember[]) => v.length >= 2, message: 'Chat must have at least 2 members' }] },
    groupName: { type: String, maxlength: 100 },
    groupDescription: { type: String, maxlength: 512 },
    groupAvatar: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date, default: Date.now },
    pinnedMessages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  },
  { timestamps: true }
);

chatSchema.index({ 'members.userId': 1 });
chatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', chatSchema);
