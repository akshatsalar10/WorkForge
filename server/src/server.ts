import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();
    
    server.listen(env.PORT, () => {
      logger.info(`🚀 WorkForge Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason: Error) => {
  logger.error(`Unhandled Rejection: ${reason.message || reason}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message || error}`);
  process.exit(1);
});

startServer();
