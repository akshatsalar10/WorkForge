import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);
    if (env.NODE_ENV === 'production' && (env.MONGODB_URI.includes('localhost') || env.MONGODB_URI.includes('127.0.0.1'))) {
      logger.warn('⚠️ MONGODB_URI is set to localhost in production mode! Please set your MongoDB Atlas connection string in your Render Environment Variables.');
    }
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};
