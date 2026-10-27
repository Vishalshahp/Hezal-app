import env from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Centralized API error handling middleware
 */
export const errorHandler = (err, req, res, _next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  const responsePayload = {
    success: false,
    status: 'error',
    message: err.message || 'Internal Server Error',
    error: {
      code: err.code || 'INTERNAL_ERROR',
      ...(env.isDevelopment && { stack: err.stack })
    }
  };

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
