/**
 * Google Maps & Geocoding Integration Service
 * Provides Google Maps URL builders, tile layer configs, Google Places/Geocoding API integration,
 * and zero-cost fallback support.
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Available Tile Layer URLs
 */
export const MAP_LAYERS = {
  googleRoad: {
    name: 'Google Maps',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps',
    maxZoom: 20,
  },
  googleSatellite: {
    name: 'Google Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satellite',
    maxZoom: 20,
  },
  openStreetMap: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
};

/**
 * Generate Google Maps Walking / Driving Directions Link
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} [label] - Optional stall/destination label
 */
export function getGoogleDirectionsUrl(lat, lng, label = '') {
  if (lat && lng) {
    const dest = `${lat},${lng}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label || 'Local Market')}`;
}

/**
 * Generate Google Maps Place / Location Link
 */
export function getGoogleMapsLocationUrl(lat, lng, stallName = '') {
  if (lat && lng) {
    const q = stallName ? `${encodeURIComponent(stallName)}/@${lat},${lng},17z` : `${lat},${lng}`;
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stallName)}`;
}

/**
 * Reverse Geocode Coordinates to human-readable address
 * Uses Google Maps Geocoding API when VITE_GOOGLE_MAPS_API_KEY is available,
 * otherwise falls back to free OpenStreetMap Nominatim.
 */
export async function reverseGeocode(latitude, longitude) {
  if (!latitude || !longitude) return null;

  // 1. Try Google Maps Geocoding API if key configured
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const top = data.results[0];
        let street = '';
        let area = '';
        let city = '';
        let state = '';
        let postalCode = '';

        top.address_components.forEach((c) => {
          if (c.types.includes('route') || c.types.includes('sublocality_level_2')) {
            street = c.long_name;
          }
          if (c.types.includes('sublocality') || c.types.includes('sublocality_level_1') || c.types.includes('neighborhood')) {
            area = c.long_name;
          }
          if (c.types.includes('locality')) {
            city = c.long_name;
          }
          if (c.types.includes('administrative_area_level_1')) {
            state = c.long_name;
          }
          if (c.types.includes('postal_code')) {
            postalCode = c.long_name;
          }
        });

        return {
          formattedAddress: top.formatted_address,
          street,
          area,
          city,
          state,
          postalCode,
          source: 'google'
        };
      }
    } catch (err) {
      console.warn('Google Geocoding API failed, trying fallback:', err);
    }
  }

  // 2. Free OpenStreetMap Nominatim Fallback (No API key needed)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      return {
        formattedAddress: data.display_name,
        street: addr.road || addr.pedestrian || addr.suburb || '',
        area: addr.neighbourhood || addr.suburb || addr.residential || addr.city_district || '',
        city: addr.city || addr.town || addr.village || '',
        state: addr.state || '',
        postalCode: addr.postcode || '',
        source: 'nominatim'
      };
    }
  } catch (err) {
    console.warn('Fallback geocoding error:', err);
  }

  return null;
}

/**
 * Check if a custom Google Maps API Key is active
 */
export function hasGoogleMapsKey() {
  return Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.trim().length > 10);
}
