import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';

describe('System Health & Documentation API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforge-test';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /api/v1/health', () => {
    it('should return operational health status with DB connection metrics', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(['UP', 'HEALTHY']).toContain(res.body.data.status);
      expect(res.body.data.database.connected).toBe(true);
      expect(typeof res.body.data.uptimeSeconds).toBe('number');
    });
  });

  describe('GET /api-docs', () => {
    it('should serve openapi 3.0.3 specification json', async () => {
      const res = await request(app).get('/api-docs');
      expect(res.status).toBe(200);
      expect(res.body.openapi).toBe('3.0.3');
      expect(res.body.info.title).toBe('WorkForge Production SaaS API Documentation');
    });
  });
});
