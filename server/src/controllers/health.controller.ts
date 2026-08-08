import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse';

export class HealthController {
  static async check(req: Request, res: Response) {
    const startTime = Date.now();
    const dbState = mongoose.connection.readyState;
    const isDbConnected = dbState === 1;

    let dbLatencyMs = 0;
    if (isDbConnected && mongoose.connection.db) {
      try {
        await mongoose.connection.db.admin().ping();
        dbLatencyMs = Date.now() - startTime;
      } catch (err) {
        dbLatencyMs = -1;
      }
    }

    return ApiResponse.success({
      res,
      message: 'WorkForge server operational.',
      data: {
        status: isDbConnected ? 'HEALTHY' : 'DEGRADED',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_NODE_ENV || process.env.NODE_ENV || 'development',
        database: {
          connected: isDbConnected,
          latencyMs: dbLatencyMs,
          name: mongoose.connection.name
        }
      }
    });
  }
}
