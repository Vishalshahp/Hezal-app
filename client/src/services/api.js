export function isVercelDeployment() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname || '';
  return host.endsWith('vercel.app') || host.includes('vercel');
}

export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // When accessing from phone or another device on the local network (e.g. 192.168.1.9)
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !isVercelDeployment()) {
      return `http://${host}:5000/api`;
    }
    // On Vercel without a custom external backend URL
    if (isVercelDeployment()) {
      return '/api';
    }
  }
  return 'http://localhost:5000/api';
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Reusable JSON fetch wrapper with HttpOnly cookie support
 * @param {string} endpoint - Relative path (e.g. '/health')
 * @param {RequestInit} [options] - Fetch configuration options
 */
export async function fetchJson(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('hezal_auth_token') : null;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 6000);

  try {
    const response = await fetch(url, {
      credentials: 'include', // Automatically send and receive HttpOnly cookies
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const htmlError = new Error('API service returned HTML instead of JSON (backend endpoint unavailable).');
      htmlError.code = 'BACKEND_UNAVAILABLE';
      htmlError.status = 503;
      throw htmlError;
    }

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse JSON response from server',
    }));

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status} Error`);
      error.status = response.status;
      error.data = data;
      if (data.message === 'Failed to parse JSON response from server') {
        error.code = 'BACKEND_UNAVAILABLE';
      }
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError = new Error('Connection timed out. Backend server is not responding.');
      timeoutError.code = 'TIMEOUT';
      throw timeoutError;
    }

    if (error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
      const netError = new Error('Failed to connect to backend server.');
      netError.code = 'BACKEND_UNAVAILABLE';
      netError.originalError = error;
      throw netError;
    }

    throw error;
  }
}

/**
 * Upload multipart form-data (e.g. image files) with HttpOnly cookie support
 */
export async function uploadFormData(endpoint, formData) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('hezal_auth_token') : null;

  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse response from server',
  }));

  if (!response.ok) {
    const error = new Error(data.message || `HTTP ${response.status} Error`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export { API_BASE_URL };
export default { fetchJson, uploadFormData, API_BASE_URL };
