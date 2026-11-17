import { Router } from 'express';
import {
  registerCustomer,
  registerVendor,
  login,
  loginWithTotp,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  setup2FA,
  verify2FASetup,
  disable2FA,
  getDemoTotpCode
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// SMS OTP Verification routes
router.post('/otp/send', otpLimiter, sendOtp);
router.post('/otp/verify', authLimiter, verifyOtp);

// Public registration routes with rate limiting
router.post('/register', authLimiter, registerCustomer);
router.post('/register/customer', authLimiter, registerCustomer);
router.post('/register/vendor', authLimiter, registerVendor);

// Public session routes with rate limiting
router.post('/login', authLimiter, login);
router.post('/login/totp', authLimiter, loginWithTotp);
router.get('/totp/demo-code', getDemoTotpCode);
router.post('/logout', logout);

// Protected session lookup
router.get('/me', authenticate, getMe);

// Google Authenticator 2FA management (Protected)
router.get('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FASetup);
router.post('/2fa/disable', authenticate, disable2FA);

// Password recovery with rate limiting
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

export default router;
