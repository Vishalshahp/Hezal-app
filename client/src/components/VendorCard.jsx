import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Navigation,
  Store,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Tag
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/90 backdrop-blur-md text-white shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-ping"></span>
            Open Now
          </span>
        );
      case 'away':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/90 backdrop-blur-md text-white shadow-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            Away
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/70 backdrop-blur-md text-slate-200">
            <XCircle className="h-3 w-3 mr-1 text-slate-400" />
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

  // Color helper for category pills
  const getCategoryColor = (name = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('food') || lower.includes('snack') || lower.includes('chaat') || lower.includes('fast')) {
      return 'bg-amber-50 text-amber-800 border-amber-200/80';
    }
    if (lower.includes('fruit') || lower.includes('veg') || lower.includes('juice')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
    }
    if (lower.includes('tea') || lower.includes('chai') || lower.includes('coffee')) {
      return 'bg-orange-50 text-orange-800 border-orange-200/80';
    }
    if (lower.includes('craft') || lower.includes('art') || lower.includes('pottery')) {
      return 'bg-rose-50 text-rose-800 border-rose-200/80';
    }
    if (lower.includes('cloth') || lower.includes('fashion') || lower.includes('apparel')) {
      return 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
    }
    return 'bg-teal-50 text-teal-800 border-teal-200/80';
  };

  return (
    <div
      onClick={onSelect}
      className={`group bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-md scale-[1.01]'
          : 'border-slate-200/80 hover:border-emerald-300 hover:shadow-card-hover hover:-translate-y-1'
      }`}
    >
      {/* Cover / Thumbnail Header */}
      <div className="relative h-44 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 overflow-hidden">
        {vendor.coverPhoto ? (
          <img
            src={vendor.coverPhoto}
            alt={vendor.stallName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-primary-300 mb-2">
              <Store className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold text-slate-200">Local Verified Stall</span>
          </div>
        )}

        {/* Gradient overlay on cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-1.5">
            {getStatusBadge()}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-950/60 backdrop-blur-md text-white border border-white/10">
              {vendor.stallType === 'mobile' ? (
                <>
                  <Truck className="h-3 w-3 mr-1 text-amber-300" />
                  Mobile Stall
                </>
              ) : (
                <>
                  <Store className="h-3 w-3 mr-1 text-teal-300" />
                  Fixed Kiosk
                </>
              )}
            </span>
          </div>

          {/* Calculated Distance (if nearby) */}
          {vendor.distanceKm !== undefined && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white shadow-sm shadow-primary-900/30">
              <Navigation className="h-3 w-3 mr-1" />
              {vendor.distanceKm < 1
                ? `${vendor.distance} m`
                : `${vendor.distanceKm} km`}
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Categories */}
          {vendor.categories && vendor.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {vendor.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id || cat._id}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getCategoryColor(cat.name)}`}
                >
                  {cat.name}
                </span>
              ))}
              {vendor.categories.length > 2 && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                  +{vendor.categories.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Stall Name */}
          <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {vendor.stallName}
          </h3>

          {/* Tagline / Description */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {vendor.tagline || vendor.description}
          </p>
        </div>

        {/* Location & Freshness */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-start space-x-1.5">
            <MapPin className="h-4 w-4 text-primary-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium text-slate-700">
              {[vendor.address?.area, vendor.address?.city].filter(Boolean).join(', ') ||
                vendor.address?.street}
            </span>
          </div>

          {vendor.locationUpdatedAt && (
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Location confirmed: {formatLastUpdated(vendor.locationUpdatedAt)}</span>
            </div>
          )}
        </div>

        {/* Sample Products Pills */}
        {vendor.sampleProducts && vendor.sampleProducts.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1 mb-1.5">
              <Tag className="h-3 w-3 text-amber-500" />
              <span>Popular Items:</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {vendor.sampleProducts.map((p, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-slate-50 border border-slate-200 text-slate-700 max-w-[150px] truncate"
                >
                  <span className="truncate">{p.name}</span>
                  {p.price !== null && p.price !== undefined && (
                    <span className="ml-1 text-emerald-700 font-bold">₹{p.price}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* External Directions */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Open external navigation to published coordinates"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <Navigation className="h-3.5 w-3.5 text-primary-600" />
            <span>Directions</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>

          {/* Profile Link */}
          <Link
            to={`/vendors/${vendor.id || vendor._id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center space-x-1 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-all shadow-primary-600/20 hover:shadow-md"
          >
            <span>View Stall</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
