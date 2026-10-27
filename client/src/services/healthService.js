import { fetchJson } from './api';

/**
 * Fetch Express API Health
 */
export async function getApiHealth() {
  return await fetchJson('/health');
}

/**
 * Fetch MongoDB Database Health
 */
export async function getDbHealth() {
  return await fetchJson('/health/db');
}

/**
 * Check full backend and database connectivity status
 */
export async function checkSystemHealth() {
  const result = {
    api: { connected: false, data: null, error: null },
    db: { connected: false, data: null, error: null },
  };

  try {
    const apiData = await getApiHealth();
    result.api.connected = true;
    result.api.data = apiData;
  } catch (error) {
    result.api.connected = false;
    result.api.error = error.message;
  }

  try {
    const dbData = await getDbHealth();
    result.db.connected = true;
    result.db.data = dbData;
  } catch (error) {
    result.db.connected = false;
    result.db.error = error.data?.message || error.message;
  }

  return result;
}

export default {
  getApiHealth,
  getDbHealth,
  checkSystemHealth,
};
