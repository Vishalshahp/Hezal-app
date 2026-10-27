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

const router = Router();

// Public registration routes
router.post('/register', registerCustomer);
router.post('/register/customer', registerCustomer);
router.post('/register/vendor', registerVendor);

// Public session routes
router.post('/login', login);
router.post('/logout', logout);

// Protected session lookup
router.get('/me', authenticate, getMe);

// Password recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
