/**
 * Helper to normalize and resolve media URLs
 * Handles remote Cloudinary URLs, local backend /uploads paths, and data/blob URIs.
 */
export function getImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Prepend backend origin to relative /uploads path
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${backendOrigin}${cleanPath}`;
}

export default getImageUrl;
