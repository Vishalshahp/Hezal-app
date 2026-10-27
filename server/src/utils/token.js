import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const COOKIE_NAME = 'hezal_auth_token';

/**
 * Generate a signed JWT
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      role: user.role,
      accountStatus: user.accountStatus
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN
    }
  );
};

/**
 * Set HttpOnly authentication cookie
 */
export const setAuthCookie = (res, token) => {
  const isProduction = env.isProduction;

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

/**
 * Clear authentication cookie upon logout
 */
export const clearAuthCookie = (res) => {
  const isProduction = env.isProduction;

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  });
};

export default {
  COOKIE_NAME,
  generateToken,
  setAuthCookie,
  clearAuthCookie
};
