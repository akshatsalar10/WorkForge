import express, { Application } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { apiRateLimiter } from './middlewares/rateLimiter';
import openapiSpec from './docs/openapi.json';
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import notificationRoutes from './routes/notification.routes';
import invitationRoutes from './routes/invitation.routes';

const app: Application = express();

// Serve static file uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter
app.use(apiRateLimiter);

// Gzip compression
app.use(compression());

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Documentation JSON
app.get('/api-docs', (req, res) => res.json(openapiSpec));

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
