import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import InteractiveMap from '../components/InteractiveMap';
import ReportModal from '../components/ReportModal';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Package,
  Loader2,
  ArrowLeft,
  Search,
  ShieldCheck,
  Truck
} from 'lucide-react';

export default function PublicVendorProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    async function loadStall() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await vendorService.getPublicProfile(id);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setProducts(res.data.products || []);
        } else {
          setErrorMsg(res.message || 'Vendor stall not found.');
        }
      } catch (err) {
        console.error('Failed to load vendor stall profile:', err);
        setErrorMsg(
          err.message || 'This vendor stall is currently not publicly available or pending review.'
        );
      } finally {
        setLoading(false);
      }
    }
    loadStall();
  }, [id]);

  if (loading) {
    return (
      <div className="h-96 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="text-xs font-semibold text-slate-500">
          Loading vendor stall details...
        </span>
      </div>
    );
  }

  if (errorMsg || !profile) {
    return (
      <div className="max-w-2xl mx-auto my-12 rounded-3xl bg-white border border-slate-200 p-10 text-center space-y-4 shadow-sm">
        <Store className="h-12 w-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold font-display text-slate-900">
          Vendor Stall Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          {errorMsg || 'The requested vendor stall profile is not available or has not yet been approved.'}
        </p>
        <div className="pt-2">
          <Link
            to="/explore"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Explore Stalls</span>
          </Link>
        </div>
      </div>
    );
  }

  // Directions URL
  const getDirectionsUrl = () => {
    if (profile.location?.coordinates && profile.location.coordinates.length === 2) {
      const [lng, lat] = profile.location.coordinates;
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    const addressStr = [profile.address?.street, profile.address?.area, profile.address?.city]
      .filter(Boolean)
      .join(', ');
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr)}`;
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

  // Filter products by keyword
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Navigation Back Link */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* 1. Stall Hero & Identification Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-56 sm:h-72 bg-gradient-to-tr from-slate-900 to-primary-950 overflow-hidden">
          {profile.coverPhoto ? (
            <img
              src={profile.coverPhoto}
              alt={profile.stallName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6">
              <Store className="h-16 w-16 text-primary-400 mb-2 opacity-80" />
              <span className="text-sm font-semibold text-slate-300">
                Verified Local Street Stall
              </span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center space-x-2">
              {profile.availabilityStatus === 'open' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Open Now
                </span>
              )}
              {profile.availabilityStatus === 'away' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-md">
                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                  Away Temporarily
                </span>
              )}
              {profile.availabilityStatus === 'closed' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white shadow-md">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Closed
                </span>
              )}

              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900/80 backdrop-blur text-white">
                {profile.stallType === 'mobile' ? (
                  <>
                    <Truck className="h-3.5 w-3.5 mr-1 text-primary-300" />
                    Mobile Pushcart / Stall
                  </>
                ) : (
                  <>
                    <Store className="h-3.5 w-3.5 mr-1 text-primary-300" />
                    Fixed Kiosk / Stand
                  </>
                )}
              </span>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur border border-white/30 text-white">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-300" />
              Approved Vendor
            </span>
          </div>
        </div>

        {/* Stall Details Header */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              {/* Category chips */}
              {profile.categories && profile.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {profile.categories.map((c) => (
                    <span
                      key={c.id || c._id}
                      className="px-2.5 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
                {profile.stallName}
              </h1>

              {profile.tagline && (
                <p className="text-sm sm:text-base font-medium text-primary-600">
                  {profile.tagline}
                </p>
              )}

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {profile.description}
              </p>
            </div>

            {/* Quick Actions (Directions & Contact) */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
              <a
                href={getDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <Navigation className="h-4 w-4" />
                <span>Get Walking Directions</span>
                <ExternalLink className="h-3.5 w-3.5 text-primary-200" />
              </a>

              {profile.contactPublic?.phone && (
                <a
                  href={`tel:${profile.contactPublic.phone}`}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>Call: {profile.contactPublic.phone}</span>
                </a>
              )}

              {profile.contactPublic?.whatsapp && (
                <a
                  href={`https://wa.me/${profile.contactPublic.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp Inquiry</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid: Location & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Map & Physical Stall Location */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Published Physical Stall Location
                </h3>
              </div>

              {profile.locationUpdatedAt && (
                <span className="text-[11px] text-slate-400">
                  Updated: {formatLastUpdated(profile.locationUpdatedAt)}
                </span>
              )}
            </div>

            {/* Address Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">{profile.address?.street}</p>
              <p>
                {profile.address?.area}, {profile.address?.city}, {profile.address?.state}{' '}
                {profile.address?.postalCode}
              </p>
              {profile.address?.landmark && (
                <p className="text-slate-500 italic">Landmark: {profile.address.landmark}</p>
              )}
            </div>

            {/* Interactive Leaflet Map */}
            {profile.location?.coordinates && (
              <div className="space-y-2">
                <InteractiveMap
                  vendors={[profile]}
                  height="340px"
                  selectedVendor={profile}
                />
                <p className="text-[11px] text-slate-400 text-center">
                  * Coordinates are self-reported by the vendor. Directions open in external mapping apps.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Weekly Schedule */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <h3 className="font-bold text-base text-slate-900">Weekly Operating Hours</h3>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {profile.openingHours && profile.openingHours.length > 0 ? (
                profile.openingHours.map((h, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 w-16">{h.day}</span>
                    {h.isClosed ? (
                      <span className="text-red-500 font-medium">Closed</span>
                    ) : (
                      <span className="text-slate-600 font-mono">
                        {h.open} — {h.close}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-3">Schedule not specified.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Product Catalogue Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
                Stall Product Catalogue
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Browse available items currently offered at this stall
            </p>
          </div>

          {/* Product Search */}
          {products.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  {prod.image ? (
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-28 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> In Stock
                    </span>

                    {prod.category?.name && (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {prod.category.name}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-tight">{prod.name}</h4>

                  {prod.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Price</span>
                  {prod.price !== null && prod.price !== undefined ? (
                    <span className="font-bold text-base text-slate-900">₹{prod.price}</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 italic">
                      Price on request / variable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <Package className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500">
              {productSearch
                ? `No products match "${productSearch}".`
                : 'This vendor has not published any active items to their catalogue yet.'}
            </p>
          </div>
        )}

        {/* Community Moderation Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <span>Notice something wrong with this stall's location or listing?</span>
          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-red-700 font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            <span>Report Inaccurate Listing</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetVendorId={id}
        stallName={profile?.stallName || 'Vendor Stall'}
      />
    </div>
  );
}
