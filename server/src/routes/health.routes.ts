import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const startTime = Date.now();
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;

  let dbLatencyMs = 0;
  if (isConnected && mongoose.connection.db) {
    try {
      await mongoose.connection.db.admin().ping();
      dbLatencyMs = Date.now() - startTime;
    } catch (err) {
      dbLatencyMs = -1;
    }
  }

  return ApiResponse.success({
    res,
    message: 'WorkForge API Service is healthy',
    data: {
      status: isConnected ? 'HEALTHY' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: isConnected,
        status: dbStateMap[dbState] || 'unknown',
        readyState: dbState,
        latencyMs: dbLatencyMs,
        name: mongoose.connection.name
      },
      memoryUsage: process.memoryUsage()
    }
  });
});

export default router;
