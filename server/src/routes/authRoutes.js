import { Router } from 'express';
import {
  registerCustomer,
  registerVendor,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public registration routes with rate limiting
router.post('/register', authLimiter, registerCustomer);
router.post('/register/customer', authLimiter, registerCustomer);
router.post('/register/vendor', authLimiter, registerVendor);

// Public session routes with rate limiting
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected session lookup
router.get('/me', authenticate, getMe);

// Password recovery with rate limiting
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

export default router;
