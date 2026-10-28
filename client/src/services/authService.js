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

export default {
  registerCustomer,
  registerVendor,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
};
