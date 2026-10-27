import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import { COOKIE_NAME } from '../utils/token.js';

/**
 * Authentication verification middleware
 * Checks HttpOnly cookie or Authorization Bearer header
 */
export const authenticate = async (req, res, next) => {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  // 2. Fallback to Authorization: Bearer <token>
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      message: 'Authentication required. Please sign in to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Authoritative user verification against database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        status: 'unauthorized',
        message: 'Authentication session is invalid. User account not found.'
      });
    }

    // Account status check
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
        message: 'Your account registration is pending activation.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        status: 'unauthorized',
        message: 'Your session has expired. Please sign in again.'
      });
    }

    return res.status(401).json({
      success: false,
      status: 'unauthorized',
      message: 'Invalid authentication token.'
    });
  }
};

export default authenticate;
