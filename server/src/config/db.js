import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

let isConnecting = false;

/**
 * Connect to MongoDB Atlas / Local MongoDB
 */
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB is already connected.');
    return mongoose.connection;
  }

  if (isConnecting) {
    logger.info('MongoDB connection is already in progress...');
    return;
  }

  if (!env.MONGODB_URI) {
    logger.error('MONGODB_URI environment variable is missing.');
    return null;
  }

  try {
    isConnecting = true;
    logger.info('Connecting to MongoDB...');

    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
      socketTimeoutMS: 45000,
      autoIndex: env.isDevelopment
    };

    const conn = await mongoose.connect(env.MONGODB_URI, options);
    isConnecting = false;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    isConnecting = false;
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.warn('The API server will continue running, but database-dependent features will be unavailable.');
    logger.warn('Please check that MongoDB is running locally or verify your Atlas MONGODB_URI in .env.');
    return null;
  }
};

/**
 * Disconnect from MongoDB cleanly
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected cleanly.');
    } catch (error) {
      logger.error(`Error disconnecting MongoDB: ${error.message}`);
    }
  }
};

// Listen for connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose event: connected to MongoDB.');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose event: disconnected from MongoDB.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`Mongoose event error: ${err.message}`);
});

export default {
  connectDB,
  disconnectDB
};
