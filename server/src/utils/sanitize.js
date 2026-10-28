/**
 * Sanitization and regex security utilities
 */

/**
 * Safely escape regex metacharacters to prevent ReDoS and regex syntax errors
 * @param {string} string - Raw user search input
 * @returns {string} Escaped string safe for new RegExp()
 */
export function escapeRegex(string) {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip control characters and trim without invoking control regex
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (!str || typeof str !== 'string') return '';
  // Keep printable characters (code >= 32) plus standard whitespace (tab, newline)
  return str
    .split('')
    .filter((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 || code === 9 || code === 10 || code === 13;
    })
    .join('')
    .trim();
}

export default {
  escapeRegex,
  sanitizeString,
};
