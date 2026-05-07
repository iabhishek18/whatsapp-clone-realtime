import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  about: string;
  phone: string;
  lastSeen: Date;
  isOnline: boolean;
  blockedUsers: string[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    about: { type: String, default: 'Available', maxlength: 139 },
    phone: { type: String, default: '' },
    lastSeen: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    blockedUsers: [{ type: String, ref: 'User' }],
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ name: 'text' });

export const User = mongoose.model<IUser>('User', userSchema);
