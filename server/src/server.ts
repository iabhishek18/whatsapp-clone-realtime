import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { authenticate } from './middleware/auth';
import { initializeSocket } from './socket/handler';
import { AppError } from './shared/errors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: config.CLIENT_URL, credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), connections: io.engine.clientsCount });
});

app.use('/api/auth', authRoutes);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ success: false, error: { code: error.code, message: error.message } });
    return;
  }
  if (error.name === 'ZodError') {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error } });
    return;
  }
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
});

initializeSocket(io);

async function start(): Promise<void> {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log(`[DB] Connected to MongoDB`);

    httpServer.listen(config.PORT, () => {
      console.log(`[Server] Running on port ${config.PORT}`);
      console.log(`[Socket] WebSocket ready`);
      console.log(`[ENV] ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error('[Fatal] Failed to start:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('[Shutdown] SIGTERM received');
  httpServer.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

start();
