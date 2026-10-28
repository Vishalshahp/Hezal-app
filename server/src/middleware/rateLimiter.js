import rateLimit from 'express-rate-limit';
import env from '../config/env.js';

/**
 * Standard API rate limiter
 * Protects public endpoints from scraping and denial-of-service
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // 600 requests per 15 minutes per IP
  standardHeaders: true, // Return standard `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: () => env.isTest, // Disable in automated test environment
  message: {
    success: false,
    status: 'error',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    error: {
      code: 'RATE_LIMIT_EXCEEDED'
    }
  }
});

/**
 * Strict authentication limiter
 * Protects login and registration from brute force credential stuffing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    status: 'error',
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
  }
});

/**
 * Report submission limiter
 * Protects community reporting form from automated spamming
 */
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 reports per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    status: 'error',
    message: 'Too many reports submitted from this IP. Please try again later.',
    error: {
      code: 'REPORT_RATE_LIMIT_EXCEEDED'
    }
  }
});

/**
 * OTP Request limiter
 * Protects SMS API endpoints from exhaustion and phone spamming
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 12, // 12 OTP requests per 10 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  message: {
    success: false,
    status: 'error',
    message: 'Too many OTP requests. Please wait 10 minutes before requesting another code.',
    error: {
      code: 'OTP_RATE_LIMIT_EXCEEDED'
    }
  }
});

export default {
  generalLimiter,
  authLimiter,
  reportLimiter,
  otpLimiter
};
