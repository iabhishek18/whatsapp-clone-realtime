import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../user/user.model';
import { generateToken } from '../../middleware/auth';
import { AppError } from '../../shared/errors';

export const authRoutes = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

authRoutes.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) throw AppError.conflict('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await User.create({ ...data, password: hashedPassword });

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, about: user.about },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email }).select('+password');
    if (!user) throw AppError.unauthorized('Invalid email or password');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw AppError.unauthorized('Invalid email or password');

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, about: user.about },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth) throw AppError.unauthorized();
    const user = await User.findById(req.auth.userId);
    if (!user) throw AppError.notFound('User', req.auth.userId);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});
