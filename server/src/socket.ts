import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from './utils/logger';

let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user-specific notification room
    socket.on('join:user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        logger.info(`Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Join organization room for team broadcast events
    socket.on('join:organization', (orgId: string) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
        logger.info(`Socket ${socket.id} joined room org:${orgId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server | null => {
  return io;
};
