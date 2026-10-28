import { fetchJson } from './api';

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      query.append(key, value);
    }
  }
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

/**
 * 1. Admin Dashboard Metrics
 */
export async function getDashboardMetrics() {
  return await fetchJson('/admin/metrics');
}

/**
 * 2. Vendor Approval Queue & Moderation
 */
export async function getAdminVendors(params = {}) {
  return await fetchJson(`/admin/vendors${buildQuery(params)}`);
}

export async function getAdminVendorDetails(id) {
  return await fetchJson(`/admin/vendors/${id}`);
}

export async function updateAdminVendorStatus(id, { action, reason = '' }) {
  return await fetchJson(`/admin/vendors/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ action, reason }),
  });
}

/**
 * 3. Category Administration
 */
export async function getAdminCategories(params = {}) {
  return await fetchJson(`/admin/categories${buildQuery(params)}`);
}

export async function createAdminCategory(data) {
  return await fetchJson('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdminCategory(id, data) {
  return await fetchJson(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function toggleAdminCategoryStatus(id) {
  return await fetchJson(`/admin/categories/${id}/toggle-status`, {
    method: 'PATCH',
  });
}

export async function deleteAdminCategory(id) {
  return await fetchJson(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 4. Listing Moderation & User Reports
 */
export async function getAdminReports(params = {}) {
  return await fetchJson(`/admin/reports${buildQuery(params)}`);
}

export async function updateAdminReport(id, data) {
  return await fetchJson(`/admin/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function submitPublicReport(data) {
  return await fetchJson('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 5. User Management & Moderation
 */
export async function getAdminUsers(params = {}) {
  return await fetchJson(`/admin/users${buildQuery(params)}`);
}

export async function updateAdminUserStatus(id, { action, reason = '' }) {
  return await fetchJson(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ action, reason }),
  });
}

/**
 * 6. Audit Trail Logs
 */
export async function getAdminAuditLogs(params = {}) {
  return await fetchJson(`/admin/audit-logs${buildQuery(params)}`);
}
