import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import apiRouter from './routes/index.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security HTTP headers with cross-origin resource policy for uploaded images
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Allow configured frontend origin(s) or local Vite ports
      const configuredOrigins = (env.FRONTEND_URL || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);

      const allowedOrigins = [
        ...configuredOrigins,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Cookie parsing for HttpOnly authentication tokens
app.use(cookieParser());

// JSON request body parser with 10kb limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging in development/production (suppressed in test)
if (!env.isTest) {
  app.use(morgan(env.isDevelopment ? 'dev' : 'combined'));
}

// Serve static uploads for local image storage
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route ping
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'Hezal Market API',
    version: '1.0.0',
    description: 'Local vendor discovery platform backend',
    health: '/api/health',
    docs: '/docs'
  });
});

// Apply general rate limiting across API endpoints
app.use('/api', generalLimiter);

// Mount modular API routes under /api
app.use('/api', apiRouter);

// Handle 404 for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
