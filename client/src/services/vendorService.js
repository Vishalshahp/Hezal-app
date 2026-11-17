import { fetchJson, uploadFormData, isVercelDeployment } from './api';
import {
  FALLBACK_CATEGORIES,
  queryFallbackVendors,
  queryFallbackVendorProfile,
} from '../data/fallbackData';

function isNetworkError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  return (
    err.code === 'BACKEND_UNAVAILABLE' ||
    err.code === 'TIMEOUT' ||
    err.name === 'TypeError' ||
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('connection refused') ||
    msg.includes('timed out') ||
    msg.includes('abort') ||
    msg.includes('html instead of json') ||
    msg.includes('failed to parse json') ||
    (typeof window !== 'undefined' && window.location.hostname.endsWith('vercel.app'))
  );
}

function shouldUseDirectFallback() {
  // If hosted on Vercel without an explicitly provided external backend URL, serve verified fallback directly for instant response
  return isVercelDeployment() && !import.meta.env.VITE_API_BASE_URL;
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
  if (shouldUseDirectFallback()) {
    return { success: true, data: { categories: FALLBACK_CATEGORIES } };
  }
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
  if (shouldUseDirectFallback()) {
    return queryFallbackVendors(params);
  }
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    }
    const qs = query.toString();
    const res = await fetchJson(`/vendors${qs ? `?${qs}` : ''}`);
    if (res && res.success && res.data) {
      return res;
    }
    return queryFallbackVendors(params);
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using verified stalls fallback:', err.message);
      return queryFallbackVendors(params);
    }
    return queryFallbackVendors(params);
  }
}

export async function getNearbyVendors(params = {}) {
  if (shouldUseDirectFallback()) {
    return queryFallbackVendors(params);
  }
  try {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    }
    const res = await fetchJson(`/vendors/nearby?${query.toString()}`);
    if (res && res.success && res.data) {
      return res;
    }
    return queryFallbackVendors(params);
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using nearby stalls fallback:', err.message);
      return queryFallbackVendors(params);
    }
    return queryFallbackVendors(params);
  }
}

export async function getPublicProfile(id) {
  if (shouldUseDirectFallback()) {
    const fallback = queryFallbackVendorProfile(id);
    if (fallback.success) return fallback;
  }
  try {
    return await fetchJson(`/vendors/${id}`);
  } catch (err) {
    if (isNetworkError(err)) {
      console.warn('Backend unavailable, using stall profile fallback:', err.message);
      const fallback = queryFallbackVendorProfile(id);
      if (fallback.success) return fallback;
    }
    const fallback = queryFallbackVendorProfile(id);
    if (fallback.success) return fallback;
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
