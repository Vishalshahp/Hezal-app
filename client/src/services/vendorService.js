import { fetchJson, uploadFormData } from './api';
import {
  FALLBACK_CATEGORIES,
  queryFallbackVendors,
  queryFallbackVendorProfile,
} from '../data/fallbackData';

function isNetworkError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('connection refused') ||
    msg.includes('timed out') ||
    msg.includes('abort') ||
    err.name === 'TypeError' ||
    err.code === 'TIMEOUT' ||
    (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app'))
  );
}

export async function getMyProfile() {
  return await fetchJson('/vendor/profile');
}

export async function createProfile(data) {
  return await fetchJson('/vendor/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProfile(data) {
  return await fetchJson('/vendor/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updateLocation(data) {
  return await fetchJson('/vendor/location', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updateAvailability(data) {
  return await fetchJson('/vendor/availability', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getVendorStats() {
  return await fetchJson('/vendor/stats');
}

export async function uploadStallImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  return await uploadFormData('/vendor/upload', formData);
}

export async function getCategories() {
  try {
    return await fetchJson('/categories');
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using verified categories fallback:', err.message);
      return { success: true, data: { categories: FALLBACK_CATEGORIES } };
    }
    throw err;
  }
}

export async function searchVendors(params = {}) {
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    }
    const qs = query.toString();
    return await fetchJson(`/vendors${qs ? `?${qs}` : ''}`);
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using verified stalls fallback:', err.message);
      return queryFallbackVendors(params);
    }
    throw err;
  }
}

export async function getNearbyVendors(params = {}) {
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    }
    return await fetchJson(`/vendors/nearby?${query.toString()}`);
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using nearby stalls fallback:', err.message);
      return queryFallbackVendors(params);
    }
    throw err;
  }
}

export async function getPublicProfile(id) {
  try {
    return await fetchJson(`/vendors/${id}`);
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using stall profile fallback:', err.message);
      const fallback = queryFallbackVendorProfile(id);
      if (fallback.success) return fallback;
    }
    throw err;
  }
}

export default {
  getMyProfile,
  createProfile,
  updateProfile,
  updateLocation,
  updateAvailability,
  getVendorStats,
  uploadStallImage,
  getCategories,
  searchVendors,
  getNearbyVendors,
  getPublicProfile
};
