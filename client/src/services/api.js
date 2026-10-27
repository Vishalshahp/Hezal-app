const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Reusable JSON fetch wrapper with HttpOnly cookie support
 * @param {string} endpoint - Relative path (e.g. '/health')
 * @param {RequestInit} [options] - Fetch configuration options
 */
export async function fetchJson(endpoint, options = {}) {
  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);

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

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse JSON response from server',
    }));

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status} Error`);
      error.status = response.status;
      error.data = data;
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

    throw error;
  }
}

export { API_BASE_URL };
export default { fetchJson, API_BASE_URL };
