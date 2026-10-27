import app from './app.js';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

let server;

const startServer = async () => {
  try {
    // Attempt MongoDB connection (non-blocking for API server start)
    await connectDB();

    server = app.listen(env.PORT, () => {
      logger.info(`=================================================`);
      logger.info(`  Hezal Market API Server Running`);
      logger.info(`  Environment: ${env.NODE_ENV}`);
      logger.info(`  Port:        ${env.PORT}`);
      logger.info(`  Base URL:    http://localhost:${env.PORT}`);
      logger.info(`  Health API:  http://localhost:${env.PORT}/api/health`);
      logger.info(`  DB Health:   http://localhost:${env.PORT}/api/health/db`);
      logger.info(`=================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handling
const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDB();
      logger.info('Clean exit completed.');
      process.exit(0);
    });

    // Force exit if shutdown hangs beyond 10s
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
