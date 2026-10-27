import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const requiredEnvVars = ['NODE_ENV'];

// Validate environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`[WARN] Missing environment variable: ${envVar}. Using fallback.`);
  }
}

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable must be set in production!');
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hezal_market',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'hezal_dev_jwt_secret_key_849201938572019485720194',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Platform Administrator',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@hezalmarket.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isDevelopment: process.env.NODE_ENV === 'development' || !process.env.NODE_ENV
};

export default env;
