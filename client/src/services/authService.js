import { fetchJson } from './api';

/**
 * Register a new customer
 */
export async function registerCustomer(payload) {
  return await fetchJson('/auth/register/customer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Register a new vendor
 */
export async function registerVendor(payload) {
  return await fetchJson('/auth/register/vendor', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Sign in user
 */
export async function login(email, password) {
  return await fetchJson('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Sign out user
 */
export async function logout() {
  return await fetchJson('/auth/logout', {
    method: 'POST',
  });
}

/**
 * Fetch current authenticated user session
 */
export async function getCurrentUser() {
  return await fetchJson('/auth/me');
}

/**
 * Request password reset email
 */
export async function forgotPassword(email) {
  return await fetchJson('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password using token
 */
export async function resetPassword(token, password, confirmPassword) {
  return await fetchJson(`/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password, confirmPassword }),
  });
}

/**
 * Request SMS OTP verification code
 * @param {Object} data
 * @param {string} data.phone
 * @param {string} [data.purpose='registration']
 */
export async function sendOtp(data) {
  return await fetchJson('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Verify SMS OTP code
 * @param {Object} data
 * @param {string} data.phone
 * @param {string} data.otp
 * @param {string} [data.purpose='registration']
 */
export async function verifyOtp(data) {
  return await fetchJson('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Sign in or Sign up with Google Account (Free Google Authentication API)
 * @param {string} idToken - Google credential JWT
 * @param {'customer'|'vendor'|'admin'} [role='customer']
 */
export async function loginWithGoogle(idToken, role = 'customer') {
  return await fetchJson('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken, role }),
  });
}

/**
 * Sign in user using Google Authenticator code (Passwordless TOTP)
 */
export async function loginWithTotp(email, code) {
  return await fetchJson('/auth/login/totp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

/**
 * Get current live demo Google Authenticator code for testing
 */
export async function getDemoTotpCode() {
  return await fetchJson('/auth/totp/demo-code');
}

/**
 * Initiate Google Authenticator 2FA Setup
 */
export async function get2FASetup() {
  return await fetchJson('/auth/2fa/setup');
}

/**
 * Verify & enable Google Authenticator 2FA
 */
export async function verify2FASetup(secret, code) {
  return await fetchJson('/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ secret, code }),
  });
}

/**
 * Disable Google Authenticator 2FA
 */
export async function disable2FA(password) {
  return await fetchJson('/auth/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}

export default {
  registerCustomer,
  registerVendor,
  login,
  loginWithGoogle,
  loginWithTotp,
  getDemoTotpCode,
  get2FASetup,
  verify2FASetup,
  disable2FA,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
};
