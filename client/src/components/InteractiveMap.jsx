import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import {
  Navigation,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { MAP_LAYERS, getGoogleDirectionsUrl } from '../services/googleMapsService';

// Create custom DivIcon for Leaflet markers
function createCustomPin(isSelected = false, isUser = false) {
  if (isUser) {
    return L.divIcon({
      className: 'user-location-pin',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-blue-500 rounded-full opacity-40 animate-ping"></div>
          <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  }

  const bgColor = isSelected ? '#ea580c' : '#16803D'; // Saffron/orange if selected, Brand green otherwise
  const ring = isSelected ? 'ring-4 ring-orange-300 shadow-xl scale-110' : 'shadow-md border-2 border-white';

  return L.divIcon({
    className: 'custom-stall-marker',
    html: `
      <div class="flex items-center justify-center w-9 h-9 rounded-full ${ring} text-white transition-all transform hover:scale-110" style="background-color: ${bgColor};">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
          <path d="M2 7h20"/>
          <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}

// Controller component to automatically pan and fit bounds
function MapController({ vendors, userLocation, selectedVendor }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (selectedVendor && selectedVendor.location?.coordinates) {
      const [lng, lat] = selectedVendor.location.coordinates;
      map.flyTo([lat, lng], 15, { duration: 1 });
      return;
    }

    const points = [];
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      points.push([userLocation.latitude, userLocation.longitude]);
    }

    if (vendors && vendors.length > 0) {
      vendors.forEach((v) => {
        if (v.location?.coordinates && v.location.coordinates.length === 2) {
          const [lng, lat] = v.location.coordinates;
          points.push([lat, lng]);
        }
      });
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, vendors, userLocation, selectedVendor]);

  return null;
}

export default function InteractiveMap({
  vendors = [],
  userLocation = null,
  selectedVendor = null,
  onSelectVendor,
  height = '500px'
}) {
  const [activeLayer, setActiveLayer] = useState('googleRoad');

  // Filter vendors with valid coordinates
  const validVendors = useMemo(() => {
    return vendors.filter(
      (v) =>
        v.location?.coordinates &&
        v.location.coordinates.length === 2 &&
        typeof v.location.coordinates[0] === 'number' &&
        typeof v.location.coordinates[1] === 'number'
    );
  }, [vendors]);

  // Default center: Ahmedabad, Gujarat (72.5714, 23.0225)
  const defaultCenter = useMemo(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      return [userLocation.latitude, userLocation.longitude];
    }
    if (validVendors.length > 0) {
      const [lng, lat] = validVendors[0].location.coordinates;
      return [lat, lng];
    }
    return [23.0225, 72.5714];
  }, [userLocation, validVendors]);

  const normalIcon = useMemo(() => createCustomPin(false), []);
  const selectedIcon = useMemo(() => createCustomPin(true), []);
  const userIcon = useMemo(() => createCustomPin(false, true), []);

  const currentTileLayer = MAP_LAYERS[activeLayer] || MAP_LAYERS.googleRoad;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-[#E5EAE5] shadow-card w-full z-0 group"
      style={{ height }}
    >
      {/* Top Map Layer Control Overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center bg-white/95 backdrop-blur-sm rounded-xl p-1 border border-[#E5EAE5] shadow-md">
        <button
          type="button"
          onClick={() => setActiveLayer('googleRoad')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeLayer === 'googleRoad'
              ? 'bg-[#16803D] text-white shadow-xs'
              : 'text-[#647067] hover:text-[#17231D]'
          }`}
        >
          Google Maps
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('googleSatellite')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeLayer === 'googleSatellite'
              ? 'bg-[#16803D] text-white shadow-xs'
              : 'text-[#647067] hover:text-[#17231D]'
          }`}
        >
          Satellite
        </button>
        <button
          type="button"
          onClick={() => setActiveLayer('openStreetMap')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
            activeLayer === 'openStreetMap'
              ? 'bg-[#16803D] text-white shadow-xs'
              : 'text-[#647067] hover:text-[#17231D]'
          }`}
        >
          Street
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          key={activeLayer}
          attribution={currentTileLayer.attribution}
          url={currentTileLayer.url}
          maxZoom={currentTileLayer.maxZoom}
        />

        <MapController
          vendors={validVendors}
          userLocation={userLocation}
          selectedVendor={selectedVendor}
        />

        {/* User Location Marker */}
        {userLocation?.latitude && userLocation?.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="p-1 text-center font-sans">
                <p className="text-xs font-bold text-[#17231D]">Your Detected Location</p>
                <p className="text-[11px] text-[#647067]">Searching nearby stalls within radius</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Vendor Stall Markers */}
        {validVendors.map((vendor) => {
          const [lng, lat] = vendor.location.coordinates;
          const isSelected =
            selectedVendor && (selectedVendor.id === vendor.id || selectedVendor._id === vendor.id);

          const directionsUrl = getGoogleDirectionsUrl(lat, lng, vendor.stallName);

          return (
            <Marker
              key={vendor.id || vendor._id}
              position={[lat, lng]}
              icon={isSelected ? selectedIcon : normalIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectVendor) onSelectVendor(vendor);
                }
              }}
            >
              <Popup>
                <div className="p-1 max-w-[220px] font-sans space-y-2">
                  {/* Thumbnail */}
                  {vendor.coverPhoto && (
                    <div className="h-20 w-full rounded-lg overflow-hidden bg-[#FAFAF5]">
                      <img
                        src={vendor.coverPhoto}
                        alt={vendor.stallName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    {/* Status badge */}
                    <div className="flex items-center space-x-1 mb-1">
                      {vendor.availabilityStatus === 'open' && (
                        <span className="inline-flex items-center text-[10px] font-bold text-[#16803D] bg-[#EDF7EF] border border-[#D1EAD7] px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Open
                        </span>
                      )}
                      {vendor.availabilityStatus === 'away' && (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          <AlertCircle className="h-2.5 w-2.5 mr-1" /> Away
                        </span>
                      )}
                      {vendor.availabilityStatus === 'closed' && (
                        <span className="inline-flex items-center text-[10px] font-bold text-[#647067] bg-[#FAFAF5] border border-[#E5EAE5] px-1.5 py-0.5 rounded">
                          <XCircle className="h-2.5 w-2.5 mr-1" /> Closed
                        </span>
                      )}

                      {vendor.distanceKm !== undefined && (
                        <span className="text-[10px] font-bold text-[#16803D] bg-[#EDF7EF] px-1.5 py-0.5 rounded">
                          {vendor.distanceKm} km
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-[#17231D] leading-tight">
                      {vendor.stallName}
                    </h4>

                    <p className="text-[11px] text-[#647067] line-clamp-1 mt-0.5">
                      {vendor.address?.area || vendor.address?.street}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-1.5 border-t border-[#E5EAE5] flex items-center justify-between gap-1 text-[11px]">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#FAFAF5] hover:bg-[#EDF7EF] text-[#17231D] border border-[#E5EAE5] font-medium transition-colors"
                      title="Open walking directions in Google Maps"
                    >
                      <Navigation className="h-3 w-3 text-[#16803D]" />
                      <span>Directions</span>
                    </a>

                    <Link
                      to={`/vendors/${vendor.id || vendor._id}`}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#16803D] hover:bg-[#14532D] text-white font-medium transition-colors"
                    >
                      <span>Stall</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
