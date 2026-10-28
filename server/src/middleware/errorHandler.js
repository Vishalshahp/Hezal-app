import env from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Centralized API error handling middleware
 */
export const errorHandler = (err, req, res, _next) => {
  logger.error(`Error processing ${req.method} ${req.originalUrl}:`, err.message);

  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'INTERNAL_ERROR';

  // Mongoose CastError (e.g. invalid ObjectId format in request params)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path || 'id'}. Value "${err.value}" is not a valid identifier.`;
    errorCode = 'INVALID_ID_FORMAT';
  }

  // Mongoose Schema ValidationError (e.g. missing required field, minlength violation)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors || {}).map((e) => e.message);
    message = errors.length > 0 ? errors.join('. ') : 'Schema validation error.';
    errorCode = 'VALIDATION_ERROR';
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    message = `An entry with this ${duplicateFields || 'value'} already exists.`;
    errorCode = 'DUPLICATE_ENTRY';
  }

  // Malformed JSON body parser error
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON syntax in request payload.';
    errorCode = 'MALFORMED_JSON';
  }

  const responsePayload = {
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    error: {
      code: errorCode,
      ...(env.isDevelopment && { stack: err.stack })
    }
  };

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
