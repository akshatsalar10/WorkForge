import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import { RefreshToken } from '../src/models/refreshToken.model';

describe('Authentication API Endpoints', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforge-test';
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await RefreshToken.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user and return tokens', async () => {
      const payload = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'Password123'
      };

      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(payload.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject registration with duplicate email address', async () => {
      const payload = {
        name: 'Alex Johnson',
        email: 'duplicate@example.com',
        password: 'Password123'
      };

      await request(app).post('/api/v1/auth/register').send(payload);
      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const registerPayload = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123'
      };
      await request(app).post('/api/v1/auth/register').send(registerPayload);

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'jane@example.com',
        password: 'Password123'
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should reject invalid password', async () => {
      const registerPayload = {
        name: 'Jane Doe',
        email: 'jane2@example.com',
        password: 'Password123'
      };
      await request(app).post('/api/v1/auth/register').send(registerPayload);

      const loginRes = await request(app).post('/api/v1/auth/login').send({
        email: 'jane2@example.com',
        password: 'WrongPassword123'
      });

      expect(loginRes.status).toBe(401);
      expect(loginRes.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile when authenticated', async () => {
      const registerRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Auth User',
        email: 'authuser@example.com',
        password: 'Password123'
      });

      const token = registerRes.body.data.tokens.accessToken;

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.email).toBe('authuser@example.com');
    });

    it('should return 401 when token is missing', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
