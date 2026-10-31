/**
 * Geolocation & Walking Distance Utilities for Hezal Market
 * Formats in-person physical walking and driving distances to stalls.
 */

/**
 * Calculates geodesic distance between two [latitude, longitude] points in kilometers (Haversine formula).
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns human-friendly walking or short driving distance text.
 * e.g., "350 m away • 4 min walk" or "2.4 km away • 6 min ride"
 */
export function formatWalkingDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || isNaN(distanceKm)) return null;

  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    // Average walking speed ~ 5 km/h (12 mins per km)
    const walkMins = Math.max(1, Math.round(distanceKm * 12));
    return {
      rawKm: distanceKm,
      distanceText: `${meters} m away`,
      timeText: `${walkMins} min walk`,
      fullBadge: `${meters} m • ${walkMins} min walk`,
      mode: 'walk'
    };
  }

  // 1 km or more (short bike / auto ride)
  const km = distanceKm.toFixed(1);
  // Average city traffic speed ~ 25 km/h (~2.4 mins per km)
  const driveMins = Math.max(2, Math.round(distanceKm * 2.4));
  return {
    rawKm: distanceKm,
    distanceText: `${km} km away`,
    timeText: `${driveMins} min ride`,
    fullBadge: `${km} km • ${driveMins} min ride`,
    mode: 'drive'
  };
}

/**
 * Generates an external turn-by-turn navigation link for Google Maps.
 */
export function getNavigationUrl(coordinates, address) {
  if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
    const [lng, lat] = coordinates;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  }
  const parts = [address?.street, address?.area, address?.city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(parts)}&travelmode=walking`;
}
