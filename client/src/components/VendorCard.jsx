import React from 'react';
import { Link } from 'react-router-dom';
import { getStallCoverImage } from '../utils/stallImages';
import {
  MapPin,
  Clock,
  Navigation,
  Store,
  Truck,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function VendorCard({ vendor, isSelected, onSelect }) {
  if (!vendor) return null;

  // External directions link (Google Maps)
  const getDirectionsUrl = () => {
    if (vendor.location?.coordinates && vendor.location.coordinates.length === 2) {
      const [lng, lat] = vendor.location.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    const addressStr = [vendor.address?.street, vendor.address?.area, vendor.address?.city]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr)}`;
  };

  const getStatusBadge = () => {
    switch (vendor.availabilityStatus) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDF7EF]/95 backdrop-blur-md text-[#16803D] border border-[#D1EAD7] shadow-xs">
            <span className="relative flex h-2 w-2 mr-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16803D]"></span>
            </span>
            Open Now
          </span>
        );
      case 'away':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50/95 backdrop-blur-md text-amber-800 border border-amber-200 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            Away
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100/95 backdrop-blur-md text-stone-600 border border-stone-200">
            <span className="h-1.5 w-1.5 rounded-full bg-stone-400 mr-1.5"></span>
            Closed
          </span>
        );
    }
  };

  const formatLastUpdated = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const stallImage = getStallCoverImage(vendor);

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
        isSelected
          ? 'border-[#16803D] ring-2 ring-[#16803D]/25 shadow-card-hover -translate-y-1.5'
          : 'border-[#E5EAE5] hover:border-[#16803D]/50 hover:shadow-card-hover hover:-translate-y-1.5'
      }`}
    >
      {/* Cover / Stall Photo with Expanded Size */}
      <div className="relative aspect-[16/10] min-h-[220px] sm:min-h-[250px] bg-[#FAFAF5] overflow-hidden">
        {stallImage ? (
          <img
            src={stallImage}
            alt={vendor.stallName}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.classList.remove('hidden');
              }
            }}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
        ) : null}

        {/* Ambient Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none opacity-70 group-hover:opacity-50 transition-opacity"></div>

        {/* Fallback Artful Illustration */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#EDF7EF] via-[#FAFAF5] to-[#F4F5F0] ${
            stallImage ? 'hidden' : ''
          }`}
        >
          <div className="h-16 w-16 rounded-2xl bg-white shadow-xs border border-[#D1EAD7] flex items-center justify-center text-[#16803D] mb-2.5 group-hover:scale-110 transition-transform duration-300">
            <Store className="h-8 w-8" />
          </div>
          <span className="text-sm font-bold text-[#17231D] tracking-tight">
            Verified Local Stall
          </span>
          <span className="text-xs text-[#647067] flex items-center mt-1">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-[#16803D]" /> Community Seller
          </span>
        </div>

        {/* Top Badges (Floating on Image) */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white shadow-xs">
              {vendor.stallType === 'mobile' ? (
                <>
                  <Truck className="h-3.5 w-3.5 mr-1 text-[#22C55E]" />
                  Mobile
                </>
              ) : (
                <>
                  <Store className="h-3.5 w-3.5 mr-1 text-[#22C55E]" />
                  Fixed
                </>
              )}
            </span>
          </div>

          {/* Calculated Distance (if available) */}
          {vendor.distanceKm !== undefined && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#14532D] text-white shadow-sm backdrop-blur-xs">
              <Navigation className="h-3.5 w-3.5 mr-1 text-[#22C55E]" />
              {vendor.distanceKm < 1 ? `${vendor.distance} m` : `${vendor.distanceKm} km`}
            </span>
          )}
        </div>
      </div>

      {/* Card Content with Increased Dimensions & Legibility */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Categories */}
          {vendor.categories && vendor.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {vendor.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id || cat._id}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#EDF7EF] text-[#16803D] border border-[#D1EAD7]/70 group-hover:border-[#16803D]/40 transition-colors"
                >
                  {cat.name}
                </span>
              ))}
              {vendor.categories.length > 2 && (
                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-[#FAFAF5] text-[#647067] border border-[#E5EAE5]">
                  +{vendor.categories.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Stall Name */}
          <h3 className="font-display font-extrabold text-lg sm:text-xl text-[#17231D] group-hover:text-[#16803D] transition-colors line-clamp-1 leading-snug">
            {vendor.stallName}
          </h3>

          {/* Description / Tagline */}
          <p className="text-sm text-[#647067] line-clamp-2 leading-relaxed">
            {vendor.tagline || vendor.description}
          </p>
        </div>

        {/* Location & Status Info */}
        <div className="space-y-2 pt-3.5 border-t border-[#E5EAE5] text-sm text-[#647067]">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-[#16803D] shrink-0 mt-0.5" />
            <span className="line-clamp-1 text-[#17231D] font-semibold">
              {[vendor.address?.area, vendor.address?.city].filter(Boolean).join(', ') ||
                vendor.address?.street}
            </span>
          </div>

          {vendor.locationUpdatedAt && (
            <div className="flex items-center space-x-1.5 text-xs text-[#647067]">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#16803D]" />
              <span>Confirmed {formatLastUpdated(vendor.locationUpdatedAt)}</span>
            </div>
          )}
        </div>

        {/* Popular Items (if available) */}
        {vendor.sampleProducts && vendor.sampleProducts.length > 0 && (
          <div className="pt-2.5 border-t border-[#E5EAE5]">
            <span className="text-xs font-bold text-[#647067] uppercase tracking-wider block mb-1.5">
              Popular items
            </span>
            <div className="flex flex-wrap gap-2">
              {vendor.sampleProducts.slice(0, 3).map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-[#FAFAF5] border border-[#E5EAE5] text-[#17231D] max-w-[200px] truncate hover:border-[#16803D]/40 transition-colors"
                >
                  <span className="truncate font-medium">{p.name}</span>
                  {p.price !== null && p.price !== undefined && (
                    <span className="ml-1.5 text-[#16803D] font-bold">₹{p.price}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3.5 border-t border-[#E5EAE5] flex items-center justify-between gap-3">
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#17231D] hover:text-[#16803D] hover:bg-[#EDF7EF] px-3.5 py-2.5 rounded-xl border border-[#E5EAE5] hover:border-[#D1EAD7] transition-all cursor-pointer active:scale-95"
          >
            <Navigation className="h-4 w-4 text-[#16803D]" />
            <span>Directions</span>
            <ExternalLink className="h-3 w-3 text-[#647067]" />
          </a>

          <Link
            to={`/vendors/${vendor.id || vendor._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1.5 text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 rounded-xl bg-[#16803D] hover:bg-[#14532D] text-white shadow-xs hover:shadow-sm transition-all active:scale-95 group/btn"
          >
            <span>View Stall</span>
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
