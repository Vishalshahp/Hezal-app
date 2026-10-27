import mongoose from 'mongoose';
import env from '../config/env.js';

/**
 * Basic API health check
 * GET /api/health
 */
export const getApiHealth = (req, res) => {
  const timestamp = new Date().toISOString();
  return res.status(200).json({
    success: true,
    message: 'Hezal Market API is running',
    status: 'ok',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp
  });
};

/**
 * Database health check with real ping
 * GET /api/health/db
 */
export const getDbHealth = async (req, res) => {
  const readyStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const currentState = mongoose.connection.readyState;
  const stateLabel = readyStates[currentState] || 'unknown';

  // If not connected (state !== 1), return 503 Service Unavailable immediately
  if (currentState !== 1) {
    return res.status(503).json({
      success: false,
      status: stateLabel,
      message: 'Database is not connected. MongoDB server is unreachable or offline.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Perform a real database round-trip check using admin ping
    if (!mongoose.connection.db) {
      throw new Error('Database instance is undefined');
    }

    const pingResult = await mongoose.connection.db.admin().ping();

    if (pingResult && pingResult.ok === 1) {
      return res.status(200).json({
        success: true,
        status: 'connected',
        message: 'MongoDB Atlas is connected and responsive',
        data: {
          database: mongoose.connection.name || 'default',
          host: mongoose.connection.host,
          readyState: stateLabel,
          ping: 'ok'
        },
        timestamp: new Date().toISOString()
      });
    }

    throw new Error('Ping did not return ok: 1');
  } catch (_error) {
    return res.status(503).json({
      success: false,
      status: 'error',
      message: 'Database connection failed verification',
      error: 'Ping to MongoDB server failed or timed out',
      timestamp: new Date().toISOString()
    });
  }
};
