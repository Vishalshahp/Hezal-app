import { fetchJson, uploadFormData } from './api';

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
  return await fetchJson('/categories');
}

export async function searchVendors(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return await fetchJson(`/vendors${qs ? `?${qs}` : ''}`);
}

export async function getNearbyVendors(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  }
  return await fetchJson(`/vendors/nearby?${query.toString()}`);
}

export async function getPublicProfile(id) {
  return await fetchJson(`/vendors/${id}`);
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
