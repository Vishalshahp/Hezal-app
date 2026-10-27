import crypto from 'crypto';
import User from '../models/User.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register Customer Account
 * POST /api/auth/register/customer (or POST /api/auth/register)
 */
export const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Field validations
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Name, email, and password are required fields.'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Name must be at least 2 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Password must be at least 8 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Passwords do not match.'
      });
    }

    // Role Escalation Prevention: Client-supplied role is ignored; hardcode 'customer'
    const role = 'customer';

    // Duplicate account check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        status: 'conflict',
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user record
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role,
      accountStatus: 'active'
    });

    // Establish session
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Customer account registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Register Vendor Account
 * POST /api/auth/register/vendor
 */
export const registerVendor = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Name, email, and password are required fields.'
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Name must be at least 2 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Please provide a valid email address.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Password must be at least 8 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Passwords do not match.'
      });
    }

    // Role Escalation Prevention: Vendor registration assigns 'vendor' role only
    const role = 'vendor';

    // Duplicate account check
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        status: 'conflict',
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const passwordHash = await User.hashPassword(password);

    // Create user record
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '',
      passwordHash,
      role,
      accountStatus: 'active'
    });

    // Establish session
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      status: 'ok',
      message: 'Vendor account registered successfully. Please complete your stall profile.',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User Sign In
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Please provide both email address and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      // Generic error message to prevent user enumeration
      return res.status(401).json({
        success: false,
        status: 'unauthorized',
        message: 'Invalid email address or password.'
      });
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        status: 'unauthorized',
        message: 'Invalid email address or password.'
      });
    }

    // Account status checks
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'Your account has been suspended. Please contact platform moderation.'
      });
    }

    if (user.accountStatus === 'pending') {
      return res.status(403).json({
        success: false,
        status: 'forbidden',
        message: 'Your account is pending activation.'
      });
    }

    // Establish authenticated session
    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Signed in successfully',
      data: {
        user,
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * User Sign Out
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  clearAuthCookie(res);

  return res.status(200).json({
    success: true,
    status: 'ok',
    message: 'Signed out successfully'
  });
};

/**
 * Get Current Authenticated User
 * GET /api/auth/me
 */
export const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    status: 'ok',
    data: {
      user: req.user
    }
  });
};

/**
 * Forgot Password - Initiate Reset Token
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Please provide an email address.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond with a generic message to prevent account discovery
    const genericResponse = {
      success: true,
      status: 'ok',
      message: 'If an account with that email exists, password reset instructions have been dispatched.'
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Generate cryptographically secure random token (32 bytes = 64 hex chars)
    const rawResetToken = crypto.randomBytes(32).toString('hex');

    // Hash token before storing in MongoDB
    const hashedToken = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // Expiry: 1 hour (3,600,000 ms)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${env.FRONTEND_URL}/reset-password/${rawResetToken}`;

    // In development / test, log the reset URL for verification
    if (env.isDevelopment || env.isTest) {
      logger.info(`[DEV PASSWORD RESET] Reset URL for ${user.email}: ${resetUrl}`);
    }

    // In test environment, attach preview token to response for test validation
    if (env.isTest) {
      return res.status(200).json({
        ...genericResponse,
        _testResetToken: rawResetToken
      });
    }

    return res.status(200).json(genericResponse);
  } catch (err) {
    next(err);
  }
};

/**
 * Reset Password with Token
 * POST /api/auth/reset-password/:token
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Reset token is missing.'
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Password must be at least 8 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Passwords do not match.'
      });
    }

    // Hash parameter token with SHA-256 to compare against database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+passwordHash');

    if (!user) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Password reset token is invalid or has expired.'
      });
    }

    // Update password
    user.passwordHash = await User.hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      status: 'ok',
      message: 'Password has been reset successfully. You may now sign in with your new credentials.'
    });
  } catch (err) {
    next(err);
  }
};
